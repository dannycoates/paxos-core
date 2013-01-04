module.exports = function (assert, inherits, EventEmitter, ProposeState) {

	function Proposer(id, majority, learner) {
		EventEmitter.call(this)
		this.id = id
		this.majority = majority
		this.instanceCounter = 1
		this.instances = {}
		this.learner = learner
		this.learner.on('learned', onLearned.bind(this))

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
			this.instance(instance || this.instanceCounter++).prepare()
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
		if (instance && instance.round < proposal.round) {
			this.prepare()
		}
	}

	function onLearned(proposal) {
		delete this.instances[proposal.instance]
		this.emit('learned', proposal)
	}

	return Proposer
}
