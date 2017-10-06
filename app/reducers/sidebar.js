const initialState = {
  users: [],
  invites: [],
  currentInvite: {},
  currentSession: '',
  session:null,
  videoPlaying: false,
  time: 0,
  sessionUsers: null,
  inviteExtraUsers: false,
  messages: [],
  connected: false
};

function sideBarReducer(state=initialState, action) {
	switch (action.type){
		case 'NEW_USER':
      console.log('users', action.user);
      let usersCopy = [...state.users];
      let userExists = false;
      usersCopy.filter((item)=>{
        if (item.username == action.user.username) {
          userExists = true;
        }
      });
      if (action.user && !userExists){
        usersCopy.push(action.user)
      }
      return { ...state, users: usersCopy };
      break;
		case 'CONNECTED':
        return { ...state, connected: true };
      break;
		case 'INVITE':
      let copyInvites = [];
      if (action.from){
        copyInvites.push({...action});
        return { ...state, invites: copyInvites };
      }
      break;
		case 'JOINED_SESSION':
      return { ...state, invites: [] };
      break;
		case 'CURRENT_SESSION':
      if (action.session){
        return { ...state, session: action.session , videoPlaying: action.session.video.playing, messages: action.session.messages };
      }else{
        return {...state, session: null}
      }
      break;
		case 'LEAVE_SESSION':
      return {...state, session: null, currentSession: '', sessionUsers: null, messages: [], time:0}
      break;
		case 'NEW_SESSION':
      if (action.id){
        return { ...state, currentSession: action.id };
      }
		case 'MATCH_INPROGRESS':
      return { ...state, matchInprogress: action.match };
		case 'VIDEO_PLAY':
      return { ...state, videoPlaying: true , time: action.time};
		case 'VIDEO_PAUSE':
      return { ...state, videoPlaying: false , time:action.time};
		case 'VIDEO_POSITION':
      return { ...state, time:action.time};
		case 'VIDEO_CHANGE':
       let sessionCopy2 = {...state.session};
      sessionCopy2.video.url = action.src;
      return { ...state, session: sessionCopy2};
      break;
		case 'VIDEO_SUBS':
       let sessionCopy3 = {...state.session};
      sessionCopy3.video.subs = action.src;
      return { ...state, session: sessionCopy3};
      break;
    case 'HEARTBEAT':
      let sessionCopy;
      return { ...state, sessionUsers: action.heartBeat };
      break;
    case 'MESSAGE':
      let messagesCopy = [...state.messages];
      messagesCopy.push(action.message);
      return { ...state, messages: messagesCopy };
      break;
    case 'INVITE_EXTRA_USERS':
      return { ...state, inviteExtraUsers: action.show };
      break;
		case 'SCANNED_KEY_ONLY':
      let keys = {...state.keys};
      keys[action.key.key] = action.key;
      return { ...state, keys: keys };
		case 'CLEAN_KEYS':
      let emtpyKeys = {};
      return { ...state, keys: emtpyKeys };

		default:
			return state;
	}

}

export default sideBarReducer;
