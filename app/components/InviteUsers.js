
import React, { Component } from 'react';
import { Link } from 'react-router';



export default class Player extends Component {
  constructor(props){
    super();
    this.state = {
      copiedUsers: []
    }
  }

  selectUser(user, copiedUsers) {
    if (user.selected){
      user.selected = false;
    }else{
      user.selected = true;
    }
    this.state = {...this.state, copiedUsers};
    this.forceUpdate();
  }

  render() {
    let { src, userSelected, cancel, done} = this.props;
    let copiedUsers = [...this.props.users];
    return (
      <div>
        <div className='inviteUsers'>
          <p>Invite users to your session</p>
          <i className='fa fa-times-circle' onClick={()=> cancel()}></i>
          <ul className='scrollBar'>
            {copiedUsers.map((user, i)=>{
              return <li onClick={()=>this.selectUser(user, copiedUsers)} key ={i}>{user.username} {user.selected ? <i className='fa fa-check'></i>: null}</li>
            })}
          </ul>
          <div className='foot'>
            <button onClick={()=> done(this.state.copiedUsers)}>Next</button>
          </div>
        </div>
      </div>
    );
  }
}
