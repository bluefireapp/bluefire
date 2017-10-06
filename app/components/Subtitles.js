import React, { Component } from 'react';
import { Link } from 'react-router';
const parser = require('subtitles-parser');

export default class Subtitles extends Component {
  constructor(props){
    super();
    this.state = {
        currentSubs: ''
    }
    this.parseSubs = this.parseSubs.bind(this)
    this.syncSubs = this.syncSubs.bind(this)
    this.downloadSubs = this.downloadSubs.bind(this)

  }

  parseSubs(time){
     let subFound = (itsTime(this.parsedSubs,time))
     if (subFound){
      document.querySelector(".subtitles .sub").innerHTML =(subFound.text);
     }
  }

  syncSubs(time){
    if (!this.parsedSubs) return;
    let subFound = (itsTime(this.parsedSubs,time))
    if (subFound){
      if (document.querySelector(".subtitles .sub").innerHTML !== subFound.text){
        document.querySelector(".subtitles .sub").innerHTML =(subFound.text);
      }
    }else{
      document.querySelector(".subtitles .sub").innerHTML ='';
     }
    function itsTime(arr, time){
      time = time * 1000;
      var i = arr.length;
      while (i--) {
        let subFound = arr[i];
        if  (time >= subFound.startTime && subFound.endTime > time){
          return subFound;
          break;
        }
      }
    }
  }
  downloadSubs(url){
		fetch(url, {
			method: 'get'
		}).then(function(blob) {
      return blob.text();
		}).then((data)=> {
      this.rawSubs = data;
     // var srt = fs.readFileSync('test.srt','utf8');
      var subTimeList = parser.fromSrt(this.rawSubs, true);
      console.log(subTimeList)
      this.parsedSubs = subTimeList;
		}).catch((err)=> {

    });
  }
  componentDidUpdate(){
   
    if (this.props.subs !== this.currentSubs){
      this.currentSubs = this.props.subs;      
      this.downloadSubs(this.props.subs)
    }
    if (!this.syncTimer){
      this.syncTimer = setInterval(()=>{
        let player = document.querySelector(".mainVideo");
        this.syncSubs(player.currentTime);
      },300);
    }

  }

  render() {
    return (
      <div>
          <div className='subtitles'>
            <p className='sub'></p>
          </div>
      </div>
    );
  }
}
