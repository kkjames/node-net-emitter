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

	require('longjohn');

	var test				= require('tap').test,
		RemoteEventsEmitter	= require('remote-events'),
		server, port,
		Connection;

	test('Load System Under Test', function(t) {
		Connection	= require('../lib/net-emitter').Connection;

		t.ok(Connection, 'Module functor Connection loaded');

		server = new (require('../lib/net-emitter').Server)({port: 0});
		server.once('listening', function() {
			port = this.address().port;
			t.end();
		}).listen();
	});

	test('Ensure the net-emitter Connection API', function(t) {
		t.type(Connection.prototype.destroy,	'function');
		t.end();
	});

	test('Ensure Connection inherits from RemoteEventsEmitter', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			t.type(connection, RemoteEventsEmitter, 'Connection object inherits from RemoteEventsEmitter');
			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the bytesRead property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'bytesRead');
			t.true(props.enumerable,		'bytesRead property is not enumerable');
			t.false(props.writable,			'bytesRead property is not writable');
			t.false(props.configurable,		'bytesRead property is not configurable');
			t.type(props.get, 'function',	'bytesRead property has a getter');
			t.equal(props.set, undefined,	'bytesRead property does not have a setter');
			t.equal(this.bytesRead,	0,		'Connection has zero bytes read');

			connection.once('pong', function() {
				// The overhead comes from the fact that 'pong' is converted
				// into a JSON "[ 'pong' ]" during the network serialization
				// process.
				t.equal(this.bytesRead,	9,	'Connection has 9 bytes read');
			});

			server.emit('pong');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the bytesWritten property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'bytesWritten');
			t.true(props.enumerable,		'bytesWritten property is not enumerable');
			t.false(props.writable,			'bytesWritten property is not writable');
			t.false(props.configurable,		'bytesWritten property is not configurable');
			t.type(props.get, 'function',	'bytesWritten property has a getter');
			t.equal(props.set, undefined,	'bytesWritten property does not have a setter');
			t.equal(this.bytesWritten,	0,	'Connection has zero bytes read');

			connection.emit('ping');

			// The overhead comes from the fact that 'ping' is converted into
			// a JSON "[ 'ping' ]" during the network serialization process.
			t.equal(this.bytesWritten,	9,	'Connection has 9 bytes written');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the _options property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, '_options');
			t.false(props.enumerable,		'_options property is not enumerable');
			t.false(props.writable,			'_options property is not writable');
			t.false(props.configurable,		'_options property is not configurable');
			t.true(props.value,				'_options property has a value');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the _socket property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, '_socket');
			t.false(props.enumerable,		'_socket property is not enumerable');
			t.true(props.writable,			'_socket property is writable');
			t.false(props.configurable,		'_socket property is not configurable');
			t.true(props.value,				'_socket property has a value');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the localAddress property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'localAddress');
			t.true(props.enumerable,		'localAddress property is enumerable');
			t.false(props.writable,			'localAddress property is not writable');
			t.false(props.configurable,		'localAddress property is not configurable');
			t.type(props.get, 'function',	'localAddress property has a getter');
			t.equal(props.set, undefined,	'localAddress property does not have a setter');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the localPort property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'localPort');
			t.true(props.enumerable,		'localPort property is enumerable');
			t.false(props.writable,			'localPort property is not writable');
			t.false(props.configurable,		'localPort property is not configurable');
			t.type(props.get, 'function',	'localPort property has a getter');
			t.equal(props.set, undefined,	'localPort property does not have a setter');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the remoteAddress property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'remoteAddress');
			t.true(props.enumerable,		'remoteAddress property is enumerable');
			t.false(props.writable,			'remoteAddress property is not writable');
			t.false(props.configurable,		'remoteAddress property is not configurable');
			t.type(props.get, 'function',	'remoteAddress property has a getter');
			t.equal(props.set, undefined,	'remoteAddress property does not have a setter');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Ensure the remotePort property', function(t) {
		var connection = new Connection({port: port}), props;

		connection.once('connect', function() {
			props = Object.getOwnPropertyDescriptor(connection, 'remotePort');
			t.true(props.enumerable,		'remotePort property is enumerable');
			t.false(props.writable,			'remotePort property is not writable');
			t.false(props.configurable,		'remotePort property is not configurable');
			t.type(props.get, 'function',	'remotePort property has a getter');
			t.equal(props.set, undefined,	'remotePort property does not have a setter');

			connection.destroy();
		}).once('close', function() {
			t.end();
		});
	});

	test('Clean up', function(t) {
		server.close(function() {
			t.end();
		});
	});
})();
