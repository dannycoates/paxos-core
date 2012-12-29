module.exports = function () {

	function Proposal(instance, ballot, value, valueBallot, acceptor) {
		this.instance = instance
		this.ballot = ballot
		this.value = value
		this.valueBallot = valueBallot
		this.acceptor = acceptor
	}

	Proposal.prototype.incrementBallot = function (proposerId) {
		var id = this.ballot % 100
		proposerId = proposerId === undefined ? id : proposerId
		var counter = (this.ballot - id) + 100 //here's the increment
		this.ballot = counter + proposerId
	}

	Proposal.create = function (proposerId, instance, value) {
		var proposal = new Proposal(instance, 0, value)
		proposal.incrementBallot(proposerId)
		return proposal
	}

	return Proposal
}
