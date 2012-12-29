module.exports = function () {

	function Proposal(acceptor, instance, ballot, value, valueBallot) {
		this.acceptor = acceptor
		this.instance = instance
		this.ballot = ballot
		this.value = value
		this.valueBallot = valueBallot
	}

	return Proposal
}
