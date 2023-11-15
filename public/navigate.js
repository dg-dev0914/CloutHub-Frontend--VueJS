const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const appLink = isMobile ? '/#/tabs' : '/#/forum';

if (isMobile) {
  if (window.location.hash.includes('setnewpassword')) {
    window.location.href = `https://m.clouthub.com/${window.location.hash.replace(
      '/onboarding',
      ''
    )}`;
  } else if (window.location.href.indexOf('share') > -1) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params.text) {
      window.location.replace(
        `https://m.clouthub.com${appLink}/home?url=${params.url}&title=${params.text}`
      );
    } else {
      window.location.replace(
        `https://m.clouthub.com${appLink}/home?url=${params.url}`
      );
    }
  } else if (
    window.location.href.indexOf('posts') > -1 ||
    window.location.href.indexOf('videos') > -1 ||
    window.location.href.indexOf('news') > -1 ||
    window.location.href.indexOf('groups') > -1 ||
    window.location.href.indexOf('channel') > -1 ||
    window.location.href.indexOf('users') > -1
  ) {
    const pathArr = window.location.hash.split('#');
    if (window.location.href.indexOf('users') > -1) {
      window.location.href = `https://m.clouthub.com${appLink}${window.location.hash.replace(
        '#/users/id',
        '/connections/profile'
      )}`;
    } else {
      const path =
        window.location.href.indexOf('posts') > -1
          ? `${appLink}/home${pathArr[1]}`
          : `${appLink}${pathArr[1]}`;
      window.location.replace(`https://m.clouthub.com${path}`);
    }
  } else {
    window.location.href = 'https://m.clouthub.com/';
  }
} else if (!isMobile && window.location.href.indexOf('share') > -1) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (params.text) {
    window.location.replace(
      `${appLink}?url=${params.url}&title=${params.text}`
    );
  } else {
    window.location.replace(`${appLink}?url=${params.url}`);
  }
}
