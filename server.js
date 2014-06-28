var net = require('net');
var nameMap = {};											// maps a connection id to a user name

var sockList = {}											// maps a connection id to a socket object
var list = []												  // list that holds ALL connection id's
var chatRoom = []											// Room 1, which holds all the connection id's in that room
var hotTubRoom = []									  // Room 2, which holds all the connection id's in that room
var HOST = '127.0.0.1'
var PORT = 3000;

var connectionCount = 0;

net.createServer(function(sock) {

  console.log('CONNECTED:' + sock.remoteAddress + ':' + sock.remotePort);
  sock.write("Login name?");

  sock.connId = connectionCount++;

  sock.on('data', function(data) {

    data = data.toString('utf8').trim();
    console.log(sock.remotePort);

    inList = list.indexOf(sock.connId) != -1
    inChatRoom = chatRoom.indexOf(sock.connId) != -1
    inHotTubRoom = hotTubRoom.indexOf(sock.connId) != -1

    if (!inList) {                                                                      // The user is in the stage of choosing a username

      for (var key in nameMap) {              

        if (data == nameMap[key]) { 
          sock.write("Already taken");
          return;
        }
      }

      // User is now in the main lobby
      list.push(sock.connId);
      nameMap[sock.connId] = data;
      sockList[sock.connId] = sock;
      sock.write("Welcome " + nameMap[sock.connId]);
      sock.write("\nUsage:\n" +
                "/rooms\n" + 
                "/join <room>\n" +
                "/leave (to leave the chat room)\n" +
                "/quit (to quit the program at any time)\n")
      return;
    }

    if (inList && !inChatRoom && !inHotTubRoom) {    // The user is in the main lobby 

      console.log(data);

      if (data == '/rooms') {

        sock.write("Active rooms are:\n" + "* Chat(" + chatRoom.length + ")\n" + "* HotTub(" + hotTubRoom.length + ")\n" + "end of list");
      }

      else if (data == '/join Chat') {
	    	console.log("Client joined chat");
        chatRoom.push(sock.connId);
	      var message = "entering room: Chat\n";;
	      for (var i = 0; i < chatRoom.length; i++) {

	        message = message.concat("* " + nameMap[chatRoom[i]]);
	        if (chatRoom[i] == sock.connId) {
	          message = message.concat(" (** this is you)");
	        }
	        message = message.concat("\n");
	      }
	      message = message.concat("end of list");
	      sock.write(message);
      }

      else if (data == '/join HotTub') {
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

      else {
        message = "\nYou have entered invalid input.\n"
        sock.write(message)
      }

      return;
    }

    if (inChatRoom) {                                                                 // Handle data received by a  client in room 'Chat'
      if (data == '/leave') {
        
        for (var i = 0; i < chatRoom.length; i++) {
			    if (sockList[chatRoom[i]] != sock.connId) {
			      sockList[chatRoom[i]].write(nameMap[sock.connId]  + " has left the chat");
			    }
		    }

        for (var i = chatRoom.length - 1; i >= 0; i--) {
          if (chatRoom[i] == sock.connId) {
            chatRoom.splice(i,1)
            break
          }
        }
		    return;
      }

      for (var i = 0; i < chatRoom.length; i++) {
        if (sockList[chatRoom[i]] != sock.connId) {
          sockList[chatRoom[i]].write(nameMap[sock.connId] + ":" + data.toString('utf8').trim());
        }
      }

    }
	
    else if (inHotTubRoom) {                                                               // Handle data received by a client in room 'HotTub'
      if (data == '/leave') {
        
        for (var i = 0; i < hotTubRoom.length; i++) {
			    if (sockList[hotTubRoom[i]] != sock) {
			      sockList[hotTubRoom[i]].write(nameMap[sock.connId]  + " has left the chat");
			    }
		    }

        for (var i = hotTubRoom.length - 1; i >= 0; i--) {
          if (hotTubRoom[i] == sock.connId) {
            sockList[hotTubRoom[i]].write("You are back in the main lobby")
            hotTubRoom.splice(i,1)
            break
          }
        }
		    return;
      }

      for (var i = 0; i < hotTubRoom.length; i++) {
        if (sockList[hotTubRoom[i]] != sock) {
          sockList[hotTubRoom[i]].write(nameMap[sock.connId] + ":" + data.toString('utf8').trim());
        }
      }

  }

  });

  sock.on('close', function() {
	
    if (list.indexOf(sock.connId) != -1) {
      console.log('Removed ' + sock.connId + ' from main lobby list')

      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] == sock.connId) {
          list.splice(i, 1)
          break
        }
      }
    }	

    if (chatRoom.indexOf(sock.connId) != -1) {

      console.log('Removed ' + sock.connId + ' from chat room list')
      
      for (var i = chatRoom.lenth - 1; i >= 0; i--) {
        if (chatRoom[i] == sock.connId) {
          chatRoom.splice(i, 1)
          break
        }
      }
    }

    else if (hotTubRoom.indexOf(sock.connId) != -1) {
    
      console.log('Removed ' + sock.connId + ' from hot tub list')

      for (var i = hotTubRoom.length - 1; i >=0; i--) {
        if (hotTubRoom[i] == sock.connId) {
          hotTubRoom.splice(i, 1)
          break
        }
      }

      console.log(hotTubRoom.length)
    }

    if (sock.connId in nameMap) {

      console.log('Removed ' + sock.connId + ' from name map')
      delete nameMap[sock.connId];
    }
  });

}).listen(PORT, HOST);
