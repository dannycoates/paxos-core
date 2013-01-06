module.exports = function (inherits, EventEmitter) {

	function NoStorage() {
		this.instances = {}
		EventEmitter.call(this)
	}
	inherits(NoStorage, EventEmitter)

	NoStorage.prototype.set = function (proposal, event) {
		this.instances[proposal.instance] = proposal
		this.emit(event || 'stored', proposal)
	}

	NoStorage.prototype.get = function (proposal, event) {
		var instance = this.instances[proposal.instance] || proposal
		instance.requester = proposal.requester
		this.emit(event || 'lookup', instance)
	}

	return NoStorage
}
