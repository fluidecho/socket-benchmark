"use strict";
//
// sockets: bind http.
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
var fs = require('fs');        // for reading https key and cert.
var url = require('url');
var querystring = require('querystring');

// http or https require-d inside functions.
var https = require('https');

// expose.
exports.bind = function(options) { return new Bind(options); };

// inherit event emitter for client.
util.inherits(Bind, events.EventEmitter);

// private.
var socket = undefined;


var bound = false;
function Bind(options) {

  preview('Bind');

  var self = this;

  if ( bound ) {
    // now can allow many bind peers.
    preview('Bind, already bound! return'); 
    return;
  }
  
  bound = true;   // just once.
  var server = https.createServer({ key: fs.readFileSync(options.key), cert: fs.readFileSync(options.cert) }, onconnect);
  server.setTimeout(0);   // disabled http modules automatically disconecting peers after 2 mins (only for http not https).
  
  server.on('error', function(err){
    preview('server', 'on error called', err);
    self.emit('error', err);
  });    
  
  server.on('connection', function(req, res){
    //req.setNoDelay(true);   // turn nagle batching alguruthum off.
    preview('server', 'on connection called');
  });  
  
  server.listen(3455, '127.0.0.1', function() {
    preview('bound at: ' + 'http://127.0.0.1:3455');
  });
  
  
  self.send = function(args) {
  	if ( socket != undefined ) {
  		socket.write( new Message(args).toBuffer() );
  	}
  };
  
  return self;
  
}



function onconnect(req, res) {
    preview('onconnect');

    // if client request favicon return.
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'});
      res.end();
      return;
    }
  
  	var self = this;

    var client_host = ipAddress(req);
    //preview('onconnect, client_host: ' + client_host);
    
    var reqObj = url.parse(req.url);
    ////preview('onconnect', 'reqObj', reqObj);  

    // will allow 'connect' to use any 'service' as 'bind' may not yet have created it.
    preview('Bind, onconnect, responding with 200 code');
    
    res.writeHead(200, {'Server': 'test', 'Content-Type': 'application/json; charset=utf-8'});    // must be sent before flushing queues.

    req.on('close', function(){
      preview('req on close for socket');
      self.emit('closed', true);    // emit 'closed'
      process.exit();
    });

    var reqObj = url.parse(req.url);
    var query = querystring.parse(reqObj.query);

    preview('connected event', {query: query, client_host: client_host});
    self.emit('connected', {query: query, client_host: client_host});
  
    req.on('data', function(chunk) {
      preview('bind got data, chunk', chunk.toString()); 
    });
  
    var parser = new Parser;
    parser.on('data', function(chunk){
      var message = new Message(chunk);
      //preview('newServiceBind, connect', 'message.args', message.args);
      if ( message.args != '_0_' ) {    // _0_ is the start code sent by connect peer.
        //services[s].self.emit('message', message.args[0]);
        self.emit('message', message.args);
      }
    });
    req.pipe(parser);

    // NOTE: must do either .write() OR .end() to get bi-directional com working. Using a start/initeate code: _0_
		res.write( new Message(['_0_']).toBuffer() );

		socket = res;

}  




function ipAddress(request) { 
  return (request.headers['x-forwarded-for'] || '').split(',')[0] 
    || request.connection.remoteAddress 
    || request.socket.remoteAddress;
}

