module.exports = function (assert, inherits, EventEmitter, Paxos) {

	function Proposer(id, majority, learner) {
		assert(id < 100, "max id is 99")
		EventEmitter.call(this)
		this.id = id
		this.majority = majority
		this.instanceCounter = 1
		this.instances = {}
		this.learner = learner
		this.learner.on('fact', learn.bind(this))
	}
	inherits(Proposer, EventEmitter)

	Proposer.prototype.prepare = function (instanceId) {
		instanceId = instanceId || this.instanceCounter++
		var instance = this.instances[instanceId] || new Paxos(this, instanceId)
		this.instances[instanceId] = instance
		instance.prepare()
	}

	Proposer.prototype.prepared = function (prepare) {
		this.emit('prepare', prepare)
	}

	Proposer.prototype.promise = function (proposal) {
		var instance = this.instances[proposal.instance] || new Paxos(this, proposal.instance)
		this.instances[proposal.instance] = instance
		instance.promise(proposal)
	}

	Proposer.prototype.accept = function (proposal) {
		this.emit('accept', proposal)
	}

	function learn(proposal) {
		this.emit('fact', proposal)
		delete this.instances[proposal.instance]
	}

	return Proposer
}
