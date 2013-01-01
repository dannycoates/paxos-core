module.exports = function () {

	function Proposal(instance, ballot, value, valueBallot, acceptor) {
		this.instance = instance
		this.ballot = ballot
		this.value = value
		this.valueBallot = valueBallot
		this.acceptor = acceptor
	}

	Proposal.create = function (instance, acceptor) {
		return new Proposal(instance, 0, null, 0, acceptor)
	}

	Proposal.prototype.prepare = function (prepare) {
		this.ballot = Math.max(prepare.ballot, this.ballot)
		return this
	}

	Proposal.prototype.accept = function (proposal) {
		if (this.ballot > proposal.ballot) {
			return
		}
		this.ballot = proposal.ballot
		this.valueBallot = proposal.ballot
		this.value = proposal.value
		return this
	}

	Proposal.prototype.copy = function () {
		return new Proposal(this.instance, this.ballot, this.value, this.valueBallot, this.acceptor)
	}

	return Proposal
}
