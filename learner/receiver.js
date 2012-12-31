module.exports = function (inherits, EventEmitter, LearnState) {

	function Receiver(majority, highmark) {
		EventEmitter.call(this)
		this.majority = majority
		this.instances = {}
		this._highmark = highmark || 0
	}
	inherits(Receiver, EventEmitter)

	Receiver.prototype.accepted = function (proposal) {
		if (this._highmark >= proposal.instance) {
			return
		}
		var state = this.instances[proposal.instance] || new LearnState(this.majority)

		var learned = state.accepted(proposal)
		if (learned) {
			delete this.instances[proposal.instance]
			this.emit('learned', learned)
		}
		else {
			this.instances[proposal.instance] = state
		}
	}

	Receiver.prototype.highmark = function (instance) {
		this._highmark = instance || this._highmark
		return this._highmark
	}

	return Receiver
}
