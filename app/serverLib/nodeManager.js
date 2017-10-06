class nodeManager{
    constructor(){
      this.nodes = {};
      this.subscriptions ={};
      this.express = require('express');
      const cors = require('cors');
      const app = this.express();
      this.currentRange= null;
      app.use(cors());
      app.all('/', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
       });
      app.get('/create/:newId/:size', async (req, res, next)=> {
        res.writeHead(200, {"Content-Type": "text/html"});
        let id = req.params.newId
        let size = req.params.size
        let rndPort = Math.floor(Math.random() * 10000) + 1000;
        await this.createFile(`./app/temp/${id}`, size);
        this.newNode(id, rndPort, size, ()=>{
          res.end(`${rndPort}`);

        });
      });    
      app.get('/position/:id/:pos/:end', async (req, res, next)=> {
        res.writeHead(200, {"Content-Type": "text/html"});
        let id = req.params.id
        let pos = req.params.pos
        let end = req.params.end
        this.nodes[`${id}`].setPosition(pos)
        this.sendToNode(id,'position',{start:pos, end:end});
      });    

      app.get('/view/:id',  (req, res, next)=> {
        // res.writeHead(200, {"Content-Type": "text/html"});
        // res.end(`<video src="/stream/${req.file.id}" controls></video>`);
        let id = req.params.id;
        let fileSize =  this.nodes[`${id}`].fileSize;
        const fs = require('fs');
        var range = req.headers.range || "bytes=0-";
        let fileName = `./app/temp/${id}`;
        if (!range) {
          // 416 Wrong range
          return res.sendStatus(416);
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = fileSize
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;
        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4"
        });

        // doStream = doStream.bind(this)
        // checkUp = checkUp.bind(this)
        // checkUp();
        // function checkUp(){
        //   if (this.nodes[`${id}`].checkPosition(start)){
        //     doStream();
        //   }else{
        //     this.nodes[`${id}`].setPosition(start)
        //     this.sendToNode(id,'position',{start:start, end:end});
        //     setTimeout(()=>{
        //       checkUp();
              
        //     }, 3000)
        //   } 
        // }
        // function doStream(){
          var stream = fs.createReadStream(fileName, {start: start, end: end})
          .on("open", function () {
            stream.pipe(res);
          })
          .on("data", function (data) {
     
              if (data.length ==0){
                console.log("DATA LENGHT 0")
              }
              //stream.pipe(res);
            })
          .on("closed", function (data) {
             
                console.log("DATA clkosed")
              
              //stream.pipe(res);
            })
          .on("exit", function (data) {
             
                console.log("DATA EXIT")
              
              //stream.pipe(res);
            })
            .on("error", function (err) {
              console.log("DATA ERR")
                  next(err);
          });
        // }

        // function readIt(id,fileName, start, end, fileSize, finished){
        //   var bytesRead = start;
        //   if (start == 0){
        //     end =(1024 * 10000);
        //   }else{
        //     end = (bytesRead + (1024* 10000));
        //   }
        
        //   var stream = fs.createReadStream(fileName, { start: bytesRead, end: end })
        //   .on("open", (data)=> {
        //   //  stream.pipe(res);
          
        //   })
        //   .on("data", (data)=> {
        //     res.write(data);

        //     bytesRead += data.length;
        //   }).on('end', ()=> {
        //     //console.log("ended with:", bytesRead , fileSize);
        //     if (bytesRead >= fileSize){
        //       console.log("DONE")
        //     }else{
        //       console.log("ended for ", bytesRead, end)
        //       setTimeout(()=>{
				// 				readIt(id,fileName, bytesRead, end, fileSize, finished);
				// 		  }, 1000);
        //     }
        //   });
        // }
        // readIt = readIt.bind(this)
     

        //   readIt(id,fileName, 0, 1024, fileSize, function(finished){
    
        //   });
   

      });    
  
      app.listen(8008, ()=>{
        app.set('listening', true)
      });
    }

    createFile(fileName, size){
      return new Promise((resolve, reject)=>{
          let pwr = 10485760;
          let path = fileName
          let toLimit = Math.ceil(size / pwr)
          const fs = require('fs');
          console.log(toLimit);
         
          let finished = 0;
          const BinaryFile = require('binary-file');
          const myBinaryFile = new BinaryFile(fileName, 'w+');
          myBinaryFile.open().then(function () {
            for (var index = 0; index < toLimit + 1; index++) {
              if (finished >= parseInt(size)){
                myBinaryFile.close();
                console.log("sync done")
                resolve(finished)
                break;
              }else{
                
                myBinaryFile.write(new Buffer(pwr), pwr * index)
                console.log('File written');
                finished+= pwr;            
              }
            }
            
          });
          
        })
      }
      
    sendToNode(id,topic, data){
      if (this.nodes[`${id}`]){
        //console.log("sending to node...")
        this.nodes[`${id}`].send({action:topic, data:data})
            
      }
    }
  
    newNode(id, subPort, fileSize, ready){
      const fs = require('fs');
      let process = require('child_process');
      var node = process.fork('./app/serverLib/tcpNode.js');
      node.id = id;
      node.position = 0;
      node.fileSize = fileSize,
      node.byteTracker = [

      ]
      node.checkPosition = (position)=>{
        let found = false;
        node.byteTracker.forEach((item)=>{
          if ( item.from < position && item.to > position){
            found = true;
          }
        })
        return false;
      }
      node.setPosition= (position)=>{
        node.byteTracker.push({
          from: parseInt(node.position),
          to: parseInt(node._markedBytes)
        })
        node._markedBytes = 0;
        node.position = parseInt(position);
      }
      const BinaryFile = require('binary-file');
      const myBinaryFile = new BinaryFile(`./app/temp/${node.id}`, 'r+');
      node.on('message', (data) =>{
      //  console.log('stdout: ' , data);
        if (data.type == 'Buffer'){        
          //  var buffer = new Buffer( (data) );
            // let ranges = (buffer.toString('utf8',0,16))
            // let spliceBuffer = buffer.slice(16);
            // let rangeFrom = parseInt(ranges.split(",")[0])
            // let rangeTo = parseInt(ranges.split(",")[1])
            var buffer = new Buffer( new Uint16Array(data.data) );
            
            var fs = require('fs');
          console.log(node.position , node._markedBytes)
            myBinaryFile.write(buffer, parseInt(node.position) + parseInt(node._markedBytes))
            node._markedBytes+= buffer.length;
            
            // fs.appendFile(`./app/temp/${123}-${rangeFRom}`, buffer, 'binary', function (err) {
              
              // });
              //res.write(buffer, 'binary');                  
              
              
            }else{
              let d = data;
              if (d.action =='ready'){
                node.send({"action": "listen", port: subPort});
                myBinaryFile.open().then(function () {
                  console.log('File opened');
      
                });
            if ( ready){
                ready();
            }
          }
        }
      });
      this.nodes[`${id}` ] = node;

    }
  }
const NodeManager = new nodeManager();
  