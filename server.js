var net = require('net');
var nameMap = {};											// maps a connection id to a user name

var sockList = {}											// maps a connection id to a socket object
var list = []												  // list that holds ALL connection id's
var chatRoom = []											// Room 1, which holds all the connection id's in that room
var hotTubRoom = []									  // Room 2, which holds all the connection id's in that room
var HOST = '127.0.0.1';
var PORT = 30000;

var connectionCount = 0;

Array.prototype.contains = function(id) {
  for (i in this) {
    if (this[i] == id) return true;
  }
  return false;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

net.createServer(function(sock) {

  console.log('CONNECTED:' + sock.remoteAddress + ':' + sock.remotePort);
  sock.write("Login name?");

  sock.connId = connectionCount++;

  sock.on('data', function(data) {

    data = data.toString('utf8').trim();
    console.log(sock.remotePort);

    if (!list.contains(sock.connId)) {                                                                      // The user is in the stage of choosing a username

      for (var key in nameMap) {              

        if (data == nameMap[key]) {
          sock.write("Already taken");
          return;
        }
      }

      list.push(sock.connId);
      nameMap[sock.connId] = data;
      sockList[sock.connId] = sock;
      sock.write("Welcome " + nameMap[sock.connId]);
      return;
    }

    if (list.contains(sock.connId) && !chatRoom.contains(sock.connId) && !hotTubRoom.contains(sock.connId)){    // The user is in the main lobby 

      console.log(data);
      if (data == '/rooms') {

        sock.write("Active rooms are:\n" + "* Chat(" + chatRoom.length + ")\n" + "* HotTub(" + hotTubRoom.length + ")\n" + "end of list");
      }
      if (data == '/join Chat') {
	    	console.log("Client joined chat");
        chatRoom.push(sock.connId);
      }
      if (data == '/join HotTub') {
	      console.log("Client joined HoTtub");
        hotTubRoom.push(sock.connId);
        var message = "entering room: HotTub\n";
        for (var i = 0; i < hotTubRoom.length; i++) {

          message = message.concat("* " + nameMap[hotTubRoom[i]]);
          if (hotTubRoom[i] == sock.connId) {
            message = message.concat(" (** this is you)");
          }
          message = message.concat("\n");
          
        }
        message = message.concat("end of list");
        sock.write(message);
      }

      return;
    }

    if (chatRoom.contains(sock.connId)) {                                                                 // Handle data received by a  client in room 'Chat'
      if (data == '/leave') {
        
        for (var i = 0; i < chatRoom.length; i++) {
			    if (chatRoom[i] != sock.connId) {
			      sockList[i].write(nameMap[sock.connId]  + " has left the chat");
			    }
		    }
		    chatRoom = chatRoom.remove(sock.connId);
		    return;
      }

      for (var i = 0; i < chatRoom.length; i++) {
        if (chatRoom[i] != sock.connId) {
          sockList[i].write(nameMap[sock.connId] + ":" + data.toString('utf8').trim());
        }
      }

    }
	
	if (hotTubRoom.contains(sock.connId)) {                                                               // Handle data received by a client in room 'HotTub'
      if (data == '/leave') {
        
        for (var i = 0; i < hotTubRoom.length; i++) {
			    if (hotTubRoom[i] != sock.connId) {
			      sockList[i].write(nameMap[sock.connId]  + " has left the chat");
			    }
		    }
		    hotTubRoom = hotTubRoom.remove(sock.connId);
		    return;
      }

      for (var i = 0; i < hotTubRoom.length; i++) {
        if (hotTubRoom[i] != sock.connId) {
          sockList[i].write(nameMap[sock.connId] + ":" + data.toString('utf8').trim());
        }
      }

  }

  });

  sock.on('close', function(data) {
    console.log('CLOSED:')
    list.remove(sock.connId);
    delete nameMap[sock.connId];
  });

}).listen(PORT,HOST);
