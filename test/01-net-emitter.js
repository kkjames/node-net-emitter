(function() {
	/**
	 * Copyright (C) 2013 D42 Studios, LLC
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to permit
	 * persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included
	 * in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	 * USE OR OTHER DEALINGS IN THE SOFTWARE.
	 */
	"use strict";

	var test				= require('tap').test,
		RemoteEventsEmitter	= require('remote-events'),
		NetEmitter;

	test('Load System Under Test', function(t) {
		NetEmitter = require('../lib/net-emitter');

		t.ok(NetEmitter, 'Module NetEmitter loaded');
		t.end();
	});

	test('Test the API that the module provides', function(t) {
		t.type(NetEmitter.createServer,		'function',	'NetEmitter provides a createServer function');
		t.type(NetEmitter.createConnection,	'function',	'NetEmitter provides a createConnection function');
		t.type(NetEmitter.Server,			'function',	'NetEmitter provides a Server functor');
		t.type(NetEmitter.Connection,		'function',	'NetEmitter provides a Connection functor');

		t.ok(RemoteEventsEmitter.prototype.isPrototypeOf(NetEmitter.Server.prototype),		'NetEmitter.Server inherits from RemoteEventsEmitter');
		t.ok(RemoteEventsEmitter.prototype.isPrototypeOf(NetEmitter.Connection.prototype),	'NetEmitter.Connection inherits from RemoteEventsEmitter');

		t.end();
	});
})();
