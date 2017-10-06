class tcpJet{
    constructor(){
        const http = require('http');
        this.http = http;

        this.makeRequest();
    }

    makeRequest(endpoint, from, to){

        var net = require('net');
        
        var client = new net.Socket();
        client.connect(1337, '127.0.0.1', ()=>{
            console.log('Connected');
        });
              
        client.on('close', () =>{
            console.log('Connection closed');
        });
              
        client.on('data', (data) =>{
            let message = new Buffer(data).toString();
            message = JSON.parse(message);
            if ( message.headers){
                if ( !message.headers.range) return;
                let {range} = message.headers
                console.log('dataFromServer:',message);
                var options = {
                    host: '37.120.5.139',
                    port: 8005,
                    path: '/stream/0e3fefea-aed8-4ae0-a53c-f1b9c647e8ad',
                    headers:{
                        range: range
                    }
                };
                this.http.get(options, (resp)=>{
                    let obj = {
                        headers: resp.headers,
                    }
                    delete obj.headers.connection;
                    client.write(JSON.stringify(obj),  function(err) { 
                        console.log("SENT")
                    });
                    resp.on('data', (chunk)=>{
                        //do something with chunk
                        
                        client.write(chunk)
                    });
                }).on("error", (e)=>{
                    console.log("Got error: " + e.message);
                });
            }
        });

    }
}

let t = new tcpJet();