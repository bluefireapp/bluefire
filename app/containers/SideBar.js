import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import randomFlatColors from "random-flat-colors";


import {addNewUser, bluefireEngine, cleanTime} from '../actions/counter';

class SideBarContainer extends Component{
	constructor(props) {
		super(props);
		this.randomList = {};
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

	render() {
		const { users, session , sessionUsers, videoPlaying} = this.props;
		console.log("sessionUsers", sessionUsers)
		return (
			<div className='wrapNode'>
        <aside className={videoPlaying ? 'sideBar is-hiding' : 'sideBar'}>
          <h3>Currently Online</h3>
					{ sessionUsers ?
					<ul className='scrollBar'>
            {
              sessionUsers.map((user, i) => {
                return <li key={i}>
                  <div className='rngColor' style={this.makeColor(user)}></div>
                  <h5>{user.username}</h5>
                  <h6>{user.heartBeat? cleanTime(user.heartBeat.data.time) : null}</h6>
                </li>
              })
            }
						<p className='lobby'>Lobby</p>
          </ul>
					:null}
          <ul className='scrollBar'>
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
