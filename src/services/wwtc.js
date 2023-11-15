/* eslint-disable consistent-return */
import axios from 'axios';

const WWTC_GET_LANGUAGES_LINK =
  'https://core.worldwidetechconnections.com/languages';

const getAvailableForTranslateLanguages = async () => {
  try {
    const availableLanguages = await axios.get(WWTC_GET_LANGUAGES_LINK);
    return availableLanguages.data;
  } catch (error) {
    console.log('error when getting available for translate languages:', error);
  }
};

export default {
  getAvailableForTranslateLanguages,
};
