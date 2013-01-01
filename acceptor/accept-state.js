module.exports = function (Proposal) {

	function AcceptState(instance, acceptor) {
		this.instance = instance
		this.ballot = 0
		this.value = null
		this.valueBallot = 0
		this.acceptor = acceptor
	}

	AcceptState.prototype.prepare = function (prepare) {
		this.ballot = Math.max(prepare.ballot, this.ballot)
		return this.proposal()
	}

	AcceptState.prototype.accept = function (proposal) {
		if (this.ballot > proposal.ballot) {
			return
		}
		this.ballot = proposal.ballot
		this.valueBallot = proposal.ballot
		this.value = proposal.value
		return this.proposal()
	}

	AcceptState.prototype.proposal = function () {
		return new Proposal(
			this.instance,
			this.ballot,
			this.value,
			this.valueBallot,
			this.acceptor
		)
	}

	return AcceptState
}
