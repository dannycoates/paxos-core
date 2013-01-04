module.exports = function () {

	function Proposal(instance, proposer, round, value, valueRound, acceptor) {
		this.instance = instance
		this.proposer = proposer
		this.round = round
		this.value = value
		this.valueRound = valueRound //TODO lets try to get rid of this
		this.acceptor = acceptor
	}

	Proposal.prototype.copy = function () {
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value,
			this.valueRound,
			this.acceptor
		)
	}

	return Proposal
}
