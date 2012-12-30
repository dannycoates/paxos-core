module.exports = function (assert, inherits, EventEmitter, Prepare, Proposal) {

	function Paxos(proposer, instance, ballot) {
		EventEmitter.call(this)
		this.proposerId = proposer.id
		this.instance = instance
		this.ballot = ballot || 0
		this.value = null
		this.valueBallot = 0

		this.timer = null

		this.promises = []
		this.majority = proposer.majority
	}
	inherits(Paxos, EventEmitter)

	Paxos.create = function (proposer, instance, ballot) {
		var state = new Paxos(proposer, instance, ballot)
		state.on('prepare', proposer.onPrepare)
		state.on('accept', proposer.onAccept)
		state.on('propose', proposer.onPropose)
		return state
	}

	Paxos.prototype.nextBallot = function (previous) {
		var id = previous % 100
		var counter = (previous - id) + 100 //here's the increment
		this.ballot = counter + this.proposerId
		this.promises = []
		return this.ballot
	}

	Paxos.prototype.prepare = function (previousBallot) {
		clearTimeout(this.timer)
		this.nextBallot(previousBallot || this.ballot)
		this.emit('prepare', new Prepare(this.instance, this.ballot))
	}

	Paxos.prototype.proposal = function () {
		clearTimeout(this.timer)
		var proposal = new Proposal(this.instance, this.ballot, this.value, this.valueBallot)
		var event = this.value ? 'accept' : 'propose'
		this.emit(event, proposal)
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	function highestValueBallot(a, b) {
		return (a.valueBallot || 0) > (b.valueBallot || 0) ? a : b
	}

	Paxos.prototype.promised = function (proposal) {
		assert.equal(this.instance, proposal.instance)

		if (this.ballot < proposal.ballot) {
			// prepare failed, retry with a higher ballot
			return this.prepare(proposal.ballot)
		}

		if (!this.promises.some(sameAcceptor(proposal))) {
			this.promises.push(proposal)
		}
		if (this.promises.length === this.majority) {
			var highest = this.promises.reduce(highestValueBallot)
			if (highest.valueBallot) {
				this.value = highest.value
				// otherwise there were no accepted proposals
			}
			this.valueBallot = this.ballot
			return this.proposal()
		}
	}

	Paxos.prototype.complete = function (proposer) {
		clearTimeout(this.timer)
		this.removeListener('prepare', proposer.onPrepare)
		this.removeListener('accept', proposer.onAccept)
		this.removeListener('propose', proposer.onPropose)
	}

	return Paxos
}
