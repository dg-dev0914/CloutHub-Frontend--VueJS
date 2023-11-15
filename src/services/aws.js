import SignUploadComplete from '@/gql/general/SignUploadComplete.gql';
import StartMultipartUpload from '@/gql/general/StartMultipartUpload.gql';
import FinishMultipartUpload from '@/gql/general/FinishMultipartUpload.gql';
import $apollo from './apollo';
import $bus from './bus';

const FORUM_BUCKET = 'forum-clouthub';
const PROFILE_BUCKET = 'profile-clouthub';
const BYTES_PER_GIGABYTE = 2 ** 30;
const MIN_FILE_SIZE_FOR_MULTIPART_UPLOAD = BYTES_PER_GIGABYTE * 4;

export class Uploader {
  constructor(options) {
    // this must be bigger than or equal to 5MB,
    // otherwise AWS will respond with:
    // "Your proposed upload is smaller than the minimum allowed size"
    this.bucket = options.bucket || FORUM_BUCKET;
    this.chunkSize = options.chunkSize || BYTES_PER_GIGABYTE;
    // number of parallel uploads
    this.threadsQuantity = Math.min(options.threadsQuantity || 5, 15);
    this.file = options.file;
    this.fileName = options.fileName;
    this.aborted = false;
    this.uploadedSize = 0;
    this.progressCache = {};
    this.activeConnections = {};
    this.parts = [];
    this.uploadedParts = [];
    this.uploadId = null;
    this.uploadBucket = null;
    this.uploadKey = null;
    this.onProgressFn = () => {};
    this.onErrorFn = () => {};
    this.onCompleteFn = () => {};
  }

  // starting the multipart upload request
  start() {
    this.initialize();
  }

  async initialize() {
    try {
      // retrieving the pre-signed URLs
      const numberOfparts = Math.ceil(this.file.size / this.chunkSize);

      const result = await $apollo.mutate({
        mutation: StartMultipartUpload,
        variables: {
          bucket: this.bucket,
          type: this.file.type,
          parts: numberOfparts,
        },
      });
      const upload = result.data.upload;

      const newParts = upload.signedUrls.map((signedUrl, index) => ({
        signedUrl,
        partNumber: index + 1,
      }));
      this.parts.push(...newParts);
      this.uploadId = upload.uploadId;
      this.uploadKey = upload.key;
      this.uploadBucket = upload.bucket;

      this.sendNext();
    } catch (error) {
      await this.complete(error);
    }
  }

  sendNext() {
    const activeConnections = Object.keys(this.activeConnections).length;

    if (activeConnections >= this.threadsQuantity) {
      return;
    }

    if (!this.parts.length) {
      if (!activeConnections) {
        this.complete();
      }

      return;
    }

    const part = this.parts.pop();

    if (this.file && part) {
      const sentSize = (part.partNumber - 1) * this.chunkSize;
      const chunk = this.file.slice(sentSize, sentSize + this.chunkSize);

      const sendChunkStarted = () => {
        this.sendNext();
      };

      this.sendChunk(chunk, part, sendChunkStarted)
        .then(() => this.sendNext())
        .catch((error) => {
          this.parts.push(part);

          this.complete(error);
        });
    }
  }

  // terminating the multipart upload request on success or failure
  async complete(error) {
    if (error && !this.aborted) {
      this.onErrorFn(error);
      return;
    }

    if (error) {
      this.onErrorFn(error);
      return;
    }

    try {
      await this.sendCompleteRequest();
    } catch (e) {
      this.onErrorFn(e);
    }
  }

  // finalizing the multipart upload request on success by calling
  // the finalization API
  async sendCompleteRequest() {
    if (this.uploadId && this.uploadKey) {
      const etags = this.uploadedParts
        .sort((a, b) => a.partNumber - b.partNumber)
        .map(({ eTag }) => eTag);

      const { data } = await $apollo.mutate({
        mutation: FinishMultipartUpload,
        variables: {
          bucket: this.uploadBucket,
          key: this.uploadKey,
          uploadId: this.uploadId,
          etags,
        },
      });

      this.onCompleteFn(data.url);
    }
  }

  sendChunk(chunk, part, sendChunkStarted) {
    return new Promise((resolve, reject) => {
      this.upload(chunk, part, sendChunkStarted)
        .then((status) => {
          if (status !== 200) {
            reject(new Error('Failed chunk upload'));
            return;
          }

          resolve();
        })
        .catch((error) => reject(error));
    });
  }

  // calculating the current progress of the multipart upload request
  handleProgress(part, event) {
    if (this.file) {
      if (
        event.type === 'progress' ||
        event.type === 'error' ||
        event.type === 'abort'
      ) {
        this.progressCache[part] = event.loaded;
      }

      if (event.type === 'uploaded') {
        this.uploadedSize += this.progressCache[part] || 0;
        delete this.progressCache[part];
      }

      const inProgress = Object.keys(this.progressCache)
        .map(Number)
        // eslint-disable-next-line no-return-assign
        .reduce((memo, id) => (memo += this.progressCache[id]), 0);

      const sent = Math.min(this.uploadedSize + inProgress, this.file.size);

      const total = this.file.size;

      const percentage = Math.round((sent / total) * 100);

      this.onProgressFn({
        sent,
        total,
        percentage,
      });
    }
  }

