module.exports = function (assert, inherits, EventEmitter) {

	function Acceptor(id, learner, storage) {
		EventEmitter.call(this)
		this.id = id
		this.learner = learner || nilLearner
		this.learner.on('data', onlearnerData.bind(this))
		this.storage = storage || nilStorage
		this.highmark = this.learner.highmark()
		this.instances = {}
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype.prepare = function (prepare) {
		assert.equal(prepare.valueBallot, undefined)

		if (prepare.instance <= this.highmark) {
			return this.lookup(prepare.instance, 'promised')
		}

		var state = this.instances[prepare.instance] || prepare

		if (state.ballot <= prepare.ballot && !state.valueBallot) {
			// Promise to reject lower ballots, but
			// if a proposal has already been accepted don't touch it
			state = prepare
		}
		state.acceptor = this.id
		this.instances[prepare.instance] = state
		this.storage.set(state, this.emit.bind(this, 'promised'))
	}

	Acceptor.prototype.accept = function (proposal) {
		var state = this.instances[proposal.instance] || proposal

		if (proposal.instance <= this.highmark) {
			return this.lookup(proposal.instance, 'accepted')
		}
		if (state.ballot > proposal.ballot) {
			// refuse the proposal by replying with the higher ballot proposal
			return this.emit('refused', state)
			// TODO: should/could the learner know about this?
		}
		proposal.acceptor = this.id
		this.instances[proposal.instance] = proposal
		this.storage.set(proposal, this.emit.bind(this, 'accepted'))
	}

	Acceptor.prototype.lookup = function (instance, event) {
		this.storage.get(instance, this.emit.bind(this, event || 'lookup'))
	}

	function onlearnerData(proposal) {
		this.highmark = proposal.instance
		delete this.instances[proposal.instance]
	}

	var nilLearner = { highmark: function () { return 0 }, on: function () {}}
	var nilStorage = { get: function (i) { }, set: function (p, cb) { cb(p) }}

	return Acceptor
}
