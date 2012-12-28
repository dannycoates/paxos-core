module.exports = function (inherits, EventEmitter) {

	function Learner(majority) {
		EventEmitter.call(this)
		this.majority = majority
		this.instanceProposals = {}
		this.instanceFacts = {}
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

	Learner.prototype.decide = function (proposal) {
		if (this.instanceFacts[proposal.instance]) {
			return
		}
		var proposals = this.instanceProposals[proposal.instance] || []
		if (!proposals.some(sameAcceptor(proposal))) {
			proposals.push(proposal)
		}
		if (proposals.length >= this.majority) {
			var fact = chooseProposal(proposals)
			this.emit('fact', fact)
			this.instanceFacts[fact.instance] = fact
			delete this.instanceProposals[proposal.instance]
		}
		else {
			this.instanceProposals[proposal.instance] = proposals
		}
	}

	return Learner
}
