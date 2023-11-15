import $apollo from './apollo';
import $router from '../router/index';
import GetShortlinkInfo from '@/gql/general/GetShortlinkInfo.gql';

const pathMap = {
  GROUP: 'GroupDetail',
  CHANNEL: 'VideoProfile',
  USER: 'Profile',
  VIDEO: 'VideoDetail',
  POST: 'PostDetail',
  MEETING: 'MeetingDetail',
};

async function navigate(url) {
  url = url.replace('https://clouthub.com', '').replace('http://clouthub.com', '').replace('https://preview-dev.clouthub.com', '').replace('http://preview-dev.clouthub.com', '');
  let type = 'USER';
  let identifier = url.replace('/', '');
  if (!identifier.startsWith('@')) {
    identifier = '@' + identifier;
  }
  if (url.startsWith('/m/')) {
    type = 'MEETING';
    identifier = url.replace('/m/', '');
  } else if (url.startsWith('/g/')) {
    type = 'GROUP';
    identifier = url.replace('/g/', '');
  } else if (url.startsWith('/c/')) {
    type = 'CHANNEL';
    identifier = url.replace('/c/', '');
  } else if (url.startsWith('/p/')) {
    type = 'POST';
    identifier = url.replace('/p/', '');
  } else if (url.startsWith('/v/')) {
    type = 'VIDEO';
    identifier = url.replace('/v/', '');
  }
  try {
    const resp = await $apollo.query({
      query: GetShortlinkInfo,
      variables: { type, identifier }
    });
    const id = resp.data.id;
    const path = pathMap[type];
    // alert(path + ':' + id);
    $router.push({ name: path, params: { id } });
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

export default {
  navigate,
};
