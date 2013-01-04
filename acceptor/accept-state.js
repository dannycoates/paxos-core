module.exports = function (Proposal) {

	function AcceptState(instance, acceptor) {
		this.instance = instance
		this.proposer = 0
		this.round = 0
		this.value = null
		this.valueRound = 0
		this.acceptor = acceptor
	}

	AcceptState.prototype.prepare = function (prepare) {
		if (this.proposer === prepare.proposer) {
			this.round = Math.max(prepare.round, this.round)
		}
		else if (prepare.round > this.round) {
			this.proposer = prepare.proposer
			this.round = prepare.round
		}
		return this.proposal()
	}

	AcceptState.prototype.accept = function (proposal) {
		if (proposal.precedes(this.proposer, this.round)) {
			return
		}
		this.proposer = proposal.proposer
		this.round = proposal.round
		this.valueRound = proposal.round
		this.value = proposal.value
		return this.proposal()
	}

	AcceptState.prototype.proposal = function () {
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value,
			this.valueRound,
			this.acceptor
		)
	}

	return AcceptState
}
