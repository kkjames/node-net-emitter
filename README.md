node-net-emitter
================

An implementation of the node.js net module that uses [`remote-events`][1] for socket communication.

# Inspiration

This module makes working with sockets easier by utilizing the [`remote-events`][1]
API for communicating between services using event listeners.

# Installation

    $ npm install net-emitter

# Testing

[`net-emitter`][2] will make every effort to ensure passing all tests, and that all
tests will be useful in both ensuring good, quality code coverage, as well as
being useful as documentation. From the shell, simply run the following to run
all of the tests:

    $ npm test

The testing suite is based on the Test-Anything-Protocol (TAP), and utilizes
the [`tap`][3] module.

# Getting Started Example

Every software project provides a `Hello, World` example, and this project is
not about to break that tradition. So without further interruption:

``` js
var NetEmitter = require('./lib/net-emitter');

NetEmitter
    .createServer({port: 0, host: '127.0.0.1'}, function(connection) {
        var server = this;

        console.log('>> Connection from %s:%s', connection.remoteAddress, connection.remotePort);

        connection.on('ping', function() {
            console.log('<< PING: %s:%s', connection.remoteAddress, connection.remotePort);
            setTimeout(this.emit.bind(this, 'pong'), 1000);
        }).on('close', function() {
            console.log('>> Good-bye, World!');
            server.close();
        });
    }).listen(function() {
        console.log('>> Listening on %s:%s', this.localAddress, this.localPort);

        NetEmitter.createConnection({port: this.localPort, localAddress: this.localAddress}, function() {
            console.log('<< Connected to %s:%s', this.remoteAddress, this.remotePort);

            this.on('pong', function() {
                console.log('>> PONG: %s:%s', this.remoteAddress, this.remotePort);
                setTimeout(this.emit.bind(this, 'ping'), 1000);
            });

            setTimeout(this.destroy.bind(this), 5000);
        }).emit('ping');
    });
```

  [1]: https://github.com/dominictarr/remote-events
  [2]: https://npmjs.org/package/net-emitter
  [3]: https://npmjs.org/package/tap
