CFLAGS=-g
export CFLAGS

bench:
	node pub.js --transport=$(transport) &
	sleep 1
	node sub.js --transport=$(transport)
	
all:
	node pub.js --transport=http &
	sleep 1
	node sub.js --transport=http &
	sleep 6
	node pub.js --transport=https &
	sleep 1
	node sub.js --transport=https &
	sleep 6	
	node pub.js --transport=tcp &
	sleep 1
	node sub.js --transport=tcp &
	sleep 6
	node pub.js --transport=tls &
	sleep 1
	node sub.js --transport=tls &
	sleep 6
	node pub.js --transport=httpnet &
	sleep 1
	node sub.js --transport=httpnet &
	sleep 6
	echo FIN!

