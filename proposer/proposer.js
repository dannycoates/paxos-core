module.exports = function (assert, inherits, EventEmitter, ProposeState) {

	function Proposer(id, majority, learner) {
		assert(id < 100, "max id is 99")
		EventEmitter.call(this)
		this.id = id
		this.majority = majority
		this.instanceCounter = 1
		this.instances = {}
		this.learner = learner
		this.learner.on('learned', onLearned.bind(this))
	}
	inherits(Proposer, EventEmitter)

	Proposer.prototype.instance = function (instanceId, round) {
		var instance = this.instances[instanceId]
			|| new ProposeState(this, instanceId, round)
		this.instances[instanceId] = instance
		return instance
	}

	Proposer.prototype.prepare = function (instanceId) {
		this.emit(
			'prepare',
			this.instance(instanceId || this.instanceCounter++).prepare()
		)
	}

	Proposer.prototype.promised = function (proposal) {
		var instance = this.instance(proposal.instance, proposal.round)
		var prepareOrProposal = instance.promised(proposal)
		this.emit(instance.action, prepareOrProposal)
	}

	Proposer.prototype.accept = function (proposal) {
		this.emit('accept', proposal)
	}

	Proposer.prototype.rejected = function (proposal) {
		var instance = this.instances[proposal.instance]
		if (instance) {
			this.prepare()
		}
	}

	function onLearned(proposal) {
		delete this.instances[proposal.instance]
		this.emit('learned', proposal)
	}

	return Proposer
}
