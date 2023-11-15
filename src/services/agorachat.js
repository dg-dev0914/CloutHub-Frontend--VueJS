import AgoraRTM from 'agora-rtm-sdk';
import GetAgoraChatToken from '@/gql/meetings/GetAgoraChatToken.gql';
import $apollo from './apollo';
import $auth from '@/services/auth';

let uid;
let client;
let channels = {};
let listeners = [];
let channelCounts = {};
let liveStream = false
async function connect(via) {
  if(via === 'post') liveStream = true
  const uid = $auth.getUserId() || `guest.${Date.now()}`;
  const tokenData = await $apollo.query({
    query: GetAgoraChatToken,
    variables: {
      uid: uid,
    },
  });
  const token = tokenData.data.token;
  if (!client) {
    client = AgoraRTM.createInstance(process.env.VUE_APP_AGORA_ID);
    client.setParameters({
      logFilter: AgoraRTM.LOG_FILTER_ERROR,
    });
    await client.login({ uid, token });
    client.on('MessageFromPeer', function (message, peerId) {
    });
    client.on('ConnectionStateChanged', function (state, reason) {
      console.log('Connection State Changed', state, reason);
    });
  }
}


function handleMessage(roomType, roomId, messageText) {
  listeners.filter((l) => (
    l.roomType == roomType
    && l.roomId == roomId
    && l.key == messageText
  )).forEach((l) => {
    l.handler();
  });
}

async function joinRoom(roomType, roomId) {
  const channelId = `${roomType}:${roomId}`;
  if (!channels[channelId]) {
    let channel = client.createChannel(channelId)
    channel.on('ChannelMessage', function (message, memberId) {
      handleMessage(roomType, roomId, message.text);
    })
    channel.on('MemberJoined', function (memberId) {
    })
    channel.on('MemberLeft', function (memberId) {
    })
    await channel.join();
    channels[channelId] = channel;
    console.log('Joined Channel', channelId);
  } else {
    channels[channelId].join();
  }
}

async function leaveRoom(roomType, roomId) {
  const channelId = `${roomType}:${roomId}`;
  const channel = channels[channelId];
  await channel.leave();
}

function sendRoom(roomType, roomId, type) {
  const channelId = `${roomType}:${roomId}`;
  const channel = channels[channelId];
  channel.sendMessage({text:type});
  handleMessage(roomType, roomId, type);
}

function onRoom(roomType, roomId, key, handler) {
  listeners.push({roomType, roomId, key, handler});
}

if(!liveStream) {
  setInterval(async () => {
    if (client) {
      channelCounts = await client.getChannelMemberCount(Object.keys(channels));
    }
  }, 5000);
}

function getRoomCount(roomType, roomId) {
  const channelId = `${roomType}:${roomId}`;
  return channelCounts[channelId] || 0;
}

function listRoomMembers(roomType, roomId) {
  const channelId = `${roomType}:${roomId}`;
  const channel = channels[channelId];
  return channel.getMembers();
}

function setUserAttributes(attributes) {
  client.setLocalUserAttributes(attributes);
}
function getUserAttributes(userId) {
  return client.getUserAttributes(userId);
}

export default {
  connect,
  joinRoom,
  leaveRoom,
  sendRoom,
  onRoom,
  getRoomCount,
  listRoomMembers,
  setUserAttributes,
  getUserAttributes,
}
