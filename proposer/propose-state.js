module.exports = function (assert, Prepare, Proposal) {

	function ProposeState(proposer, instance, ballot) {
		this.proposerId = proposer.id
		this.instance = instance
		this.ballot = ballot || 0
		this.value = null

		// TODO: decide where timeouts go. At this point there's arguments for
		// here, where they become part of the state, or in the communication
		// layer which keeps the state "time free". I think I'd prefer to keep
		// knowledge of time out of the state, but it seems easier to implement
		// here. So lets try to do it "there" and only come back if its too ugly.

		this.promises = []
		this.action = 'none'
		this.majority = proposer.majority
	}

	ProposeState.prototype.nextBallot = function (previous) {
		var id = previous % 100
		var counter = (previous - id) + 100 //here's the increment
		this.ballot = counter + this.proposerId
		this.promises = []
		return this.ballot
	}

	ProposeState.prototype.prepare = function (previousBallot) {
		this.nextBallot(previousBallot || this.ballot)
		this.action = 'prepare'
		return new Prepare(this.instance, this.ballot)
	}

	ProposeState.prototype.proposal = function () {
		this.action = this.value ? 'accept' : 'propose'
		return new Proposal(
			this.instance,
			this.ballot,
			this.value
		)
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	function highestValueBallot(a, b) {
		return (a.valueBallot || 0) > (b.valueBallot || 0) ? a : b
	}

	ProposeState.prototype.promised = function (proposal) {
		assert.equal(this.instance, proposal.instance)

		if (this.ballot < proposal.ballot) {
			return this.prepare(proposal.ballot) // retry with a higher ballot
		}

		if (
			!this.promises.some(sameAcceptor(proposal))
			&& this.promises.push(proposal) === this.majority
		) {
			var highest = this.promises.reduce(highestValueBallot)
			if (highest.valueBallot) {
				this.value = highest.value
				// otherwise there were no accepted proposals
			}
			return this.proposal()
		}
		this.action = 'none'
	}

	return ProposeState
}
