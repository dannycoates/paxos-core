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
		this.onPrepare = onPrepare.bind(this)
		this.onAccept = onAccept.bind(this)
		this.onPropose = onPropose.bind(this)
	}
	inherits(Proposer, EventEmitter)

	Proposer.prototype.instance = function (instanceId, ballot) {
		var instance = this.instances[instanceId]
			|| ProposeState.create(this, instanceId, ballot)
		this.instances[instanceId] = instance
		return instance
	}

	Proposer.prototype.prepare = function (instanceId) {
		this.instance(instanceId || this.instanceCounter++).prepare()
	}

	Proposer.prototype.promised = function (proposal) {
		this.instance(proposal.instance, proposal.ballot).promised(proposal)
	}

	Proposer.prototype.accept = function (proposal) {
		this.onAccept(proposal)
	}

	Proposer.prototype.rejected = function (proposal) {
		var instance = this.instances[proposal.instance]
		if (instance) {
			instance.prepare()
		}
	}

	function onLearned(proposal) {
		var instance = this.instances[proposal.instance]
		if (instance) {
			instance.complete(this)
		}
		delete this.instances[proposal.instance]
		this.emit('learned', proposal)
	}

	function onPrepare(prepare) {
		this.emit('prepare', prepare)
	}

	function onAccept(proposal) {
		this.emit('accept', proposal)
	}

	function onPropose(proposal) {
		this.emit('propose', proposal)
	}

	return Proposer
}
