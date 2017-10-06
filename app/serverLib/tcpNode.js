class tcpServerNode{
    constructor(){
        this.net = require('net');
        this.processMessage = this.processMessage.bind(this)
        this.activeSocket;
        process.on('message', this.processMessage);
        process.send({action: "ready"});

    }

    processMessage(message){
        if (!message) return;
       // console.log("tcpServerNode: " , message)
        if (message.type == 'Buffer'){
    
        }else{
            let parsedMessage = (message);
            console.log(parsedMessage)

            if (parsedMessage.action == 'listen'){
                this.server = this.net.createServer((socket) => {
                    this.activeSocket = socket;
                    socket.on('data', this.socketMessage);
                    socket.on('error', this.socketError)
                });
                this.server.listen(parsedMessage.port, 'localhost');
                console.log(`listening on port ${parsedMessage.port}`)
            }

            if (parsedMessage.action == 'headers'){
                if (this.activeSocket){
                    console.log("writting to socket: " , message)
                    this.activeSocket.write(JSON.stringify(message))
                }
            }
            if (parsedMessage.action == 'position'){
                if (this.activeSocket){
                    console.log("writting to socket: " , message)
                    this.activeSocket.write(JSON.stringify(message))
                }
            }
            if (parsedMessage.action == 'ping'){
                if (this.activeSocket){
                    console.log("writting a ping: " , message)
                    this.activeSocket.write(JSON.stringify(message))
                }
            }
        }
    }

    socketMessage(data){
       // console.log(data);
        process.send(data);
    }
    socketError(err){
       // console.log(err);
        this.activeSocket = null;
    }
}

let tcp = new tcpServerNode();