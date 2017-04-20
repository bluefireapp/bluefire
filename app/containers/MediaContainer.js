import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PlayerComponent from '../components/Player';
import InviteUserComponent from '../components/InviteUsers';
import {sendInvite, requestSessionId, videoState, heartBeat, cleanTime} from '../actions/counter';
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
			this.setState({chosenVideo: "http://"+ip + ":8005/stream/"+fileName});
			this.forceUpdate();
			app.listen(8005);
			console.log(ip);			
			if (sendInvites){
				this.sendInviteToUsers([...this.props.users], this.state.chosenVideo)
			}else{
				this.setNewVideo();
			}
			
		//=> '46.5.21.123' 
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
	render() {
		let copiedUsers = [...this.props.users];
		let session = this.props.session;
		let time = this.props.time;

		return (
			<div className='wrapNode'>
        <div className='media'>
						<PlayerComponent cleanTime={cleanTime} changeVideoPop= {this.changeVideoPop} heartBeat = {this.props.heartBeat} session = {session} time ={time} videoState = {this.props.videoState} videoPlaying = {this.props.videoPlaying} autoplay = "true" src={session ? session.video.url : null}></PlayerComponent>
						<div className='userVideoStatus'>
							<h1>Hold up!</h1>
							<h3>There are some users who are left behind</h3>
							<div className='waitingList'>
								<ul>
									<li><i className='fa fa-spinner fa-spin fa-3x fa-fw'></i>Jose</li>
									<li><i className='fa fa-spinner fa-spin fa-3x fa-fw'></i>KlsYouri</li>
								</ul>
							</div>
							<div className='footer'>
								<button>Screw them!</button>
							</div>
						</div>
						{this.state.changeVideoPopUp ?
						<div className='popContainer'>
							<div className='inviteUsers'>
								<p>Change video source</p>
								<input onChange={this.chooseVideo} id='chosenVid' placeholder="Video URL or browse locally"></input>
								<br></br>
								<button onClick={()=> this.startVideoServer()}>Browse</button>
								<div className='foot'>
									<button onClick={()=> this.changeVideoPop(false)}>Cancel</button>
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
            <div className='inviteUsers'>
							<InviteUserComponent
								users={this.props.users}
								cancel={()=> this.steps(0)}
								done={(users)=> this.setSelectedUsers(users)}>
							</InviteUserComponent>
            </div>
            :null}
            {this.state.step == 2 ?
            <div className='inviteUsers'>
              <p>Invite users to your session</p>
              <input onChange={this.chooseVideo} placeholder="Type the video URL..."></input>
							<button onClick={()=> this.startVideoServer(true)}>Browse</button>
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
	heartBeat
})(MediaContainer);
