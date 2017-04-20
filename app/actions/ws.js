class bluefireEngine{
  constructor(){
    var connection = new WebSocket('ws://thorium.online:8003');
    // When the connection is open, send some data to the server
    connection.onopen = function () {
      connection.send('Ping'); // Send the message 'Ping' to the server
    };

    // Log errors
    connection.onerror = function (error) {
      console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = function (e) {
      console.log('Server: ' + e.data);
    };

  }
}

export let bl = new bluefireEngine();
