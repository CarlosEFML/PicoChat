const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 8080
});
let ids={}
let sockets = new Map();

function stringToUint8(str) {
  return new TextEncoder().encode(str)
}

function sendToAll(msg) {
  for(var entry of sockets.entries()) {
    if(entry[1]) { // socket have an id
      entry[0].send(msg)
    }
  }
}

server.on('connection', function(socket) {
  sockets.set(socket, null)
  socket.send(stringToUint8("server: type a name to identify yourself"))
  socket.send(stringToUint8("(max 16 chars)."))

  socket.on('message', function(msg) {
    console.log(msg.toString())
    var id=sockets.get(socket)
    if(!id) {
      var id=stringToUint8(msg.toString().substring(0,16))
      if(ids[id]) {
        socket.send(stringToUint8("server: this id is being used,"))
        socket.send(stringToUint8("please type another one"))
        socket.send(stringToUint8("(max 16 chars)."))
      } else {
        ids[id]=true
        socket.send(stringToUint8("server: welcome! your id is"))
        socket.send(id)

        var joinMsg=stringToUint8(" joined the chat.")
        var pack=new Uint8Array(id.length+joinMsg.length)
        pack.set(id)
        pack.set(joinMsg, id.length)
        sendToAll(pack)

        sockets.set(socket,id)
      }
    } else {
      var pack=new Uint8Array(id.length+2+msg.length)
      pack.set(id)
      pack.set(stringToUint8(": "), id.length)
      pack.set(msg, id.length+2)
      sendToAll(pack)
    }
  });

  socket.on('close', function() {
    var id=sockets.get(socket)
    delete ids[id]
    sockets.delete(socket)

    var leftMsg=stringToUint8(" left the chat.")
    var pack=new Uint8Array(id.length+leftMsg.length)
    pack.set(id)
    pack.set(leftMsg, id.length)
    sendToAll(pack)
  });
});

