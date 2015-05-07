"use strict";
//
// sockets: connect http.
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
var fs = require('fs');        // for reading https key and cert.
var url = require('url');
var querystring = require('querystring');


// http or https require-d inside functions.
var https = require('https');

// expose.
exports.connect = function(options) { return new Connect(options); };

// inherit event emitter for client.
util.inherits(Connect, events.EventEmitter);




function Connect(options) {

  preview('Connect');

	var self = this;

	delete options.key;
	delete options.cert;
	delete options.transport;
	
  options.path = '/benchmark/sub/?_protocol=amp';
  options.method = 'PUT';
  options.hostname = '127.0.0.1';
  options.port = 3455;  
  
  preview('options', options);
  
  var sock = https.request(options, function(res) {
    
    preview('Connect, connected', 'request, STATUS: ' + res.statusCode);

    if ( res.statusCode === 200 ) {
      self.emit('connected');
    }

    // amp.
    var parser = new Parser;
    parser.on('data', function(chunk){
      ////preview('connect', 'chunk', chunk);
      ////preview('connect', 'chunk.toString(): ' + chunk.toString());
      var message = new Message(chunk);
      //preview('connect', 'message.args', message.args);
      if ( message.args != '_0_' ) {    // _0_ is the start code sent by connect peer.
        self.emit('message', message.args);
      }
    });
    res.pipe(parser);

  });

  var message = new Message();
  message.push('_0_');    // _0_ is a code picked up by the bind peer to start coms.
  message = message.toBuffer();
  sock.write( message );    // must!
  
}
   

