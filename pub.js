var preview = require('preview')('socket_pub');
var argv = require('minimist')(process.argv.slice(2));
var sockets = require('./');

var options = {
  key: __dirname + '/lib/https/keys/key.pem',
  cert: __dirname + '/lib/https/keys/cert.pem',
 	//ca: [ __dirname + '/lib/https/keys/cert.pem' ],
  rejectUnauthorized: false,
	requestCert: true
};

if ( argv.transport ) {
	console.log('use socket transport: ' + argv.transport);
	options.transport = argv.transport
}

var perTick = 10;

var buf = new Buffer(Array(101).join('a'));
console.log('sending %d byte messages', buf.length);

var pub = sockets.bind(options);

pub.on('close', function(){
  console.log('pub> sub close so exit');
  process.exit();
});


function more() {
	if ( !argv.slow ) {
		for (var i = 0; i < perTick; ++i) pub.send([buf]);
		setImmediate(more);
  } else {
		setInterval(function(){
			pub.send([buf]);
		}, 1000);
  }
}

more();
