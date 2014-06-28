var net = require('net')
var HOST = '127.0.0.1'
var PORT = 3000

console.log("Trying " + HOST + '...');

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
  console.log("Error connecting. The server might be down.")
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
