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
		fs					= require('fs'),
		RemoteEventsEmitter	= require('remote-events'),
		Server;

	test('Load System Under Test', function(t) {
		Server = require('../lib/net-emitter').Server;

		t.ok(Server, 'Module functor Server loaded');
		t.end();
	});

	test('Ensure the net-emitter Server API', function(t) {
		t.type(Server.prototype.address,	'function');
		t.type(Server.prototype.listen,		'function');
		t.end();
	});

	test('Ensure Connection inherits from RemoteEventsEmitter', function(t) {
		var server = new Server(), props;

		t.type(server, RemoteEventsEmitter, 'Server object inherits from RemoteEventsEmitter');
		t.end();
	});

	test('Ensure the _connections property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, '_connections');
		t.false(props.enumerable,		'_connections property is not enumerable');
		t.false(props.writable,			'_connections property is not writable');
		t.false(props.configurable,		'_connections property is not configurable');
		t.true(props.value,				'_connections property has a value');

		t.end();
	});

	test('Ensure the _options property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, '_options');
		t.false(props.enumerable,		'_options property is not enumerable');
		t.false(props.writable,			'_options property is not writable');
		t.false(props.configurable,		'_options property is not configurable');
		t.true(props.value,				'_options property has a value');

		t.end();
	});

	test('Ensure the _socket property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, '_socket');
		t.false(props.enumerable,		'_socket property is not enumerable');
		t.true(props.writable,			'_socket property is writable');
		t.false(props.configurable,		'_socket property is not configurable');
		t.true(props.value,				'_socket property has a value');

		t.end();
	});

	test('Ensure the localAddress property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, 'localAddress');
		t.true(props.enumerable,		'localAddress property is enumerable');
		t.false(props.writable,			'localAddress property is not writable');
		t.false(props.configurable,		'localAddress property is not configurable');
		t.type(props.get, 'function',	'localAddress property has a getter');
		t.equal(props.set, undefined,	'localAddress property does not have a setter');

		t.end();
	});

	test('Ensure the localPort property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, 'localPort');
		t.true(props.enumerable,		'localPort property is enumerable');
		t.false(props.writable,			'localPort property is not writable');
		t.false(props.configurable,		'localPort property is not configurable');
		t.type(props.get, 'function',	'localPort property has a getter');
		t.equal(props.set, undefined,	'localPort property does not have a setter');

		t.end();
	});

	test('Ensure the remoteAddress property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, 'remoteAddress');
		t.true(props.enumerable,		'remoteAddress property is enumerable');
		t.false(props.writable,			'remoteAddress property is not writable');
		t.false(props.configurable,		'remoteAddress property is not configurable');
		t.type(props.get, 'function',	'remoteAddress property has a getter');
		t.equal(props.set, undefined,	'remoteAddress property does not have a setter');

		t.end();
	});

	test('Ensure the remotePort property', function(t) {
		var server = new Server(), props;

		props = Object.getOwnPropertyDescriptor(server, 'remotePort');
		t.true(props.enumerable,		'remotePort property is enumerable');
		t.false(props.writable,			'remotePort property is not writable');
		t.false(props.configurable,		'remotePort property is not configurable');
		t.type(props.get, 'function',	'remotePort property has a getter');
		t.equal(props.set, undefined,	'remotePort property does not have a setter');

		t.end();
	});

	test('Ensure listening on a random port on all interfaces', function(t) {
		var server = new Server({port: 0});

		server.listen(function() {
			t.ok(this.address().address,	'Server has a bound address');
			t.ok(this.address().port,		'Server has a bound port');

			this.close();
			this.once('close', function() {
				t.end();
			});
		});
	});

	test('Ensure listening on a random port for a specific interface', function(t) {
		var server = new Server({port: 0, host: '127.0.0.1'});

		server.listen(function() {
			t.equal(this.address().address,	'127.0.0.1',		'Server is bound to localhost');
			t.equal(this.localAddress, this.address().address,	'Server returns the correct localAddress property');
			t.equal(this.localPort, this.address().port,		'Server returns the correct localPort property');

			this.close();
			this.once('close', function() {
				t.end();
			});
		});
	});

	test('Ensure listening on a UNIX domain socket', function(t) {
		var server = new Server({path: '/tmp/net-emitter.sock'});

		server.listen(function() {
			t.equal(this.address(),		'/tmp/net-emitter.sock',	'Server address returns socket path');
			t.equal(this.localAddress,	this.address(),				'Server returns the correct localAddress for a socket');
			t.false(this.localPort,		'Server does not return a port when using a socket');

			t.true(fs.existsSync(this.address()),	'Server socket exists');

			this.close();
			this.once('close', function() {
				t.false(fs.existsSync(this.address()),	'Server socket was removed');
				t.end();
			});
		});
	});
})();
