import $aws from '@/services/aws';
import $utils from '@/services/utils';

const formatAttachment = (attachment, type) => {
  if (attachment instanceof File) {
    return {
      contentType: attachment.type,
      size: attachment.size,
      url: attachment.url,
      name: attachment.name,
      type,
    };
  }
  return attachment;
}

const uploadImages = async (files) => {
  try {
    const filesToUpload = files.filter(file => file instanceof File);
    const urls = await $aws.bulkUpload(filesToUpload);
    let index = 0;
    files.forEach((file) => {
      if (file && file === filesToUpload[index]) {
        file.url = urls[index];
        index++;
      }
    });
    const result = files.map(file => formatAttachment(file, 'image'));
    return files.map(file => formatAttachment(file, 'image'));
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading images');
  }
}

const uploadVideo = async (file) => {
  try {
    // If it's not a file, already uploaded, so just return;
    if (!(file instanceof File)) return file;

    // set thumb to the video thumbnail as a file. if there isn't one, create one
    let thumb = null;
    if (file.thumbnail && file.thumbnail.indexOf('blob:') === 0) thumb = $utils.blobToFile(file.thumbnail, 'preview.png');
    if (file.thumbnail && file.thumbnail instanceof File) thumb = file.thumbnail;
    if (!file.thumbnail) {
      const thumbDataUrl = await $utils.generateVideoThumbnail(file);
      thumb = $utils.blobToFile(thumbDataUrl);
    }

    const urls = await $aws.bulkUpload([file, thumb]);
    file.url = urls[0];
    const video = formatAttachment(file, 'video');
    video.thumbUrl = urls[1];
    return video;
  } catch(e) {
    console.error(e);
    throw new Error('Error uploading video');
  }
}

const uploadDocument = async (file) => {
  try {
    if (! (file instanceof File)) return file;
    file.url = await $aws.uploadFile(file);
    return formatAttachment(file, 'document');
  } catch (e) {
    console.error(e);
    throw new Error('Error uploading document');
  }
}

export default {
  uploadImages,
  uploadVideo,
  uploadDocument,
};
