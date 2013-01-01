module.exports = function () {

	function LearnState(majority) {
		this.proposals = []
		this.majority = majority
		this.newestRound = 0
	}

	function sameRoundDifferentAcceptor(proposal) {
		return function (other) {
			return proposal.acceptor !== other.acceptor
				&& proposal.round === other.round
		}
	}

	LearnState.prototype.accepted = function (proposal) {
		if (proposal.round < this.newestRound) { return }

		this.newestRound = proposal.round
		this.proposals = this.proposals.filter(sameRoundDifferentAcceptor(proposal))
		this.proposals.push(proposal)

		if (this.proposals.length === this.majority) {
			return proposal
		}
	}

	return LearnState
}
