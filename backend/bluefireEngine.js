'use strict'
class bluefireEngine{
  constructor(){
    const WebSocket = require('ws');
    let users = [
      // {id: 123, username:'Zaku'},
      // {id: 123, username:'KLS Youri'},
      // {id: 123, username:'Sanjin'},
      // {id: 123, username:'GomAzuzu'},
      // {id: 123, username:'PlasterBlaster'},
      // {id: 123, username:'CasualZ'},
      // {id: 123, username:'Takara'},
      // {id: 123, username:'Renalis'}
    ];
    this.sessions = {

    };
    this.updaters = {

    };
    this.sessionTimers = {

    };
    this.users = users;
    const wss = new WebSocket.Server({ port: 8003 });
    this.wss = wss;
    // Broadcast to all.
    wss.broadcast = function broadcast(topic, data) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({topic: topic, data: data}));
        }
      });
    }.bind(this);

    wss.on('connection',(ws)=> {
      this.currentUsers();

      ws.on('close',()=> {
        this.users = this.users.filter(user =>{
          return user.username !== ws.user.username;
        });
        this.removeUserFromAllSessions(ws.user);
        this.currentUsersInSession(ws, ws.sessionId);
        delete ws.user;

        console.log('closed for user', ws.user)
      });

      ws.on('message', (data) => {
        // Broadcast to everyone else.
        data = JSON.parse(data)
        // wss.clients.forEach(function each(client) {
        //   if (client !== ws && client.readyState === WebSocket.OPEN) {
        //     client.send(data);
        //   }
        // });
        console.log((data))
        switch(data.topic){
          case 'NEW_SESSION':
            ws.sessionId = this.createSession(data.video);

            this.addUserToSession(ws.user, ws.sessionId,ws);
            data.users.forEach((user)=>{
              this.sendToUser(user, "INVITE", {'from': ws.user, 'sessionId': ws.sessionId, video:data.video});
            })
            this.currentUsersInSession(ws, ws.sessionId);
            this.currentSession(ws, ws.sessionId);
            this.sendMessageToSession(ws.sessionId, `New Session created by ${ws.user.username}`, ws.user.username)

            break;
          case 'INVITE':
            console.log("invites sending", data, ws.sessionId);

            data.data.forEach((user)=>{
              this.sendToUser(user, "INVITE", {'from': ws.user, 'sessionId': ws.sessionId});
            })
            break;
          case 'LOGIN':
            ws.user = data.user;
            let userFound = this.users.filter((v) => {
              return v.username === data.user.username; // Filter out the appropriate one
            })[0];
            if (!userFound){
              console.log('USER FOUND')
              this.users.push(ws.user);
            }
            this.currentUsers();
            break;
          case 'ACCEPTED_SESSION':
            if (this.sessions[data.data.sessionId]){
              this.addUserToSession(ws.user, data.data.sessionId,ws);
              this.currentSession(ws, data.data.sessionId);
              this.currentUsersInSession(ws, data.data.sessionId);
            }else{
              this.sendToUser(ws.user, "NO_SESSION", {sessionId: data.data.sessionId});
              
            }
            break;
          case 'CHECK_SESSION':
            this.checkSession(ws, data.data.sessionId);
            break;
          case 'VIDEO_PLAY':
            this.playVideoInSession(ws.user.currentSession, data.time);
            break;
          case 'VIDEO_PAUSE':
            this.pauseVideoInSession(ws.user.currentSession, data.time);
            break;
          case 'VIDEO_POSITION':
            this.setTimeVideoInSession(ws.user.currentSession, data.time);
            break;
          case 'VIDEO_CHANGE':
            this.changeVideoInSession(ws.user.currentSession, data.src);
            break;
          case 'VIDEO_SUBS':
            this.changeVideoSubsInSession(ws.user.currentSession, data.src);
            break;
          case 'BUFFERING':
            this.setUserBufferInSession(ws.sessionId, ws);
            this.currentUsersInSession(ws, ws.sessionId);
            break;
          case 'CANPLAY':
            this.setUserCanPlayInSession(ws.sessionId, ws);
            this.currentUsersInSession(ws, ws.sessionId);
            break;
          case 'HEARTBEAT':
            ws.heartBeat = data;
            this.setUserHeartBeatInSession(ws.currentSession, ws);
            break;
          case 'INVITE_TO_SESSION':
            this.inviteUsersToSession(ws.currentSession, data.users, ws);
            break;
          case 'MESSAGE':
            this.sendMessageToSession(ws.currentSession, data, ws.user.username);
            break;
          case 'PING':
            ws.user.ping = data.lastPing
            this.sendToUser(ws.user, "PONG", {});
            break;

          default:
              console.log("default");
              break

        }
      });
    });
  }

  currentUsers() {
    this.wss.broadcast('users', this.users);
  }

  currentUsersInSession(ws,sessionId) {
    if (this.sessions[sessionId]){
      this.sendToUser(ws.user, 'USERS_IN_SESSION', {sessionId: sessionId, users: this.sessions[sessionId].users});
    }
  }

  currentSession(ws, sessionId) {
    this.sendToUser(ws.user, 'CURRENT_SESSION', {session: this.sessions[sessionId]});
  }

  checkSession(ws, sessionId) {
    if (this.sessions[sessionId]){
      this.sendToUser(ws.user, 'CURRENT_SESSION', {session: this.sessions[sessionId]});
    }
  }

  sendToUser(user, topic, data){

    this.wss.clients.forEach((client) => {
      if ( client.user && client.user.username == user.username && client.readyState == 1 ) {
        console.log( data)
    

          client.send(JSON.stringify({topic: topic, data: data}));

      }
    });

  }

  sendToUsersInSession(sessionId, topic, data){
    this.wss.clients.forEach((client) => {
      if ( sessionId == client.currentSession && client.readyState == 1 ) {
        console.log(data)
        client.send(JSON.stringify({topic: topic, data: data}));
      }
    });
  }

  setUserHeartBeatInSession(sessionId, ws){
    if (this.sessions[sessionId]){
      this.sessions[sessionId].users = this.sessions[sessionId].users.map(user =>{
        if (user.username == ws.user.username){
          user.heartBeat = ws.heartBeat;
        }
        return user;
      });
    }
  }

  setUserBufferInSession(sessionId, ws){
    if (this.sessions[sessionId]){
      this.sessions[sessionId].users = this.sessions[sessionId].users.map(user =>{
        if (user.username == ws.user.username){
          user.buffering = '0';
          ws.user.buffering = '0'

        }
        return user;
      });
    }
  }

  setUserCanPlayInSession(sessionId, ws){
    if (this.sessions[sessionId]){
      this.sessions[sessionId].users = this.sessions[sessionId].users.map(user =>{
        if (user.username == ws.user.username){
          user.buffering ='1'
          ws.user.buffering = '1'

        }
        return user;
      });
    }
  }

  addUserToSession(user, sessionId, ws){
    if (this.sessions[sessionId]){
      let usersInSession = this.sessions[sessionId].users;
      let userExists = false;
      user.currentSession = sessionId;
      ws.currentSession = sessionId;
      usersInSession.forEach((item) =>{
        if (item.username == user.username){
          userExists = true;
        }
      });
      if (!userExists){
        this.sessions[sessionId].users.push(user);
      }
    }
  }

  removeUserFromAllSessions(user){
    for (var sessionId in this.sessions) {
        let usersInSession = this.sessions[sessionId].users;
        this.sessions[sessionId].users = usersInSession.filter((u)=>{
          return u.username !== user.username;
        });
    }
  }

  changeVideoInSession(sessionId, src){
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].video.playing = true;
    this.sessions[sessionId].video.url = src;
    this.sendToUsersInSession(sessionId, 'VIDEO_CHANGE',{src: src});

  }
  changeVideoSubsInSession(sessionId, src){
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].video.subs = src;
    this.sendToUsersInSession(sessionId, 'VIDEO_SUBS',{src: src});

  }
  sendMessageToSession(sessionId, message, username){
    if (!this.sessions[sessionId]) return;
    let currentTime = new Date();
    let newPacket = {message: message, timeStamp:currentTime.toISOString(), username: username};
    this.sessions[sessionId].messages.push(newPacket);
    this.sendToUsersInSession(sessionId, 'MESSAGE', newPacket);

  }

  playVideoInSession(sessionId, time){
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].video.playing = true;
    this.sessions[sessionId].video.time = time;
    this.sendToUsersInSession(sessionId, 'VIDEO_PLAY',{time: time});

  }

  pauseVideoInSession(sessionId, time){
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].video.playing = false;
    this.sessions[sessionId].video.time = time;
    this.sendToUsersInSession(sessionId, 'VIDEO_PAUSE',{time: time});

  }
  setTimeVideoInSession(sessionId, time){
    if (!this.sessions[sessionId]) return;
    this.sessions[sessionId].video.time = time;
    this.sendToUsersInSession(sessionId, 'VIDEO_POSITION',{time: time});

  }
  inviteUsersToSession(sessionId, users, ws){
    if (!this.sessions[sessionId]) return;
    users.forEach((user)=>{
      this.sendToUser(user, "INVITE", {'from': ws.user, 'sessionId': sessionId});
    });
    this.sendMessageToSession(sessionId, `${ws.user.username} invited ${JSON.stringify(users)} to session`, ws.user.username)

  }

  createSession(video){
    let sessionId = this.makeId();
    this.sessions[sessionId] ={
      id: sessionId,
      users:[],
      messages:[],
      video:{
        url:video,
        time:0,
        playing: false
      }
    }
    this.sessionTimers[sessionId] = setInterval(()=>{
      console.log('USERS IN SESSION', this.sessions[sessionId].users);
      if ( this.sessions[sessionId].users.length == 0){
        delete this.sessions[sessionId];
        clearInterval(this.sessionTimers[sessionId])
        clearInterval(this.updaters[sessionId].updater)
      }
    }, 600000)
    
    this.updaters[sessionId] ={

      updater: setInterval(()=>{
       this.sendToUsersInSession(sessionId, 'HEARTBEAT', this.sessions[sessionId].users);
     },1000)
   };
    return sessionId;
  }

  makeId() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

let bl = new bluefireEngine();
