var args = process.argv.slice(2);
if (args.length < 2) {
  console.log("You have entered the wrong number of arguments. Enter both the address followed by the port number");
  process.exit();
}

console.log("Trying " + args[0] + '...');

var net = require('net')
var HOST = args[0];
var PORT = args[1];
var client = new net.Socket();

function done() {
  console.log("BYE");
}
client.connect(PORT, HOST, function() {
    console.log("Connected to " + HOST + '.');
    console.log("Escape character is '^'");
});

client.on('data', function(data) {

  console.log(data.toString('utf8'));

});

client.on('error', function(e) {
  console.log("You have entered an incorrect address or port number");
  process.exit(0);  

});

process.stdin.resume();
process.stdin.setEncoding('utf8');
var util = require('util')

process.stdin.on('data', function(text) {
  if (text.toString('utf8').trim() == '/quit') {
    process.exit();
  
  }
  client.write(text);
});
