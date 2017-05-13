import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';

import {addNewUser, inviteExtraUsersAction, sendMessageToSession} from '../actions/counter';

class ChatContainer extends Component{
	constructor(props) {
		super(props);
		this.sendMessage = this.sendMessage.bind(this);
		this.state ={
			show:true
		}
		this.setState({show:true});
		this.toggleSideBar = this.toggleSideBar.bind(this);
	}
	sendMessage(e) {
			let which = e.which;
			if (which == 13){
				this.props.sendMessageToSession(e.target.value);
				e.target.value = '';
			}
	}

	cleanTime(time){
		let nTime = new Date((time));
		return `${nTime.toLocaleDateString()} - ${nTime.toLocaleTimeString()}`
	}


	toggleSideBar(){
		if (this.state.show == true){
			this.setState({show:false});
		}else{

			this.setState({show:true});
		}
		this.forceUpdate();
	}

	render() {
		const { session, messages ,videoPlaying} = this.props;
		let { show } = this.state;

		return (
			<div className='wrapNode'>
         		 <aside className={show ? 'chat' : 'chat is-hiding'}>
			            <span className='thumb'><i className='icon-lines' onClick={()=> this.toggleSideBar()}></i></span>

						<h3>Invite user <i className='fa fa-plus' onClick={this.props.inviteExtraUsersAction}></i></h3>
						<div className='chatBox'>
							<div className='content scrollBar'>
								{
									messages.map((packet, i)=>{
										return <div className='message' key={i}>
											<h5>{packet.username} <b>{this.cleanTime(packet.timeStamp)}</b></h5>
											<p>{packet.message.message}</p>
										</div>
									})
								}
							</div>
							<div className='typeBox'>
								<input type='text' placeholder='Start typing...' onKeyUp={(e)=>this.sendMessage(e)}></input>
							</div>
						</div>
       			 </aside>
			</div>
		);
	}
}

function mapStateToProps(state) {
  return {
    session: state.sideBarReducer.session,
		messages: state.sideBarReducer.messages,
		videoPlaying: state.sideBarReducer.videoPlaying
  };
}

export default connect(mapStateToProps, {
  addNewUser,
	inviteExtraUsersAction,
	sendMessageToSession
})(ChatContainer);
