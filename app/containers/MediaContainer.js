import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PlayerComponent from '../components/Player';
import InviteUserComponent from '../components/InviteUsers';
import {sendInvite, requestSessionId, videoState, heartBeat, cleanTime, sendMessageToSession} from '../actions/counter';
import Subtitles from '../components/Subtitles.js';

const ipcRenderer = require('electron').ipcRenderer;
let app = require('video-server');

class MediaContainer extends Component{
	constructor(props) {
		super(props);

    this.state = {
      step: 0,
			chosenVideo:'',
			changeVideoPopUp:false
    };
		this.chooseVideo = this.chooseVideo.bind(this);
		this.changeVideoPop= this.changeVideoPop.bind(this);
		this.setNewVideo= this.setNewVideo.bind(this);
		this.startVideoServer= this.startVideoServer.bind(this);

	}

  steps(step){
    this.state = { ...this.state, step};
    this.forceUpdate();
  }
	chooseVideo(e){
		let value = e.target.value;
		this.setState({chosenVideo: value});
	}

	startVideoServer(sendInvites){
		const {dialog} = require('electron').remote
		const publicIp = require('public-ip');
		
		let file = dialog.showOpenDialog({properties: ['openFile']})[0];
		let directory =  require('path').dirname(file);
		let fileName =  require('path').basename(file);
		app.set('STORAGE_DIR', directory)
		
		publicIp.v4().then(ip => {
			let hashName = app.hashMap().add(fileName)
			this.setState({chosenVideo: "http://"+ip + ":8005/stream/"+hashName});
			this.props.sendMessageToSession(` - New video: ${fileName}`);
			this.forceUpdate();
			if (!app.get('listening')){
				app.listen(8005, ()=>{
					app.set('listening', true)
				});
				
			}
			console.log(ip);		
			
			ipcRenderer.send("make-subs", file);
			ipcRenderer.on('subs-done', (event, arg) => {
				let hashName = app.hashMap().add(fileName + '.subs.srt')
				console.log(arg) // prints "pong"
				let subsSrc ="http://"+ip + ":8005/subs/" + hashName;
				this.checkSubsAvailability(subsSrc, ()=>{
					if (sendInvites){
						this.sendInviteToUsers([...this.props.users], this.state.chosenVideo)
					}else{
						this.setNewVideo();
					}
					this.props.videoState({type:'subs', src: "http://"+ip + ":8005/subs/" + hashName});
					
				})

			})
				
		//=> '46.5.21.123' 
		});
	}

	checkSubsAvailability(url ,cb){
		fetch(url, {
			method: 'get'
		}).then(function(response) {
			cb();
		}).catch(function(err) {
		// Error :(
			setTimeout(()=>{
				this.checkSubsAvailability(url, cb);
			}, 1000)
		});
	}

	sendInviteToUsers(copiedUsers, vid){
		let selected = copiedUsers.filter((item)=>{
			return item.selected;
		})
		this.props.requestSessionId(selected, vid);
		this.state = {...this.state, step: 0};
		this.forceUpdate();
	}

	setSelectedUsers(users) {
		this.state = {...this.state, users};
		this.forceUpdate();
		this.steps(2)
	}
	changeVideoPop(visible) {
		this.setState({changeVideoPopUp: visible});
		this.forceUpdate();
	}
	setNewVideo(){
		this.props.videoState({type:'change', src: this.state.chosenVideo});
		this.props.videoState({type:'position', time: 0});
		this.changeVideoPop(false);
	}

	bufferingInUsers(sessionUsers){
		if (!sessionUsers) return false;
		let bufferingUsers= sessionUsers.filter(user =>{
			return user.buffering == '1'
		});

		if (bufferingUsers.length > 0){
			return bufferingUsers;
		}else{
			return false;
		}
	}

	render() {
		let copiedUsers = [...this.props.users];
		let session = this.props.session;
		let time = this.props.time;
		let bufferingUsers = this.bufferingInUsers(this.props.sessionUsers);
		return (
			<div className='wrapNode'>
        <div className='media'>
		
					{session ?
						<PlayerComponent cleanTime={cleanTime} changeVideoPop= {this.changeVideoPop}
						 heartBeat = {this.props.heartBeat} session = {session} 
						 time ={time} videoState = {this.props.videoState} videoPlaying = {this.props.videoPlaying} 
						 autoplay = "true" 
						 src={session ? session.video.url : null}
						 subs={session ? session.video.subs : null}>
						 </PlayerComponent>
					:null	}	
					 {bufferingUsers ?
					 	<div className='userVideoStatus'>
							<h1>Hold on</h1>
							<h3>There are users still loading!</h3>
							<div className='waitingList'>
								<ul>
									{bufferingUsers.map((user, i)=>{
										return <li key={i}><i className='fa fa-cog fa-spin fa-3x fa-fw'></i>{user.username}</li>
									})
									}
								</ul>
							</div>
							<div className='footer'>
							
							</div>
						</div>
					 :null}
						{this.state.changeVideoPopUp ?
						<div className='popContainer'>
							<div className='inviteUsers'>
								<p>New Video</p>
								<i className='fa fa-times-circle' onClick={()=> this.changeVideoPop(false)}></i>
								<h4>URL:</h4>
								<input onChange={this.chooseVideo} id='chosenVid' placeholder="Video URL or browse locally"></input>
								<i className='fa fa-folder' onClick={()=> this.startVideoServer()}></i>
								<div className='foot'>
									<button onClick={()=> this.setNewVideo()}>Change</button>
								</div>

							</div>
						</div>

						:null}
				  	{this.props.currentSession == '' ? <article className='newVideo'>
            {this.state.step == 0 ?
            <button onClick={()=> this.steps(1)}>Start a session</button>
            :null}
            {this.state.step == 1 ?
            
							<InviteUserComponent
								users={this.props.users}
								cancel={()=> this.steps(0)}
								done={(users)=> this.setSelectedUsers(users)}>
							</InviteUserComponent>
        
            :null}
            {this.state.step == 2 ?
            <div className='inviteUsers'>
							<i className='fa fa-times-circle' onClick={()=> this.changeVideoPop(false)}></i>
              <p>Invite users to your session</p>
							<h4>URL:</h4>
              <input onChange={this.chooseVideo} placeholder="Type the video URL..."></input>
							<i className='fa fa-folder' onClick={()=> this.startVideoServer(true)}></i>							
              <div className='foot'>
                <button onClick={()=> this.steps(2)}>Back</button>
                <button onClick={()=> this.sendInviteToUsers(copiedUsers, this.state.chosenVideo)}>Next</button>
              </div>
            </div>
            :null}
          </article>:null}
        </div>
			</div>
		);
	}
}

function mapStateToProps(state) {
  return {
    users: state.sideBarReducer.users, 
    currentSession: state.sideBarReducer.currentSession,
    sessionUsers: state.sideBarReducer.sessionUsers,
    sessionVideo: state.sideBarReducer.sessionVideo,
    session: state.sideBarReducer.session,
    videoPlaying: state.sideBarReducer.videoPlaying,
    time: state.sideBarReducer.time,
  };
}

export default connect(mapStateToProps, {
  sendInvite,
	requestSessionId,
	videoState,
	sendMessageToSession,
	heartBeat
})(MediaContainer);
