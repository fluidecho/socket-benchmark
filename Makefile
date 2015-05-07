CFLAGS=-g
export CFLAGS

bench:
	node pub.js --transport=$(transport) &
	sleep 1
	node sub.js --transport=$(transport)
