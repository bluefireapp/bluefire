class Jet{
    constructor(message, instance){
        const http = require('http');
        this.http = http;
        this.instance = instance;
        let { range } = message.headers
        this.id = message.reqId;
        this.range  = range;
        this.socket = socket;
        
        var net = require('net');
        
        var socket = new net.Socket();
        socket.connect(this.id, '127.0.0.1', ()=>{
            console.log('Connected');
            this.start();
        });
        
        socket.on('close', () =>{
            console.log('Connection closed');
        });
        this.socket = socket;
    }
    start(){
        // var options = {
        //     host: 'localhost',
        //     port: 8005,
        //     path: '/stream/8b34744c-d30b-4e31-98fd-f0f954056121',
        //     headers:{
        //         range: this.range
        //     }
        // };
        var options = {
            host: 'media.w3.org',
            port: 80,
            path: '/2010/05/sintel/trailer.mp4',
            headers:{
                range: this.range
            }
        };
        this.http.get(options, (resp)=>{
            let obj = {
                headers: resp.headers,
                kek: 123,
                reqId: this.id
            }
            delete obj.headers.connection;
            let objBuffer = new Buffer(JSON.stringify(obj));
            let initBuffer = new Buffer(16);
            initBuffer.write(`${this.id}`)
            var mergedObjBuffer = Buffer.concat([initBuffer, objBuffer]);
            console.log(obj)
            this.socket.write(objBuffer,  (err) =>{ 
                console.log("SENT")
                resp.on('data', (chunk)=>{
                    var newBuffer = Buffer.concat([initBuffer, chunk]);
                    //do something with chunk         
                    console.log('jetId ',this.id,newBuffer.length)
                    this.socket.write(chunk)
                });
            });
        }).on("error", (e)=>{
            console.log("Got error: " + e.message);
        });
    }
}
class tcpUpstream{
    constructor(){
        const http = require('http');
        this.http = http;
        this.request = require('request')
        this.instance =0;
        this.makeRequest();
    }

    makeRequest(endpoint, from, to){
        const fs = require('fs')
        let position;
        this.request('http://localhost:8008/create/1234/334508032',  (error, response, body)=> {
            
            console.log(body)
            var net = require('net');
            let port = parseInt(body);
            var client = new net.Socket();
            client.connect(port, '127.0.0.1', ()=>{
                console.log('Connected');
            });
            
            client.on('close', () =>{
                console.log('Connection closed');
            });
            let freshStart = false;
            let lastBytesFrom;
            client.on('data', (data) =>{
                let json = new Buffer(data).toString();
                json = JSON.parse(json)
                console.log(json)
                if (lastBytesFrom !== json.data.from){
                    freshStart = true
                    lastBytesFrom = json.data.from;
                    readWindow(parseInt(json.data.start), parseInt(json.data.end))
                }else{
                    readWindow(parseInt(json.data.start), parseInt(json.data.end))

                }
                function readWindow(start, end){
                    let dataAlreadyRead =0
                    read(start, start + 100)
                    function read(from, to){
                        console.log(from, to,dataAlreadyRead)
                        var stream = fs.createReadStream(`./creators.mkv`, {start: from, end:to})
                        .on("open", function () {
        
                        })
                        .on("data", function (data) {
                            dataAlreadyRead +=data.length;
                            client.write(data)
                        })
                        .on("error", function (err) {
                                console.log(err);
                        })
                        .on("end", function (err) {
                            if (!freshStart){
                                read(dataAlreadyRead, dataAlreadyRead+ 100)
                            }else{
                                freshStart = false;
                            }
                        })
                        .on("close", function (err) {
                            
                        });
                    }
                }
                    
         
            });
        }).on("error", (e)=>{
            console.log("Got error: " + e.message);
        });

    }
}

let t = new tcpUpstream();