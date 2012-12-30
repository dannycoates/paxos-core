module.exports = function (assert, Prepare, Proposal) {

	function Paxos(proposer, instance) {
		this.proposer = proposer
		this.instance = instance
		this.ballot = this.nextBallot(0)
		this.value = null
		this.valueBallot = 0

		this.preparedAt = 0
		this.proposedAt = 0
		this.promises = []
	}

	Paxos.prototype.nextBallot = function (previous) {
		var id = previous % 100
		var counter = (previous - id) + 100 //here's the increment
		this.ballot = counter + this.proposer.id
		return this.ballot
	}

	Paxos.prototype.prepare = function () {
		this.preparedAt = Date.now()
		this.proposer.prepared(new Prepare(this.instance, this.ballot))
	}

	Paxos.prototype.proposal = function () {
		this.proposedAt = Date.now()
		this.proposer.accept(new Proposal(this.instance, this.ballot, this.value, this.valueBallot))
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	function highestValueBallot(a, b) {
		return (a.valueBallot || 0) > (b.valueBallot || 0) ? a : b
	}

	Paxos.prototype.promise = function (proposal) {
		assert.equal(this.instance, proposal.instance)

		if (this.ballot < proposal.ballot) {
			// prepare failed, reset
			this.nextBallot(proposal.ballot)
			this.promises = []
			return this.prepare()
		}

		if (!this.promises.some(sameAcceptor(proposal))) {
			this.promises.push(proposal)
		}
		if (this.promises.length === this.proposer.majority) {
			var highest = this.promises.reduce(highestValueBallot)
			if (highest.valueBallot) {
				this.value = highest.value
				// otherwise there were no accepted proposals
			}
			this.valueBallot = this.ballot
			return this.proposal()
		}
	}

	return Paxos
}
