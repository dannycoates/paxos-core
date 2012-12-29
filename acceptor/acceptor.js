module.exports = function (inherits, EventEmitter) {

	function Acceptor(id, learner, storage) {
		EventEmitter.call(this)
		this.id = id
		this.learner = learner || nilLearner
		this.learner.on('data', learn.bind(this))
		this.storage = storage || nilStorage
		this.highmark = this.learner.highmark()
		this.instances = {}
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype.prepare = function (prepare) {
		var state = this.instances[prepare.instance] || prepare

		if (prepare.instance <= this.highmark) {
			return this.lookup(prepare.instance, 'prepared')
		}
		if (state.ballot <= prepare.ballot) {
			if (state.valueBallot) {
				// we've already accepted a proposal for this instance
				state.ballot = prepare.ballot
			}
			else {
				state = prepare
			}
		}
		this.instances[prepare.instance] = state
		this.storage.set(state, this.emit.bind(this, 'prepared'))
	}

	Acceptor.prototype.accept = function (proposal) {
		var state = this.instances[proposal.instance] || proposal

		if (proposal.instance <= this.highmark) {
			return this.lookup(prepare.instance, 'accepted')
		}
		if (state.ballot > proposal.ballot) {
			return this.emit('accepted', state)
		}
		proposal.acceptor = this.id
		this.instances[proposal.instance] = proposal
		this.storage.set(proposal, this.emit.bind(this, 'accepted'))
	}

	Acceptor.prototype.lookup = function (instance, event) {
		this.storage.get(instance, this.emit.bind(this, event || 'lookup'))
	}

	function learn(proposal) {
		this.highmark = proposal.instance
		delete this.instances[proposal.instance]
	}

	var nilLearner = { highmark: function () { return 0 }, on: function () {}}
	var nilStorage = { get: function (i) { }, set: function (p, cb) { cb(p) }}

	return Acceptor
}
