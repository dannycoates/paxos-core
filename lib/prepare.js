module.exports = function () {

	function Prepare(instance, ballot) {
		this.instance = instance
		this.ballot = ballot
	}

	Prepare.prototype.copy = function () {
		return new Prepare(this.instance, this.ballot)
	}

	return Prepare
}
