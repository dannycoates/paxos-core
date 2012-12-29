var assert = require('assert')

module.exports = function (inherits, EventEmitter) {

	function Proposer(id) {
		assert(id < 100, "max id is 99")
		EventEmitter.call(this)
		this.id = id
		this.ballotCounter = 0
	}
	inherits(Proposer, EventEmitter)

	Proposer.prototype.nextBallot = function () {
		this.ballotCounter++
		return (this.ballotCounter * 100) + this.id
	}

	Proposer.prototype.prepare = function (instance) {

	}

	Proposer.prototype.prepared = function (proposal) {

	}

	Proposer.prototype.accept = function (proposal) {

	}

	Proposer.prototype.accepted = function (proposal) {

	}

	return Proposer
}
