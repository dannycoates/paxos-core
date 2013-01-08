module.exports = function (assert, Proposal) {

	function ProposeState(proposer, instance, round) {
		this.proposer = proposer.id
		this.instance = instance
		this.round = round || 0
		this.value = null
		this.promises = []
		this.action = 'none'
		this.majority = proposer.majority
		this.surrogate = false // true if value was set by the an acceptor
	}

	ProposeState.prototype.nextRound = function (previous) {
		this.round = previous + 1
		this.promises = []
		return this.round
	}

	ProposeState.prototype.prepare = function (previousRound) {
		this.nextRound(previousRound || this.round)
		this.action = 'prepare'
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			null,
			0,
			null,
			this.proposer
		)
	}

	ProposeState.prototype.proposal = function () {
		this.action = this.value ? 'accept' : 'propose'
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value,
			0,
			null,
			this.proposer
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

		if (proposal.learned) {
			this.action = 'reject'
			return proposal
		}

		if (proposal.supersedes(this.proposer, this.round)) {
			return this.prepare(proposal.round) // retry with a higher round
		}

		if (
			!this.promises.some(sameAcceptor(proposal))
			&& this.promises.push(proposal) === this.majority
		) {
			var highest = this.promises.reduce(highestValueRound)
			if (highest.valueRound) {
				this.value = highest.value
				this.surrogate = true
				// otherwise there were no accepted proposals
			}
			return this.proposal()
		}
		this.action = 'none'
	}

	return ProposeState
}
