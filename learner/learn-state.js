module.exports = function () {

	function LearnState(majority) {
		this.proposer = 0
		this.proposals = []
		this.majority = majority
		this.round = 0
	}

	function sameRoundDifferentAcceptor(proposal) {
		return function (other) {
			return proposal.acceptor !== other.acceptor
				&& proposal.proposer === other.proposer
				&& proposal.round === other.round
		}
	}

	LearnState.prototype.accepted = function (proposal) {
		if (proposal.precedes(this.proposer, this.round)) {
			return
		}
		this.proposer = proposal.proposer
		this.round = proposal.round
		this.proposals = this.proposals.filter(sameRoundDifferentAcceptor(proposal))
		this.proposals.push(proposal)

		if (this.proposals.length === this.majority) {
			return proposal
		}
	}

	return LearnState
}
