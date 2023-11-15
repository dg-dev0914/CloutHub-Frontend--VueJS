import $popups from '@/services/popups';

let asked = false;

function requestTap() {
  return new Promise((resolve, reject) => {
    if (!asked) {
      asked = true;
      $popups.alert({
        title: 'Enable sound',
        message:
          'Your browser has disabled audio from auto-playing. Tap OK to enable audio.',
      }).then(resolve);
    } else {
      document.body.addEventListener('click', resolve);
    }
  });
}

export default {
  requestTap,
}
