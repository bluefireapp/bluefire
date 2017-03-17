
import React, { Component } from 'react';
import { Link } from 'react-router';



export default class Player extends Component {
  constructor(props){
    super();
    this.blockTrackBar = false;
    this.updateDimensions = this.updateDimensions.bind(this)
    this.setVolume = this.setVolume.bind(this);
    this.changePosition = this.changePosition.bind(this);

  }
  updateDimensions () {
      let width = window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
      let height = window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
      this.setState({width: width, height: height});
  }
  componentWillMount () {
      this.updateDimensions();
  }
  componentDidMount () {
      window.addEventListener("resize", this.updateDimensions);
      let player = document.querySelector(".mainVideo");
      player.addEventListener('loadeddata', (e)=> {
        this.videoLoaded(e);
      }, false);
      player.addEventListener('error', (e)=> {
        console.log("error loading vid", e)
      }, false);
      player.addEventListener('timeupdate', (e)=> {
        this.videoTimeUpdating(e);
      }, false);
  }
  componentDidUpdate () {
    let { src, videoPlaying, videoState, time } = this.props;
    if (videoPlaying == true){
      this.playerControls().play();
    }else{
      this.playerControls().pause();
    }
    if (time){
      this.playerControls().setTime(time);

    }

  }
  componentWillUnmount () {
      window.removeEventListener("resize", this.updateDimensions);
  }

  playerControls() {
      let player = document.querySelector(".mainVideo");
      return {
        play: ()=>{
          player.play();
        },
        pause: ()=>{
          player.pause();
        },
        volume: (value) =>{
          player.volume = value;
        },
        getCurrentTime: () =>{
          return player.currentTime;
        },
        setTime: (value)=>{
          player.currentTime = value;

        },
        fullscreen: () =>{
          var elem = player;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          }
        }
      }
  }

  setVolume(e) {
    let value = e.target.value;
    this.playerControls().volume(value / 100);
  }
  play() {
      this.props.videoState({type: 'play', time: this.playerControls().getCurrentTime()});
  }
  pause() {
      this.props.videoState({type: 'pause',time: this.playerControls().getCurrentTime()});
  }
  changePosition(e) {
      this.props.videoState({type: 'position', time: e.target.value});
      this.adjustGlow(e.target.value);
  }
  videoLoaded(e) {

    this.setState({...this.state, duration: e.target.duration, time: this.props.session.video.time})
    this.playerControls().setTime(this.props.session.video.time);

  }
  adjustGlow(duration) {
    duration = parseInt(duration);
    document.querySelector(".timeTrackGlow").style.left = document.querySelector(".timeTrack").offsetLeft + 'px';
    document.querySelector(".timeTrackGlow").style.top = document.querySelector(".timeTrack").offsetTop+ 'px';
    let timeTrack = document.querySelector(".timeTrack");
    let trackWidth = timeTrack.clientWidth;
    let ballPerc = (timeTrack.value / duration) * 100;
    let percToPixels = (ballPerc * trackWidth) / 100;
    document.querySelector(".timeTrackGlow").style.width = percToPixels + 'px';
    console.log(percToPixels, trackWidth, duration)
  }
  videoTimeUpdating(e) {
    document.querySelector(".timeTrack").value = e.target.currentTime;
    document.querySelector(".metaTime > p > b").innerHTML = this.props.cleanTime(e.target.currentTime);
    document.querySelector(".metaTime > p > span").innerHTML = this.props.cleanTime(e.target.duration);
    this.props.heartBeat({"time": e.target.currentTime});
    this.adjustGlow(e.target.duration);
  }

  block(e){
    this.blockTrackBar = true;
  }

  setTrackBar() {

    return this.props.time ? this.props.time : 0;
  }
  render() {
    let { src, videoPlaying, videoState, time } = this.props;
    console.log(time)
    return (
      <div>
        <video className='mainVideo' volume='50' style={{height: this.state.height, width: this.state.width}} src={src} id='mainMedia'>  </video>
        <div className='playerControls'>
          {videoPlaying ? <i className='fa fa-pause pause' onClick={()=>this.pause()}></i> : <i className='fa fa-play play' onClick={()=>this.play()}></i>}
          <div className="timeTrackGlow"></div>
          <input type='range' min = '0' max = {this.state.duration} defaultValue={this.state.time} onChange={(e)=>this.adjustGlow(e.target.value)} onMouseDown = {(e)=>this.block(e)} onMouseUp={(e)=>this.changePosition(e)} className='timeTrack'></input>
          <input type='range' defaultValue='50' className='volTrack' onChange={this.setVolume}>

          </input>
          <i className='fa fa-chain newLink' onClick={()=>this.props.changeVideoPop(true)}></i>
          <i className='fa fa-clone fullscreen' onClick={()=>this.playerControls().fullscreen()}></i>
          <div className='metaTime'>
            <p><b>00:00:00</b> / <span>00:20:99</span></p>
          </div>
        </div>
      </div>
    );
  }
}
