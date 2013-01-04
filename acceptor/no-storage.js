module.exports = function (inherits, EventEmitter) {

	function NoStorage() {
		EventEmitter.call(this)
	}
	inherits(NoStorage, EventEmitter)

	NoStorage.prototype.set = function (proposal, event) {
		this.emit(event || 'stored', proposal)
	}

	NoStorage.prototype.get = function (instance, event) {
		// noop
	}

	return NoStorage
}
