# NodeJS Socket Benchmarking

NodeJS pub/sub socket benchmarking transports: TCP, TLS, HTTP, HTTPS.  

## Run

```
make bench all
```
### Options

- transport=tcp (transport to test)
- batching (will use nagle-ish batching)

## Motivation

I use nodejs to do distributed messaging, like zeromq/axon.  

I want to be able to benchmark test which native nodejs socket transports are fastest and how to make them faster.

## Parts

I've created two programs, a _pub_ and a _sub_, which will count the number of messages that can be sent per second.  

### Message Framing

When using socket transports like TCP and TLS, which are 'streaming', a message needs framing. 

Message framing can be achieved using something simple like a newline '\n', however something more robust is useful.

AMP as used by axon provides a useful solution to framing, allows any codec within such as json, results as a buffer which is native to the nodejs sockets.

### MTU

MTU (maximum transmission unit) make a big difference in performance. Just to explain MTU defines the amount of bytes that should be sent across the network (over the wire) at one time.

Generally speaking the bigger the better, when message batching is being used. By default most network MTUs are set to 1500. I should also mention for best results both peers should be set to the same MTU.

AWS EC2 instances are either set to 1500 for smaller instances and 9001 (jumbo frames) for larger instances.

Google Compute uses 1500 (1460 body).

To change a MTU setting of say the eth0 network to 9000 bytes (temp):

```
sudo ifconfig eth0 mtu 9000
```
To view network MTU settings:

```
netstat -i
```
or
```
ifconfig
```

### Batching

Batching up messages to fit the MTU also makes a big difference to performance, by factors or 2x to 3x!

Have you heard the name John Nagle? You should if you care about performance. The Nagle algorithm basically batches up data to best fit the MTU before sending over the TCP wire. There are now faster algorithms, as developed by zeromq and others.

To get the most out of a network's MTU, we need to apply our own batching algorithm to message delivery.

Note that if the message size is >= the MTU then batching is useless.


## Benchmarking Results

For a 100 byte message.  

```
---------------------------------------------
| RESULTS FOR SOCKET http ~
---------------------------------------------
|   median: 96,153 ops/s
|     mean: 93,661 ops/s
|    total: 472,991 ops in 5.05s
|  through: 9.37 MB/s
---------------------------------------------
| RESULTS FOR SOCKET https ~
---------------------------------------------
|   median: 13,851 ops/s
|     mean: 9,073 ops/s
|    total: 45,160 ops in 4.977s
|  through: 0.91 MB/s
---------------------------------------------
| RESULTS FOR SOCKET tcp ~
---------------------------------------------
|   median: 277,777 ops/s
|     mean: 205,494 ops/s
|    total: 1,030,146 ops in 5.013s
|  through: 20.55 MB/s
---------------------------------------------
| RESULTS FOR SOCKET tls ~
---------------------------------------------
|   median: 178,571 ops/s
|     mean: 172,668 ops/s
|    total: 861,614 ops in 4.99s
|  through: 17.27 MB/s
---------------------------------------------
| RESULTS FOR SOCKET httpnet ~
---------------------------------------------
|   median: 357,143 ops/s
|     mean: 309,020 ops/s
|    total: 1,556,227 ops in 5.036s
|  through: 30.9 MB/s
---------------------------------------------
```

## License

Choose either: [MIT](http://opensource.org/licenses/MIT) or [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
