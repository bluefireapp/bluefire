
import React, { Component } from 'react';
import { Link } from 'react-router';
const ipcRenderer = require('electron').ipcRenderer;
import Subtitles from './Subtitles.js';

export default class Player extends Component {
  constructor(props){
    super();
    this.blockTrackBar = false;
    this.updateDimensions = this.updateDimensions.bind(this)
    this.setVolume = this.setVolume.bind(this);
    this.changePosition = this.changePosition.bind(this);
    this.videoCanPlay = this.videoCanPlay.bind(this);
    this.lastWidth= 0;
    this.lastHeight =0;
    this.currentSrc ="";
  }
  updateDimensions () {
      let width = window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
      let height = window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
      this.lastHeight = height;
      this.lastWidth = width;
      this.lastPause;
      this.lastTimeChange;
      this.idle = false;
      this.setState({width: width, height: height, idle:false});
      this.playerControls().size(width, height)
  }

  componentWillMount () {
      this.updateDimensions();
  }

  componentDidMount () {
      window.addEventListener("resize", this.updateDimensions);
      this.playerControls().initHandlers();
      var idleInterval = setInterval(timerIncrement.bind(this), 1000); // 1 minute
      let idleTime = 0;
      //Zero the idle timer on mouse movement.
      window.addEventListener("mousemove", ()=>{
        idleTime = 0;
        this.idle= false;
        document.querySelector(".playerControls").className='playerControls';
      });
      window.addEventListener("keypress", (e)=>{
        idleTime = 0;
        this.idle= false;
        document.querySelector(".playerControls").className='playerControls';
        
        if (e.target.localName !== "input"){
          if (this.props.videoPlaying){
            this.pause();
          }else{
            this.play();
          }
        }
      });
      function timerIncrement() {
        idleTime = idleTime + 1;
        if (idleTime > 3) { // 20 minutes
          this.idle = true;
          document.querySelector(".playerControls").className='playerControls hide';
        }
      }
  }
  componentDidUpdate (e, arg) {
    console.log("updated from", arg)


    if (this.lastWidth == arg.width && this.lastHeight == arg.height){
      let { src, videoPlaying, videoState, time } = this.props;
      if (this.lastState !== videoPlaying || this.lastTimeChange !== time){
        if (videoPlaying == true){
          this.playerControls().play();
        }else{
          this.playerControls().pause();
        }
        if (time){
          this.playerControls().setTime(time);

        }
      }
    }
    let {src , subs} = this.props;
     if (src !== this.currentSrc) {
      this.currentSrc = src;
      if (document.querySelector(".mainVideo")){
        document.querySelector(".vidContainer").removeChild(document.querySelector(".mainVideo"));
      }
      let newVidElement =  document.createElement('video');
      newVidElement.id = "mainMedia";
      newVidElement.className = "mainVideo";
      newVidElement.crossOrigin = "anonymous";
      var sourceMP4 = document.createElement("source"); 
      sourceMP4.type = "video/mp4";
      sourceMP4.src = src;
      
      newVidElement.appendChild(sourceMP4);

      document.querySelector(".vidContainer").appendChild(newVidElement);
      this.playerControls().initHandlers();
      this.playerControls().load(); 
      this.playerControls().size(this.state.width, this.state.height)
    }
     if (subs !== this.currentSubs){
      // this.currentSubs = subs;
      // var sourceSubs = document.createElement("track"); 
      // if (document.querySelector(".mainVideo track")){
      //   document.querySelector(".mainVideo").removeChild(document.querySelector(".mainVideo track"));
      // }
      // sourceSubs.src = subs;
      // sourceSubs.label = "English"
      // sourceSubs.srclang = "en"
      // sourceSubs.kind = "subtitles"
      // sourceSubs.default = true;
      // document.querySelector(".mainVideo").appendChild(sourceSubs);
      // this.playerControls().load(); 
      
     }
  }
  componentWillUnmount () {
      window.removeEventListener("resize", this.updateDimensions);
  }

