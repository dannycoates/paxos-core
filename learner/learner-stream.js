module.exports = function (inherits, Stream, Learner, StreamState) {

	// TODO: a way to "query" acceptors for gap instances?
	function LearnerStream(majority, startingInstance) {
		Stream.call(this)
		this.readable = true
		this.state = new StreamState(startingInstance || 0)
		this.learner = new Learner(majority, startingInstance)
		this.onFact = onFact.bind(this)
		this.learner.on('fact', this.onFact)
	}
	inherits(LearnerStream, Stream)

	function onFact(fact) {
		this.state = this.state.add(this, fact)
	}

	LearnerStream.prototype.write = function (proposal) {
		this.learner.accepted(proposal)
	}

	LearnerStream.prototype.highmark = function () {
		return this.learner.highmark()
	}

	return LearnerStream
}
