import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import randomFlatColors from "random-flat-colors";


import {addNewUser, bluefireEngine, cleanTime} from '../actions/counter';

class SideBarContainer extends Component{
	constructor(props) {
		super(props);
		this.randomList = {};
    this.tabOverride = false;
    this.state ={
      show:true
    }
    this.setState({show:true});
    this.toggleSideBar = this.toggleSideBar.bind(this);
	}

	makeColor(user) {
		if (!this.randomList[user.username]) {
			let color = randomFlatColors();
			this.randomList[user.username]= color;
			return {backgroundColor: color}
		}else{
			let color = this.randomList[user.username];
			return {backgroundColor: color}
		}
	}

  toggleSideBar(){
    console.log('click')
    this.tabOverride = true;
    if (this.state.show == true){
      this.setState({show:false});
    }else{

      this.setState({show:true});
    }
    this.forceUpdate();
  }

	render() {
		const { users, session , sessionUsers, videoPlaying} = this.props;
    let {show} = this.state;

		console.log("sessionUsers", sessionUsers)
		return (
			<div className='wrapNode'>
        <aside className={show ? 'sideBar' : 'sideBar is-hiding'}>
          <span className='thumb'><i className='icon-house' onClick={()=> this.toggleSideBar()}></i></span>
          <h3>{ sessionUsers ? 'Current Session': 'Current Online'}</h3>
					{ sessionUsers ?
					<ul className='scrollBar'>
            {
              sessionUsers.map((user, i) => {
                return <li className='inLobby' key={i}>
                  <div className='rngColor inSession' style={this.makeColor(user)}></div>
                  <h5>{user.username}</h5>
                  <h6>{user.heartBeat ? cleanTime(user.heartBeat.data.time) : null}
										{user.heartBeat && user.heartBeat.data.loaded? <p><i className='fa fa-cloud-download'></i>{Math.floor(user.heartBeat.data.loaded * 100)}%</p>  : null}
										{user.ping? <p><i className='fa fa-signal'></i>{user.ping} ms</p>  : null}</h6>
                </li>
              })
            }
          </ul>
					:null}
					{sessionUsers ? <h3 className='lobby'>Lobby</h3>: null }
          <ul className={sessionUsers ? 'scrollBar inSession': 'scrollBar'}>
            {
              users.map((user, i) => {
                return <li key={i}>
                  <div className='rngColor ' style={this.makeColor(user)}></div>
                  <h5>{user.username}</h5>
                </li>
              })
            }
          </ul>
        </aside>
			</div>
		);
	}
}

function mapStateToProps(state) {
  return {
    users: state.sideBarReducer.users,
    session: state.sideBarReducer.session,
    sessionUsers: state.sideBarReducer.sessionUsers,
    videoPlaying: state.sideBarReducer.videoPlaying,
  };
}

export default connect(mapStateToProps, {
  addNewUser,
  bluefireEngine
})(SideBarContainer);
