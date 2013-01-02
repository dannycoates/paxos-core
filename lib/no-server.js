var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

module.exports = function () {
	function NoServer() {
		EventEmitter.call(this)
	}
	inherits(NoServer, EventEmitter)
	function noop() {}

	NoServer.prototype.prepare = noop
	NoServer.prototype.promised = noop
	NoServer.prototype.accept = noop
	NoServer.prototype.accepted = noop
	NoServer.prototype.rejected = noop

	return NoServer
}
