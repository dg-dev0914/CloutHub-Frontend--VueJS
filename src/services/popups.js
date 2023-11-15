import * as uuid from 'uuid';
import $bus from '@/services/bus';

const alert = async (options) => {
  options = initOptions(options);
  return openPopup(options, 'alert');
};

const confirm = async (options) => {
  options = initOptions(options);
  return openPopup(options, 'confirm');
};

const prompt = async (options) => {
  options = initOptions(options);
  return openPopup(options, 'prompt');
};

const confirmDelete = async (options) => {
  options = initOptions(options);
  if (!options.variant) options.variant = 'danger';
  if (!options.okLabel) options.okLabel = 'Delete';
  return openPopup(options, 'confirm');
};
const confirmClose = async (options) => {
  options = initOptions(options);
  if (!options.variant) options.variant = 'danger';
  if (!options.okLabel) options.okLabel = 'OK';
  return openPopup(options, 'confirm');
};

const initOptions = (options) => {
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }
  return options;
};

const openPopup = async (options, type) =>
  new Promise((resolve, reject) => {
    const popupId = `popup-alert-${uuid.v4()}`;
    $bus.$once(popupId, (response) => {
      resolve(response);
    });
    $bus.$emit('show-popup', { ...options, type, popupId });
  });

export default {
  alert,
  confirm,
  prompt,
  confirmDelete,
  confirmClose,
};
