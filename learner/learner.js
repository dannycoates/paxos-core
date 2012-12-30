module.exports = function (inherits, Stream, Receiver, StreamState) {

	// TODO: a way to "query" acceptors for gap instances?
	function Learner(majority, startingInstance) {
		Stream.call(this)
		this.readable = true
		this.state = new StreamState(startingInstance || 0)
		this.receiver = new Receiver(majority, startingInstance)
		this.onFact = onFact.bind(this)
		this.receiver.on('fact', this.onFact)
	}
	inherits(Learner, Stream)

	function onFact(fact) {
		this.emit('fact', fact)
		this.state = this.state.add(this, fact)
	}

	Learner.prototype.emitProposal = function (proposal) {
		this.receiver.highmark(proposal.instance)
		this.emit('data', proposal)
	}

	Learner.prototype.accepted = function (proposal) {
		this.receiver.accepted(proposal)
	}

	Learner.prototype.write = Learner.prototype.accepted

	Learner.prototype.highmark = function () {
		return this.receiver.highmark()
	}

	return Learner
}
