module.exports = function (inherits, EventEmitter) {

	function Learner(majority, highmark) {
		EventEmitter.call(this)
		this.majority = majority
		this.instanceProposals = {}
		this._highmark = highmark || 0
	}
	inherits(Learner, EventEmitter)

	function maxBallot(previous, current) {
		return current.ballot > previous.ballot ? current : previous
	}

	function chooseProposal(proposals) {
		return proposals.reduce(maxBallot)
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	Learner.prototype.accepted = function (proposal) {
		if (this._highmark >= proposal.instance) {
			return
		}
		var proposals = this.instanceProposals[proposal.instance] || []
		if (!proposals.some(sameAcceptor(proposal))) {
			proposals.push(proposal)
		}
		if (proposals.length >= this.majority) {
			var fact = chooseProposal(proposals)
			this.emit('fact', fact)
			delete this.instanceProposals[proposal.instance]
		}
		else {
			this.instanceProposals[proposal.instance] = proposals
		}
	}

	Learner.prototype.highmark = function (instance) {
		this._highmark = instance || this._highmark
		return this._highmark
	}

	return Learner
}
