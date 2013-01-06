module.exports = function () {

	function Proposal(
			instance,
			proposer,
			round,
			value,
			valueRound,
			acceptor,
			requester,
			learned
		) {
		this.instance = instance
		this.proposer = proposer
		this.round = round
		this.value = value
		this.valueRound = valueRound //TODO lets try to get rid of this
		this.acceptor = acceptor
		this.requester = requester
		this.learned = learned || false
	}

	Proposal.parse = function (value) {
		var object = typeof value === 'string' ? JSON.parse(value) : value
		return new Proposal(
			object.instance,
			object.proposer,
			object.round,
			object.value,
			object.valueRound,
			object.acceptor,
			object.requester,
			object.learned
		)
	}

	Proposal.prototype.precedes = function (proposer, round) {
		return this.round < round
			|| (this.proposer !== proposer && this.round === round)
	}

	Proposal.prototype.supersedes = function (proposer, round) {
		return this.round > round
			|| (this.proposer !== proposer && this.round === round)
	}

	Proposal.prototype.copy = function () {
		return new Proposal(
			this.instance,
			this.proposer,
			this.round,
			this.value,
			this.valueRound,
			this.acceptor,
			this.requester,
			this.learned
		)
	}

	Proposal.prototype.toString = function () {
		return 'Proposal(' +
			' i: ' + this.instance +
			' p: ' + this.proposer +
			' r: ' + this.round +
			' v: ' + this.value +
			' vr: ' + this.valueRound +
			' a: ' + this.acceptor +
			' r: ' + this.requester +
			' x: ' + this.learned +
			' )'
	}

	return Proposal
}
