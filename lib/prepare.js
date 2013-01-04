module.exports = function () {

	function Prepare(instance, proposer, round) {
		this.instance = instance
		this.proposer = proposer
		this.round = round
	}

	Prepare.prototype.copy = function () {
		return new Prepare(this.instance, this.proposer, this.round)
	}

	return Prepare
}
