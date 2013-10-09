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

	var net					= require('net'),
		util				= require('util'),
		RemoteEventsEmitter	= require('remote-events');

	/**
	 * Create a Server instance. If {connectionListener} is provided, then call
	 * the function when a connection is made to the server.
	 *
	 * @param {object}		options
	 * @param {function}	connectionListener
	 *
	 * @return {Server}
	 */
	var createServer = function createServer(options, connectionListener) {
		var server;

		server = new Server(options);
		server.on('connection', function(connectionListener, socket) {
			var options = {}, connection;

			options.port				= socket.remotePort;
			options.host				= socket.remoteAddress;
			options.localAddress		= socket.localAddress;
			options.nodelay				= this._options.nodelay;
			options.keepalive			= this._options.keepalive;

			connection = new Connection(options, socket);
			this._connections.push(connection);

			if (typeof connectionListener === 'function') {
				connectionListener.call(this, connection);
			}
		}.bind(server, connectionListener));

		return server;
	};

	/**
	 * Create a connection to a remote server. If {connectListener} is provided,
	 * then call the function when the connection is established.
	 *
	 * @param  {object}		options
	 * @param  {function}	connectListener
	 *
	 * @return {Connection}
	 */
	var createConnection = function createConnection(options, connectListener) {
		var connection;

		connection = new Connection(options);
		connection.once('connect', function(connectListener) {
			if (typeof connectListener === 'function') {
				connectListener.call(this);
			}
		}.bind(connection, connectListener));

		return connection;
	};

	/**
	 * The base class that extends RemoteEventsEmitter. Pass {socket} to use an
	 * existing net socket.
	 *
	 * @param {object}						options
	 * @param {net#Server|net#Connection}	socket
	 */
	var NetEmitter = function NetEmitter(options, socket) {
		var options_ = options || {}, socket_ = socket;

		if (!NetEmitter.prototype.isPrototypeOf(this)) {
			return new NetEmitter(options, socket);
		}

		RemoteEventsEmitter.call(this);

		/**
		 * Return the remoteAddress for the socket connection, or undefined.
		 *
		 * @return	{string}
		 */
		Object.defineProperty(this, 'remoteAddress', {
			enumerable:		true,
			get: function getRemoteAddress() {
				return this._socket.remoteAddress;
			}
		});

		/**
		 * Return the remotePort for the socket connection, or undefined.
		 *
		 * @return	{number}
		 */
		Object.defineProperty(this, 'remotePort', {
			enumerable:		true,
			get: function getRemotePort() {
				return ~~this._socket.remotePort;
			}
		});

		/**
		 * Return the bound local address, or path to the domain socket, of the
		 * socket, or undefined.
		 *
		 * @return	{string}
		 */
		Object.defineProperty(this, 'localAddress', {
			enumerable:		true,
			get: function getLocalAddress() {
				var localAddress = this._socket.localAddress;

				if (localAddress == null) {
					if (typeof this._socket.address() === 'string') {
						// We are using a UNIX-domain socket
						localAddress = this._socket.address();
					} else if (this._socket.address() != null) {
						// We are using a TCP socket
						localAddress = this._socket.address().address;
					}
				}

				return localAddress;
			}
		});

		/**
		 * Return the localPort for the socket connection, or undefined.
		 *
		 * @return	{number|undefined}
		 */
		Object.defineProperty(this, 'localPort', {
			enumerable:		true,
			get: function getLocalPort() {
				var localPort = this._socket.localPort;

				if (localPort == null) {
					var address = this._socket.address();
					if (address != null && typeof address != 'string') {
						localPort = address.port;
					}
				}

				return localPort ? ~~localPort : undefined;
			}
		});

		/**
		 * The options object for this instance.
		 *
		 * @type {object}
		 */
		Object.defineProperty(this, '_options', {
			enumerable:		false,
			writable:		false,
			configurable:	false,
			value:			options_
		});

		/**
		 * The net#Server or net#Socket object for this instance.
		 *
		 * @type {net#Server|net#Socket}
		 */
		Object.defineProperty(this, '_socket', {
			enumerable:		false,
			writable:		true,
			configurable:	false,
			value:			socket_
		});
	};
	util.inherits(NetEmitter, RemoteEventsEmitter);

	/**
	 * Create a Server object. If {socket} is provided, then use that for the
	 * net socket.
	 *
	 * allowHalfOpen	- do not automatically send a FIN packet when the other end closes the connection
	 * port				- the TCP port to either listen for connections, or for connecting to a remote socket
	 * host				- the optional hostname/ip address to either listen on, or for making a remote connection
	 * path				- the optional UNIX-domain socket path for listening and making intra-computer connections
	 * backlog			- the maximum length of the queue of pending connections
	 *
	 * @param {object}		options
	 * @param {net.Server}	socket
	 *
	 * @return {Server}
	 */
	var Server = function Server(options, socket) {
		var connections_ = [];

		if (!Server.prototype.isPrototypeOf(this)) {
			return new Server(options, socket);
		}

		NetEmitter.call(this, options, socket);

		/**
		 * The object hash of socket connections.
		 *
		 * @type {object}
		 */
		Object.defineProperty(this, '_connections', {
			enumerable:		false,
			writable:		false,
			configurable:	false,
			value:			connections_
		});

		if (!this._socket) {
			var _opts = {
				allowHalfOpen: this._options.allowHalfOpen || false
			};

			this._socket = net.createServer(_opts);
		}

		this._socket.on('close',		this.localEmit.bind(this, 'close'));
		this._socket.on('error',		this.localEmit.bind(this, 'error'));
		this._socket.on('connection',	this.localEmit.bind(this, 'connection'));
		this._socket.on('listening',	this.localEmit.bind(this, 'listening'));
	};
	util.inherits(Server, NetEmitter);

	/**
	 * Return the address object for the server, or null if not listening.
	 *
	 * @return {object|null}
	 */
	Server.prototype.address = function address() {
		return this._socket.address();
	};

	/**
	 * Stops the server from accepting new connections and keeps existing
	 * connections. When all of the connections are closed, then a 'close' event
	 * will be emitted. Optionally, pass {callback} to listen for the close
	 * event.
	 *
	 * @param  {function} callback
	 *
	 * @return {Server}
	 */
	Server.prototype.close = function close(callback) {
		if (typeof callback === 'function') {
			callback = callback.bind(this);
		}

		this._socket.close(callback);
		return this;
	};

	/**
	 * Start listening based on the instance options, or based on the function
	 * signature(s) for net.Server.listen.
	 *
	 * @return {Server}
	 */
	Server.prototype.listen = function listen() {
		var _arguments = [];

		// No arguments passed in, so attempt to use the pre-defined options
		if (arguments.length === 0 || typeof arguments[0] === 'function') {
			if (this._options.port != null) {
				_arguments.push(~~this._options.port);

				if (this._options.host) {
					_arguments.push(this._options.host);
				}

				if (this._options.backlog) {
					_arguments.push(this._options.backlog);
				}
			} else if (this._options.handle != null) {
				_arguments.push(this._options.handle);
			} else if (this._options.path != null) {
				_arguments.push(this._options.path);
			}
		} else if (arguments[0].match(/\d+/) != null) {
			_arguments.push(arguments[0]);				// port
			_arguments.push(arguments[1] || undefined);	// host
			_arguments.push(arguments[2] || undefined);	// backlog
		} else if (typeof arguments[0] === 'object' && (arguments[0].fd || arguments[0]._handle)) {
			_arguments.push(arguments[0]);	// handle or file descriptor
		} else if (typeof arguments[0] === 'string') {
			_arguments.push(arguments[0]);	// UNIX-domain socket path
		} else {
			this.localEmit('error', 'Invalid arguments passed to listen');
			return this;
		}

		var callback = arguments[arguments.length - 1];

		_arguments.push(function(callback) {
			if (typeof callback === 'function') {
				callback.call(this);
			}

			this.localEmit('listening');
		}.bind(this, typeof callback === 'function' ? callback : undefined));

		this._socket.listen.apply(this._socket, _arguments);
		return this;
	};

	/**
	 * Create a Connection object using the options {options}. If {socket} is
	 * provided, then use that as the net socket.
	 *
	 * Supported options:
	 *
	 * allowHalfOpen	- do not automatically send a FIN packet when the other end closes the connection
	 * port				- the TCP port to either listen for connections, or for connecting to a remote socket
	 * host				- the optional hostname/ip address to either listen on, or for making a remote connection
	 * localAddress		- the optional hostname/ip address of the interface to use for making remote connections
	 * encoding			- set the encoding for the connection
	 * path				- the optional UNIX-domain socket path for listening and making intra-computer connections
	 * nodelay			- boolean value for whether to enable/disable TCP no-delay; defaults to true
	 * keepalive		- if present and non-negative, set the keepalive delay in milliseconds
	 *
	 * @param {object}		options
	 * @param {net.Socket}	socket
	 *
	 * @return {Connection}
	 */
	var Connection = function Connection(options, socket) {
		if (!Connection.prototype.isPrototypeOf(this)) {
			return new Connection(options, socket);
		}

		NetEmitter.call(this, options, socket);

		/**
		 * Return the total number of bytes read.
		 *
		 * @return {number}
		 */
		Object.defineProperty(this, 'bytesRead', {
			enumerable: true,
			get: function getBytesRead() {
				return this._socket ? ~~this._socket.bytesRead : 0;
			}
		});

		/**
		 * Return the total number of bytes written.
		 *
		 * @return {number}
		 */
		Object.defineProperty(this, 'bytesWritten', {
			enumerable: true,
			get: function getBytesWritten() {
				return this._socket ? ~~this._socket.bytesWritten : 0;
			}
		});

		if (!this._socket) {
			var _opts = {
				port:			~~this._options.port || undefined,
				host:			this._options.host || undefined,
				localAddress:	this._options.localAddress || undefined,
				path:			this._options.path || undefined,
				allowHalfOpen:	this._options.allowHalfOpen || false
			};

			this._socket = net.createConnection(_opts);
		}

		if (this._options.encoding != null) {
			if (!Buffer.isEncoding(this._options.encoding)) {
				this.destroy();
				throw new Error('"' + this._options.encoding + '" is not a valid encoding');
			}

			this._socket.setEncoding(this._options.encoding);
		}

		if (this._options.keepalive != null && ~~this._options.keepalive >= 0) {
			this._socket.setKeepAlive(true, ~~this._options.keepalive);
		}

		if (this._options.nodelay != null) {
			this._socket.setNoDelay(!!this._options.nodelay);
		}

		this._socket.on('close',	this.localEmit.bind(this, 'close'));
		this._socket.on('error',	this.localEmit.bind(this, 'error'));
		this._socket.on('connect',	this.localEmit.bind(this, 'connect'));
		this._socket.on('end',		this.localEmit.bind(this, 'end'));
		this._socket.on('timeout',	this.localEmit.bind(this, 'timeout'));
		this._socket.on('drain',	this.localEmit.bind(this, 'drain'));

		this._socket.pipe(this.getStream()).pipe(this._socket);
	};
	util.inherits(Connection, NetEmitter);

	/**
	 * Destroy the socket connection. Do not pass Go, do not collect $200. Just
	 * end the connection.
	 *
	 * @return {Connection}
	 */
	Connection.prototype.destroy = function destroy() {
		this._socket.destroy();
		return this;
	};

	/**
	 * End the socket connection and send a FIN packet to the other side.
	 *
	 * @param  {mixed|undefined}	data
	 * @param  {string|undefined}	encoding
	 *
	 * @return {Connection}
	 */
	Connection.prototype.end = function end(data, encoding) {
		this._socket.end(data, encoding);
		return;
	};

	module.exports = {
		createServer:		createServer,
		createConnection:	createConnection,
		Server:				Server,
		Connection:			Connection
	};
})();
