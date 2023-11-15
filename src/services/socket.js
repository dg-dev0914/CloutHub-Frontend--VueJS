// import { io } from 'socket.io-client';
// const baseUrl = process.env.VUE_APP_SOCKET_ENDPOINT;
// const socket = io(baseUrl, {
//   reconnectionDelayMax: 10000,
//   transports : ['websocket'],
//   auth: {
//     token: localStorage.access_token
//   },
// });
//
// function joinRoom(roomType, roomId) {
//   socket.emit('join-room', { roomType, roomId });
// }
// function leaveRoom(roomType, roomId) {
//   socket.emit('leave-room', { roomType, roomId });
// }
// function sendRoom(roomType, roomId, type) {
//   socket.emit('send-room', { roomType, roomId, type });
// }
//
// function emit(key, body) {
//   socket.emit(key, body);
// }
// function on(key, handler) {
//   socket.on(key, handler);
// }
//
// function onRoom(roomType, roomId, key, handler) {
//   socket.on(key, (msg) => {
//     if (msg.roomType == roomType && msg.roomId == roomId) {
//       handler(msg);
//     }
//   });
// }
//
// export default {
//   emit,
//   on,
//   joinRoom,
//   leaveRoom,
//   sendRoom,
//   onRoom,
// }

import agorachat from './agorachat';
export default agorachat;
