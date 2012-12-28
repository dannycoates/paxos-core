module.exports = function (inherits, EventEmitter) {

	function Acceptor() {
		this.instances = {}
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype.prepare = function () {

	}

	Acceptor.prototype.accept = function () {

	}

	return Acceptor
}