  // uploading a part through its pre-signed URL
  upload(file, part, sendChunkStarted) {
    // uploading each part with its pre-signed URL
    return new Promise((resolve, reject) => {
      if (this.uploadId && this.uploadKey) {
        // - 1 because partNumber is an index starting from 1 and not 0
        // eslint-disable-next-line no-multi-assign
        const xhr = (this.activeConnections[part.partNumber - 1] =
          new XMLHttpRequest());

        sendChunkStarted();

        const progressListener = this.handleProgress.bind(
          this,
          part.partNumber - 1
        );

        xhr.upload.addEventListener('progress', progressListener);

        xhr.addEventListener('error', progressListener);
        xhr.addEventListener('abort', progressListener);
        xhr.addEventListener('loadend', progressListener);

        xhr.open('PUT', part.signedUrl);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            // retrieving the eTag parameter from the HTTP headers
            const eTag = xhr.getResponseHeader('ETag');

            if (eTag) {
              const uploadedPart = {
                partNumber: part.partNumber,
                // removing the " enclosing carachters from
                // the raw eTag
                eTag: eTag.replaceAll('"', ''),
              };

              this.uploadedParts.push(uploadedPart);

              resolve(xhr.status);
              delete this.activeConnections[part.partNumber - 1];
            }
          }
        };

        xhr.onerror = (error) => {
          reject(error);
          delete this.activeConnections[part.partNumber - 1];
        };

        xhr.onabort = () => {
          reject(new Error('Upload canceled by user'));
          delete this.activeConnections[part.partNumber - 1];
        };

        xhr.send(file);
      }
    });
  }

  onProgress(onProgress) {
    this.onProgressFn = onProgress;
    return this;
  }

  onError(onError) {
    this.onErrorFn = onError;
    return this;
  }

  onComplete(onComplete) {
    this.onCompleteFn = onComplete;
    return this;
  }

  abort() {
    Object.keys(this.activeConnections)
      .map(Number)
      .forEach((id) => {
        this.activeConnections[id].abort();
      });

    this.aborted = true;
  }
}

/**
 * @param {File} file
 * @param {string} bucket
 * @param {Function} progressCallback
 * @param {number} fileIndex
 *
 * @returns {Promise<void>}
 */
function uploadMultipart(file, bucket, progressCallback, fileIndex) {
  console.info('AWS | uploadMultipart', {
    file,
    bucket,
    fileIndex,
    progressCallback,
  });

  return new Promise((resolve, reject) => {
    new Uploader({
      file,
      fileName: file.name,
      bucket,
    })
      .onComplete(resolve)
      .onProgress(({ percentage }) => progressCallback(percentage, fileIndex))
      .onError(reject)
      .start();
  });
}

/**
 * @param {string} bucketType
 * @returns {string}
 */
function getBucketByType(bucketType) {
  return bucketType === 'forum' ? FORUM_BUCKET : PROFILE_BUCKET;
}

/**
 * @param {File} file
 * @param {string} bucketType
 * @param {Function} progressCallback
 * @param {number} fileIndex
 *
 * @returns {Promise<void>}
 */
const _upload = async (file, bucketType, progressCallback, fileIndex) => {
  bucketType = bucketType || 'forum';
  const bucket = getBucketByType(bucketType);

  if ((file.size > MIN_FILE_SIZE_FOR_MULTIPART_UPLOAD) && (file.type.includes('video/'))) {
    return uploadMultipart(file, bucket, progressCallback, fileIndex);
  }

  const resp = await $apollo.query({
    query: SignUploadComplete,
    fetchPolicy: 'network-only',
    variables: {
      bucket,
      type: file.type,
      r: Date.now() + fileIndex,
    },
  });
  const uploadInfo = resp.data.sign_upload_complete;
  console.log('UploadInfo', uploadInfo);
  await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', uploadInfo.upload_url);
    request.upload.addEventListener('progress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      progressCallback(percentage, fileIndex);
    });
    request.addEventListener('load', (e) => {
      if (request.status == 200) {
        resolve();
      } else {
        reject();
      }
    });
    request.send(file);
  });
  return uploadInfo.download_url;
};

const uploadFile = async (file, progressCallback, bucketType) => {
  const progressListener = (percentage) => {
    $bus.$emit('aws-upload-progress', { type: file.type, value: percentage });
    progressCallback && progressCallback(percentage);
  };
  const url = await _upload(file, bucketType, progressListener, 0);
  return url;
};

const uploadDataURL = async (
  dataURL,
  filename,
  progressCallback,
  bucketType
) => {
  const blob = await fetch(dataURL).then((r) => r.blob());
  const file = new File([blob], filename, {
    lastModified: Date.now(),
    type: blob.type,
  });
  return uploadFile(file, progressCallback, bucketType);
};

const bulkUpload = async (files, progressCallback, bucketType) => {
  const progresses = files.map((f) => 0);
  const progressListener = (percentage, index) => {
    progresses[index] = percentage;
    let totalProgress = 0;
    progresses.forEach((prog) => {
      totalProgress += prog / progresses.length;
    });
    totalProgress = Math.round(totalProgress);
    const fileType = files[0] ? files[0].type : null;
    $bus.$emit('aws-upload-progress', {
      type: fileType,
      value: totalProgress,
      multiple: files.length > 1,
    });
    progressCallback && progressCallback(totalProgress);
  };
  const urls = await Promise.all(
    Object.values(files).map((file, index) =>
      _upload(file, bucketType, progressListener, index)
    )
  );
  return urls;
};

export default {
  uploadFile,
  uploadDataURL,
  bulkUpload,
};
