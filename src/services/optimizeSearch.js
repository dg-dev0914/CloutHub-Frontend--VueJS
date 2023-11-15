/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import axios from 'axios';

const makeRequestCreator = () => {
  let token;
  return async (query) => {
    // Check if we made a request
    if (token) {
      // Cancel the previous request before making a new request
      token.cancel();
    }
    // Create a new CancelToken
    token = axios.CancelToken.source();
    try {
      const res = await axios(query, { cancelToken: token.token });
      const result = res.data;
      return result;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle if request was cancelled
      } else {
        // Handle usual errors
      }
    }
  };
};

export const avoidUnnecessarySearch = makeRequestCreator();
