module.exports = function () {

	function Prepare(instance, round) {
		this.instance = instance
		this.round = round
	}

	Prepare.prototype.copy = function () {
		return new Prepare(this.instance, this.round)
	}

	return Prepare
}
