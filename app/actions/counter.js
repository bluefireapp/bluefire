// @flow
import type { counterStateType } from '../reducers/counter';

export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';
let connection;
export function newUser(user) {
  return {
    type: 'NEW_USER',
    user:user
  };
}

export function inviteExtraUsersAction(show = true) {
  return {
    type: 'INVITE_EXTRA_USERS',
    show: show
  };
}

export function addNewUser(user) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    dispatch(newUser(user));
  };
}
export function sendInvite(selectedUsers) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'INVITE', data: selectedUsers}));
  };

}
export function inviteToSession(users) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'INVITE_TO_SESSION', users: users}));
  };
}
export function requestSessionId(selectedUsers, video) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'NEW_SESSION', users:selectedUsers, video:video}));
  };
}

export function sendMessageToSession(message) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'MESSAGE', message: message}));
  };
}

export function joinSession(invite) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'ACCEPTED_SESSION', data: invite}));
    dispatch({"type": "JOINED_SESSION"});
    dispatch({'type': 'NEW_SESSION',id: invite.sessionId});

  };
}

export function heartBeat(heartBeat) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    connection.send(JSON.stringify({topic:'HEARTBEAT', data: heartBeat}));
  };
}

export function cleanTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  minutes = (minutes >= 10) ? minutes : "0" + minutes;
  seconds = Math.floor(seconds % 60);
  seconds = (seconds >= 10) ? seconds : "0" + seconds;
  return minutes + ":" + seconds;
}
export function videoState(state) {
  return (dispatch: () => void, getState: () => counterStateType) => {
    switch (state.type) {
      case 'play':
        connection.send(JSON.stringify({topic:'VIDEO_PLAY', time: state.time}));
        break;
      case 'change':
        connection.send(JSON.stringify({topic:'VIDEO_CHANGE', src: state.src}));
        break;
      case 'pause':
        connection.send(JSON.stringify({topic:'VIDEO_PAUSE', time: state.time}));
        break;
      case 'position':
        connection.send(JSON.stringify({topic:'VIDEO_POSITION', time: state.time}));
        break;

    }
  };
}

export function bluefireEngine(currentUser) {
  return (dispatch: () => void, getState: () => counterStateType) => {

    connection = new WebSocket('ws://localhost:8003');
    // When the connection is open, send some data to the server
    connection.onopen = function () {
      dispatch({"type": "CONNECTED"});
      connection.send(JSON.stringify({topic:'LOGIN', user: currentUser})); // Send the message 'Ping' to the server
      let savedSession = localStorage.getItem('session');
      if (localStorage.getItem('session')){
        let invite = {sessionId: JSON.parse(localStorage.getItem('session')).id}
          connection.send(JSON.stringify({topic:'ACCEPTED_SESSION', data: invite}));
         dispatch({"type": "JOINED_SESSION"});
         dispatch({'type': 'NEW_SESSION',id: invite.sessionId});
      }
    };

    // Log errors
    connection.onerror = function (error) {
      console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = function (e) {
      console.log('Server: ' + e.data);
      let message = JSON.parse(e.data);
      switch(message.topic){
        case 'users':
          message.data.forEach((user)=>{
            dispatch(newUser(user));
          });
          break;
        case 'SESSION_ID':
            dispatch({'type': 'NEW_SESSION',id: message.data.id});
            break;
        case 'CURRENT_SESSION':
            dispatch({'type': 'CURRENT_SESSION',session: message.data.session});
            localStorage.setItem('session', JSON.stringify(message.data.session));
            break;
        case 'INVITE':
          console.log('an invite is recieved', message);
            dispatch({'type':"INVITE", 'from': message.data.from ,'sessionId': message.data.sessionId});
            break;
        case 'VIDEO_PLAY':
          console.log('video', message);
            dispatch({'type':"VIDEO_PLAY", time: message.data.time});
            break;
        case 'VIDEO_PAUSE':
          console.log('video', message);
            dispatch({'type':"VIDEO_PAUSE", time: message.data.time});
            break;
        case 'VIDEO_POSITION':
          console.log('videoposition', message);
            dispatch({'type':"VIDEO_POSITION", time: message.data.time});
            break;
        case 'VIDEO_CHANGE':
          console.log('videoChange', message);
            dispatch({'type':"VIDEO_CHANGE", src: message.data.src});
            break;
        case 'HEARTBEAT':
          console.log('heartbeat arived', message);
            dispatch({'type':"HEARTBEAT", heartBeat: message.data});
            break;
        case 'MESSAGE':
          console.log('message arived', message);
            dispatch({'type':"MESSAGE", message: message.data});
            break;
      }
    };
  };
}
