module.exports = function (assert, inherits, EventEmitter, ProposeState) {

	function Proposer(id, majority) {
		EventEmitter.call(this)
		this.id = id
		this.majority = majority
		this.instanceCounter = 0
		this.instances = {}

		this.onPromised = this.promised.bind(this)
		this.onRejected = this.rejected.bind(this)
	}
	inherits(Proposer, EventEmitter)

	Proposer.prototype.instance = function (id, round) {
		var instance = this.instances[id]
			|| new ProposeState(this, id, round)
		this.instances[id] = instance
		return instance
	}

	Proposer.prototype.prepare = function (instance) {
		this.emit(
			'prepare',
			this.instance(instance || ++this.instanceCounter).prepare()
		)
	}

	Proposer.prototype.promised = function (proposal) {
		var instance = this.instances[proposal.instance]
		if (!instance) { return }
		var prepareOrProposal = instance.promised(proposal)
		this.emit(instance.action, prepareOrProposal)
	}

	Proposer.prototype.accept = function (proposal) {
		this.emit('accept', proposal)
	}

	Proposer.prototype.rejected = function (proposal) {
		if(this.learn(proposal)) {
			this.prepare()
		}
	}

	Proposer.prototype.learn = function (proposal) {
		this.instanceCounter = Math.max(this.instanceCounter, proposal.instance)
		var instance = this.instances[proposal.instance]
		if (instance) {
			delete this.instances[proposal.instance]
		}
		return !!instance
	}

	return Proposer
}
