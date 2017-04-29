// @flow
import React, { Component } from 'react';
import Home from '../components/Home';
import SideBarContainer from '../containers/SideBar';
import MediaContainer from '../containers/MediaContainer';
import ChatContainer from '../containers/ChatContainer';
import InviteContainer from '../containers/InviteContainer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class HomePage extends Component {
  constructor(props){
    super();
    this.state={
      hasUser: false
    }
  }
  componentDidMount() {
    if (localStorage.getItem("currentUser")){
      this.setState({hasUser: true});
    }
  }
  render() {
    return (
      <div className='wrapNode'>
        <InviteContainer />
        {JSON.stringify(this.props)}
        {!this.props.sessionVideo? 
        <div className='bgVid'>
          <video autoPlay = 'true' loop = 'true' muted>
            <source src="dist/fire.mp4" type="video/mp4"></source>
            </video>
          </div>
        
        :null}
        {
        this.state.hasUser || this.props.connected ?
        <div>
          <SideBarContainer></SideBarContainer>
          
          <MediaContainer></MediaContainer>
          <ChatContainer></ChatContainer>
        </div>
        :null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    connected: state.sideBarReducer.connected,
    sessionVideo: state.sideBarReducer.sessionVideo,
  };
}

export default connect(mapStateToProps, {
})(HomePage);
