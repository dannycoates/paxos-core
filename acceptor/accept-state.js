module.exports = function (Proposal) {

	function AcceptState(instance, acceptor) {
		this.instance = instance
		this.round = 0
		this.value = null
		this.valueRound = 0
		this.acceptor = acceptor
	}

	AcceptState.prototype.prepare = function (prepare) {
		this.round = Math.max(prepare.round, this.round)
		return this.proposal()
	}

	AcceptState.prototype.accept = function (proposal) {
		if (this.round > proposal.round) {
			return
		}
		this.round = proposal.round
		this.valueRound = proposal.round
		this.value = proposal.value
		return this.proposal()
	}

	AcceptState.prototype.proposal = function () {
		return new Proposal(
			this.instance,
			this.round,
			this.value,
			this.valueRound,
			this.acceptor
		)
	}

	return AcceptState
}
