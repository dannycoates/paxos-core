module.exports = function () {

	function LearnState(majority) {
		this.proposals = []
		this.majority = majority
		this.newestBallot = 0
	}

	function sameBallotDifferentAcceptor(proposal) {
		return function (other) {
			return proposal.acceptor !== other.acceptor &&
				proposal.ballot === other.ballot
		}
	}

	LearnState.prototype.accepted = function (proposal) {

		if (proposal.ballot < this.newestBallot) {
			return
		}

		this.newestBallot = proposal.ballot
		this.proposals = this.proposals.filter(sameBallotDifferentAcceptor(proposal))
		this.proposals.push(proposal)

		if (this.proposals.length === this.majority) {
			return proposal
		}
	}

	return LearnState
}
