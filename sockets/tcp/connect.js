"use strict";
//
// sockets: connect tcp.
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
var preview = require('preview')('connect');

// http or https require-d inside functions.
var net = require('net');

// expose.
exports.connect = function(options) { return new Connect(options); };

// inherit event emitter for client.
util.inherits(Connect, events.EventEmitter);




function Connect() {

  preview('Connect');

	var self = this;

  var options = {};   // set options for http request.

  options.host = '127.0.0.1';
  options.port = 3459;  
  var sock = new net.Socket;
  sock.setNoDelay();
 
 
  sock.on('connect', function(){
    preview('connect-ed');
    var parser = new Parser;
 		sock.pipe(parser);
    parser.on('data', function(chunk){
      var message = new Message(chunk);
      self.emit('message', message.args);
    });
  }); 
  

	
	sock.connect(options);
  
}
   

