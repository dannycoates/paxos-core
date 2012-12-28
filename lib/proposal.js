module.exports = function () {

	function Proposal(acceptor, instance, ballot, value) {
		this.acceptor = acceptor
		this.instance = instance
		this.ballot = ballot
		this.value = value
	}

	return Proposal
}
