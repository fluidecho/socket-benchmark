"use strict";
//
// sockets: constructor.
//
// Version: 0.0.1
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2015 Mark W. B. Ashcroft.
// Copyright (c) 2015 FluidEcho.
//


exports.bind = function (options) {
	return require('./lib/'+options.transport+'/bind').bind(options);
};

exports.connect = function (options) {
	return require('./lib/'+options.transport+'/connect').connect(options);
};
