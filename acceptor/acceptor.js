module.exports = function (assert, inherits, EventEmitter, Proposal) {

	function Acceptor(id, learner, storage) {
		EventEmitter.call(this)
		this.id = id
		this.learner = learner
		this.learner.on('data', onlearnerData.bind(this))
		this.storage = storage || nilStorage
		this.highmark = this.learner.highmark()
		this.instances = {}
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype.instance = function (id) {
		var instance = this.instances[id] || Proposal.create(id, this.id)
		this.instances[id] = instance
		return instance
	}

	Acceptor.prototype.prepare = function (prepare) {
		if (prepare.instance <= this.highmark) {
			return this.lookup(prepare.instance, 'promised')
		}

		var proposal = this.instance(prepare.instance).prepare(prepare)
		this.storage.set(proposal, this.emit.bind(this, 'promised'))
	}

	Acceptor.prototype.accept = function (proposal) {
		if (proposal.instance <= this.highmark) {
			return this.lookup(proposal.instance, 'rejected')
		}

		var instance = this.instance(proposal.instance)
		var accepted = instance.accept(proposal)
		if (accepted) {
			return this.storage.set(accepted, this.emit.bind(this, 'accepted'))
		}
		this.emit('rejected', instance)
	}

	Acceptor.prototype.lookup = function (instanceId, event) {
		this.storage.get(instanceId, this.emit.bind(this, event || 'lookup'))
	}

	function onlearnerData(proposal) {
		this.highmark = proposal.instance
		this.storage.set(proposal, this.emit.bind(this, 'stored'))
		delete this.instances[proposal.instance]
	}

	var nilStorage = { get: function (i) { }, set: function (p, cb) { cb(p) }}

	return Acceptor
}
