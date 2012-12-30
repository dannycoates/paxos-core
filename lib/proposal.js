module.exports = function () {

	function Proposal(instance, ballot, value, valueBallot, acceptor) {
		this.instance = instance
		this.ballot = ballot
		this.value = value
		this.valueBallot = valueBallot
		this.acceptor = acceptor
	}

	Proposal.prototype.copy = function () {
		return new Proposal(this.instance, this.ballot, this.value, this.valueBallot, this.acceptor)
	}

	return Proposal
}
