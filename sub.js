var preview = require('preview')('socket_sub');
var humanize = require('humanize-number');
var argv = require('minimist')(process.argv.slice(2));
var sockets = require('./');
var babar = require('babar');
var colors = require('colors');

var options = {
  key: __dirname + '/sockets/https/keys/key.pem',
  cert: __dirname + '/sockets/https/keys/cert.pem',
 	//ca: [ __dirname + '/sockets/https/keys/cert.pem' ],  
  rejectUnauthorized: false
};

if ( argv.transport ) {
	console.log('use socket transport: ' + argv.transport);
	options.transport = argv.transport
}

var n = 0;
var ops = 5000;
var bytes = 100;
var prev = 0;
var start = 0;
var results = [];

var graph = [];
var x = 0;
var persec = 0;

var sub = sockets.connect(options);
sub.on('message', function(msg){
	preview('message', msg);
	if ( start === 0 ) {
		start = Date.now();
		prev = start;
	}
	
  if (n++ % ops == 0) {
    var ms = Date.now() - prev;
    var sec = ms / 1000;
    persec = ops / sec | 1;
    results.push(persec);
    process.stdout.write('\r  [' + persec + ' ops/s] [' + n + ']');
    prev = Date.now();
  }

});
	
setInterval(function(){
	graph.push([x++, persec]);	
}, 50);  

function done(){
  var ms = Date.now() - start;
  var avg = n / (ms / 1000);
  console.log('\n---------------------------------------------');  
  console.log('| RESULTS FOR SOCKET ' + argv.transport + ' ~');
  console.log('---------------------------------------------');
  process.stdout.write('|   median: '); process.stdout.write(humanize(median(results)).bold + ' ops/s\n'.bold);
  console.log('|     mean: %s ops/s', humanize(avg | 0));
  console.log('|    total: %s ops in %ds', humanize(n), ms / 1000);
  console.log('|  through: %d MB/s', ((avg * bytes) / 1000 / 1000).toFixed(2));
  console.log('---------------------------------------------');
  console.log('| OPERATIONS PER SECOND OVER TIME ~');
  console.log('---------------------------------------------');
  console.log(babar(graph, {
		color: 'green',
		yFractions: 0
	}));
  process.exit();
}


function sum(arr) {
  return arr.reduce(function(sum, n){
    return sum + n;
  });
}

function min(arr) {
  return arr.reduce(function(min, n){
    return n < min
      ? n
      : min;
  });
}

function median(arr) {
  arr = arr.sort();
  return arr[arr.length / 2 | 0];
}


process.on('SIGINT', done);
setTimeout(done, 5000);
