module.exports = function (assert, inherits, EventEmitter, Paxos) {

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

	Proposer.prototype.prepare = function (instanceId) {
		instanceId = instanceId || this.instanceCounter++
		var instance = this.instances[instanceId] || Paxos.create(this, instanceId)
		this.instances[instanceId] = instance
		instance.prepare()
	}

	Proposer.prototype.promised = function (proposal) {
		var instance = this.instances[proposal.instance] ||
			Paxos.create(this, proposal.instance, proposal.ballot)
		this.instances[proposal.instance] = instance
		instance.promised(proposal)
	}

	Proposer.prototype.accept = function (proposal) {
		this.onAccept(proposal)
	}

	Proposer.prototype.refused = function (proposal) {
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
