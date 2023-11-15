const selectFiles = (filetype, single) =>
  new Promise((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = !single;
    fileInput.accept = filetype; // === 'image' ? 'image/*, video/*' : 'application/pdf';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => {
      const output = single ? fileInput.files[0] : fileInput.files;
      resolve(output);
      document.body.removeChild(fileInput); // Required for iOS
    });
    document.body.appendChild(fileInput); // Required for iOS
    fileInput.click();
  });

const selectFile = (filetype) => selectFiles(filetype, true);

const getSelectedFileInfo = (file) => {
  const dataurl = URL.createObjectURL(file);
  const fileinfo = {
    type: file.type,
    size: file.size,
    name: file.name,
  };
  const attachment = { ...fileinfo, dataurl };
  return attachment;
};

function blobToFile(theBlob, fileName) {
  return new File([theBlob], fileName, {
    lastModified: new Date().getTime(),
    type: theBlob.type,
  });
}

export function sortByName(a, b) {
  return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
}

function generateVideoThumbnail(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.addEventListener('loadedmetadata', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.addEventListener('timeupdate', () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        resolve(canvas.toDataURL());
      });
      video.currentTime = Math.floor(video.duration / 5);
      // this.videoAttachment.thumburl = await this.generateThumbnailImage(video, canvas, Math.floor(duration / 5));
    });
  });
}

const dataURLtoFile = async (dataURL, filename) => {
  if (!dataURL || !dataURL.startsWith('data:')) return dataURL;
  const blob = await fetch(dataURL).then((r) => r.blob());
  return blobToFile(blob, filename);
};

export const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export default {
  selectFile,
  selectFiles,
  getSelectedFileInfo,
  blobToFile,
  generateVideoThumbnail,
  dataURLtoFile,
};