  playerControls() {
      let player = document.querySelector(".mainVideo");
      this.mainPlayer = player;
      return {
        size: (w, h)=>{
          if (!player) return;
          player.style.width = w +"px";
          player.style.height = h +"px";
        },
        initHandlers: ()=>{
          let player = document.querySelector(".mainVideo");
          if (!player) return;
          player.addEventListener('loadeddata', (e)=> {
            this.videoLoaded(e);
          }, false);
          player.addEventListener('error', (e)=> {
            console.log("error loading vid", e)
          }, false);
          player.addEventListener('timeupdate', (e)=> {
            this.videoTimeUpdating(e);
          }, false);
          player.addEventListener('progress', (e) =>{
            this.videoProgress(e);
          });
          player.addEventListener('canplay', (e) =>{
            console.log('canPlay')
            //debugger;
            this.videoCanPlay(e);
          });
          player.addEventListener('canplaythrough', (e) =>{
            console.log('canplaythrough')
            //debugger;
            this.videoCanPlay(e);
          });
          player.addEventListener('waiting', (e) =>{
            console.log('waiting...')
            //debugger;
            this.videoBuffering(e);
          });
          
        },
        play: ()=>{
          try{
            player.play();
            this.lastState = true;

          }catch(e){

          }
        },
        pause: ()=>{
                if (!player) return;

          player.pause();
          this.lastState = false ;
        },
        load: ()=>{
          if (!player){
            return;
          }
          player.load();
        },
        volume: (value) =>{
          player.volume = value;
        },
        getCurrentTime: () =>{
          return player.currentTime;
        },
        setTime: (value)=>{
          player.currentTime = value;
          this.lastTimeChange = value;

        },
        fullscreen: () =>{
          this.setFullScreen();
        }
      }
  }

  videoProgress(e){
    var range = 0;
    var bf = e.target.buffered;
    var time = e.target.currentTime;

    while(!(bf.start(range) <= time && time <= bf.end(range))) {
      range += 1;
    }
    var loadStartPercentage = bf.start(range) / e.target.duration;
    var loadEndPercentage = bf.end(range) / e.target.duration;
    var loadPercentage = loadEndPercentage - loadStartPercentage;
    this.videoLoadedPerc = loadEndPercentage;
    this.props.heartBeat({"time": e.target.currentTime, "loaded": this.videoLoadedPerc});

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
  videoCanPlay(){
      this.props.videoState({type: 'buffering'});
  }
  videoBuffering(){
      this.props.videoState({type: 'canplay'});
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
  }
  videoTimeUpdating(e) {
    document.querySelector(".timeTrack").value = e.target.currentTime;
    document.querySelector(".metaTime > p > b").innerHTML = this.props.cleanTime(e.target.currentTime);
    document.querySelector(".metaTime > p > span").innerHTML = this.props.cleanTime(e.target.duration);
    this.props.heartBeat({"time": e.target.currentTime, "loaded": this.videoLoadedPerc});
  }

  block(e){
    this.blockTrackBar = true;
  }

  setTrackBar() {

    return this.props.time ? this.props.time : 0;
  }
  setFullScreen(){
   ipcRenderer.send('fullscreen', true)
  }
  render() {
    let { src, videoPlaying, videoState, time, subs } = this.props;
  
    return (
      <div className='vidContainer'>

        {src ?
          <div>
            <Subtitles subs ={this.props.subs} />
          
            <div className='playerControls'>
              {videoPlaying ? <i className='fa fa-pause pause' onClick={()=>this.pause()}></i> : <i className='fa fa-play play' onClick={()=>this.play()}></i>}
              <div className="timeTrackGlow"></div>
              <input type='range' min = '0' max = {this.state.duration} defaultValue={this.state.time} onChange={(e)=>this.adjustGlow(e.target.value)} onMouseDown = {(e)=>this.block(e)} onMouseUp={(e)=>this.changePosition(e)} className='timeTrack'></input>
              <input type='range' defaultValue='50' className='volTrack' onChange={this.setVolume}>

              </input>
              <i className='fa fa-chain newLink' onClick={()=>this.props.changeVideoPop(true)}></i>
              <i className='fa fa-clone fullscreen' onClick={()=>this.playerControls().fullscreen()}></i>
              <div className='metaTime'>
                <p><b>00:00:00</b> / <span>00:00:00</span></p>
              </div>
            </div>
          </div>
          :null
        }
      </div>
    );
  }
}
