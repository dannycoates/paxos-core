module.exports = function (inherits, EventEmitter) {

	function Acceptor() {
		this.instances = {}
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype.prepare = function (prepareMessage) {
		var state = this.instances[prepareMessage.instance] || prepareMessage
	}

	Acceptor.prototype.accept = function (proposal) {

	}

	return Acceptor
}
