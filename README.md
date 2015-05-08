# NodeJS Socket Benchmarking

NodeJS pub/sub socket benchmarking transports: TCP, TLS, HTTP, HTTPS.  

__*WORK IN PROCESS*__

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

When using socket transports like TCP and TLS, which are 'streaming', a message needs framing. 

Message framing can be achieved using something simple like a newline '\n', however something more robust is useful.

AMP as used by axon provides a useful solution to framing, allows any codec within such as json, results as a buffer which is native to the nodejs sockets.

## Benchmarking Results

__*WORK IN PROCESS*__

## License

Choose either: [MIT](http://opensource.org/licenses/MIT) or [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
