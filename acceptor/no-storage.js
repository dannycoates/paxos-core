module.exports = function (inherits, EventEmitter) {

	function NoStorage() {
		EventEmitter.call(this)
	}
	inherits(NoStorage, EventEmitter)

	NoStorage.prototype.set = function (proposal, event) {
		this.emit(event || 'stored', proposal)
	}

	NoStorage.prototype.get = function (instanceId, event) {
		// noop
	}

	return NoStorage
}
