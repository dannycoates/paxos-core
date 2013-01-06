module.exports = function (Proposal) {

	function AcceptState(instance, acceptor) {
		this.instance = instance
		this.proposer = 0
		this.round = 0
		this.value = null
		this.valueRound = 0
		this.acceptor = acceptor
	}

	AcceptState.prototype.prepare = function (proposal) {
		if (this.proposer === proposal.proposer) {
			this.round = Math.max(proposal.round, this.round)
		}
		else if (proposal.round > this.round) {
			this.proposer = proposal.proposer
			this.round = proposal.round
		}
		return this.proposal(proposal.requester)
	}

	AcceptState.prototype.accept = function (proposal) {
		if (proposal.precedes(this.proposer, this.round)) {
			return
		}
		this.proposer = proposal.proposer
		this.round = proposal.round
		this.valueRound = proposal.round
		this.value = proposal.value
		return this.proposal(proposal.requester)
	}

	AcceptState.prototype.proposal = function (requester) {
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value,
			this.valueRound,
			this.acceptor,
			requester
		)
	}

	return AcceptState
}
