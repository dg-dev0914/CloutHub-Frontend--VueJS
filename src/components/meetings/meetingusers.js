let audioLevels = {};
let users = {};

function setAudioLevel(numericId, level) {
  audioLevels[numericId] = level;
}

function getAudioLevel(numericId) {
  return audioLevels[numericId] || 0;
}

function register(numericId, user) {
  users[numericId] = user;
}

function getUser(numericId) {
  return users[numericId];
}

export default {
  setAudioLevel,
  getAudioLevel,
  register,
  getUser,
};
