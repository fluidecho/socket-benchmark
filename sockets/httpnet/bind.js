"use strict";
//
// sockets: bind httpnet.
//
// Version: 0.0.1
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2015 Mark W. B. Ashcroft.
// Copyright (c) 2015 FluidEcho.
//


var util = require('util');
var events = require('events');
var amp = require('amp');
var Message = require('amp-message');
var Parser = amp.Stream;
var preview = require('preview')('bind');

// http or https require-d inside functions.
var net = require('net');

// expose.
exports.bind = function(options) { return new Bind(options); };

// inherit event emitter for client.
util.inherits(Bind, events.EventEmitter);

// private.
var socket = undefined;

process.on('uncaughtException', function(err) {
	preview('uncaughtException, err', err)
})


var bound = false;
function Bind(options) {

  preview('Bind');

  var self = this;

  if ( bound ) {
    // now can allow many bind peers.
    preview('Bind, already bound! return'); 
    return;
  }


  // can generate own keys using OpenSSL, see: http://nodejs.org/api/tls.html
  bound = true;   // just once.
  //var server = httpModule.createServer({ key: fs.readFileSync(_settings.key), cert: fs.readFileSync(_settings.cert) }, onconnect);
  var server = net.createServer(onconnect);

	//server.setNoDelay(true);   // turn nagle batching alguruthum off.

  server.on('error', function(err){
    preview('server', 'on error called', err);
    self.emit('error', err);
  });        

  server.listen(3457, '127.0.0.1', function() {
    preview('bound at: ' + 'tcp://127.0.0.1:3455');
  });
  
  
  self.send = function(args) {
  	if ( socket != undefined && socket.writable ) {
  		//socket.write( new Message(args).toBuffer() );
  		add( pack(args) );
  	}
  };
  
  
  return self;
  
}



function onmessage(sock){
  var self = this;
  return function(buf){
    var msg = new Message(buf);
    self.emit.apply(self, ['message'].concat(msg.args));
    preview('onmessage, msg', msg.args);
  };
}



function onconnect(sock) {
  preview('onconnect');

 	var self = this; 
	
	sock.setNoDelay(true);   // turn nagle batching alguruthum off.	
	socket = sock;
	
	sock.on('close', function(){
    socket = undefined;
    preview('sock on close for socket');
    self.emit('closed', true);    // emit 'closed'
    process.exit();		// TODO: have a 'distry' command.
  });


  preview('connected event');
  self.emit('connected', true);
  
  sock.on('data', function(chunk) {
    preview('bind got data, chunk', chunk.toString()); 
    
    // if okay, return 200.
    //sock.setNoDelay();		// makes half the speed.
    //sock.write('HTTP/1.1 200 Connection Established\r\n\r\n'); 
  });


  var parser = new Parser;
  parser.on('data', function(chunk){
    var message = new Message(chunk);
    if ( message.args != '_0_' ) {    // _0_ is the start code sent by connect peer.
      self.emit('message', message.args);
    }
  });
  sock.pipe(parser);

	

}  




// XTRA: -----------------------------------------------------:

// BUFFER

var buffer = new Buffer(0);		// message buffer.
var ttl = 100;
var batchTimer = undefined;
var mtu = 8960;		// if MTU is 9000 use 8960, if 1500 use 1460 - buffer size before sending.
var nodelay = false;


function init() {
	process.nextTick(function(){
    batchTimer = setInterval(flushBatch, ttl);
  });
}


// add new message to buffer
function add(msg){
	buffer = Buffer.concat([buffer, msg], buffer.length + msg.length);    // on msg concate buffer.
	if ( buffer.length >= mtu || nodelay ) {
		flushBatch();
	}
}

// empty the message buffer
function empty(){
  buffer = null;
  buffer = new Buffer(0);
  return; 
}


// pack this message, into amp buffer
function pack(args){
  var msg = new Message(args);
  return msg.toBuffer();
}

// send buffer to sockets
function flushBatch(){
  if (buffer.length === 0) return;

  if ( socket != undefined ) {
  	preview('write to socket');
  	socket.write( buffer );
  }

	return empty();
}

init();		// initiate or something similar.


