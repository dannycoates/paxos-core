module.exports = function (assert, Prepare, Proposal) {

	function ProposeState(proposer, instance, round) {
		this.proposer = proposer.id
		this.instance = instance
		this.round = round || 0
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

	ProposeState.prototype.nextRound = function (previous) {
		this.round = previous + 1
		this.promises = []
		return this.round
	}

	ProposeState.prototype.prepare = function (previousRound) {
		this.nextRound(previousRound || this.round)
		this.action = 'prepare'
		return new Prepare(this.instance, this.proposer, this.round)
	}

	ProposeState.prototype.proposal = function () {
		this.action = this.value ? 'accept' : 'propose'
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value
		)
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	function highestValueRound(a, b) {
		return (a.valueRound || 0) > (b.valueRound || 0) ? a : b
	}

	ProposeState.prototype.promised = function (proposal) {
		assert.equal(this.instance, proposal.instance)

		if (this.round < proposal.round) {
			return this.prepare(proposal.round) // retry with a higher round
		}

		if (
			!this.promises.some(sameAcceptor(proposal))
			&& this.promises.push(proposal) === this.majority
		) {
			var highest = this.promises.reduce(highestValueRound)
			if (highest.valueRound) {
				this.value = highest.value
				// otherwise there were no accepted proposals
			}
			return this.proposal()
		}
		this.action = 'none'
	}

	return ProposeState
}
