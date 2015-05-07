"use strict";
//
// sockets: connect tls.
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
var fs = require('fs');
var tls = require('tls');

// expose.
exports.connect = function(options) { return new Connect(options); };

// inherit event emitter for client.
util.inherits(Connect, events.EventEmitter);




function Connect(options) {

  preview('Connect');

	var self = this;

  options.host = '127.0.0.1';
  options.port = 3455;  
  //var sock = new tls.Socket(options);
  //sock.setNoDelay();
  
  //process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  
  var setting = { 
  	host: options.host, 
  	port: options.port, 
  	rejectUnauthorized: false
  };
  
 
	preview('setting', setting)
 

	var sock = tls.connect(setting, function() {
		preview('connected');
		//process.stdin.pipe(sock);
		//process.stdin.resume();
	});
	sock.setEncoding('utf8'); 
 
 	//sock.on('data', function(chunk) {
	//	preview('socket, data chunk', chunk.toString());
	//});

	var parser = new Parser;
 	sock.pipe(parser);
  parser.on('data', function(chunk){ 
    preview('parser, data chunk', chunk.toString());
    //var args = chunk.map(function(c){
    //  return c.toString();
    //});

    //var meth = args.shift();
    //console.log('.%s(%s)', meth, args.join(', '));    
    var message = new Message(chunk);
    self.emit('message', message.args);
  });
    
  //sock.on('connect', function(){
  //  preview('connect-ed');
  //}); 
 
  
}
   

