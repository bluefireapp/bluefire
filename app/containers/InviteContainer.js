import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import InviteUserComponent from '../components/InviteUsers';
import {addNewUser, joinSession, inviteToSession,bluefireEngine,inviteExtraUsersAction} from '../actions/counter';

class InviteContainer extends Component{
	constructor(props) {
		super(props);
    props.addNewUser();
		this.setUsername= this.setUsername.bind(this);
		this.state ={
			hasUser: false
		}
	}

	componentDidMount(){
		if (localStorage.getItem('currentUser')) {
			this.setState({hasUser: true});
			this.props.bluefireEngine(JSON.parse(localStorage.getItem('currentUser')));
		}else{
			this.setState({hasUser: false});
		}
	}
	setUsername(e){
		this.setState({username: e.target.value});
		localStorage.setItem('currentUser', JSON.stringify({username: e.target.value}));
	}
	userLogin(user){
		this.props.bluefireEngine({username:this.state.user});
		this.setState({hasUser: true});
		this.forceUpdate();
	}
	inviteUsers(users) {
		let selected = users.filter(item => {
			return item.selected;
		});
		this.props.inviteToSession(selected);
		this.props.inviteExtraUsersAction(false);
	}

	render() {
		const { invites, joinSession } = this.props;


		return (
			<div className='invites' >
				{ invites.length > 0 ?
			invites.map((invite, i)=>{
				return <article key={i} >
					<h3><b>{invite.from.username}</b> has invited you to a session ({invite.sessionId})</h3>
					<button onClick={()=> joinSession(invite)}>Join</button>
					<button>Deny</button>
				</article>

			})
			:null}
			{
				this.props.inviteExtraUsers ?
				<InviteUserComponent
					users={this.props.users}
					cancel={()=> this.props.inviteExtraUsersAction(false)}
					done={(users)=> this.inviteUsers(users)}>
				</InviteUserComponent>

			:null}
			{
			this.state.hasUser == false ?
			<article>
				<h3>Pick a name</h3>
				<input type='text' placeholder="type..." onKeyUp={this.setUsername}></input>
				<br></br>
				<button onClick={()=> this.userLogin()}>Join</button>
			</article>
		:null}
		</div>

		);
	}
}

function mapStateToProps(state) {
  return {
    users: state.sideBarReducer.users,
    invites: state.sideBarReducer.invites,
    inviteExtraUsers: state.sideBarReducer.inviteExtraUsers,
    currentInvite: state.sideBarReducer.currentInvite,
  };
}

export default connect(mapStateToProps, {
  addNewUser,
	inviteToSession,
	inviteExtraUsersAction,
	joinSession,
	bluefireEngine
})(InviteContainer);
