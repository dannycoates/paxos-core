module.exports = function (inherits, Stream, Receiver, StreamState) {

	// TODO: a way to "query" acceptors for gap instances?
	function Learner(majority, startingInstance) {
		Stream.call(this)
		this.readable = true
		this.state = new StreamState(startingInstance || 0)
		this.receiver = new Receiver(majority, startingInstance)
		this.receiver.on('learned', onLearned.bind(this))

		this.onAccepted = this.accepted.bind(this)
	}
	inherits(Learner, Stream)

	function onLearned(fact) {
		this.emit('learned', fact)
		var facts = this.state.add(fact)
		var highestInstance;
		for (var i = 0; i < facts.length; i++) {
			var fact = facts[i]
			highestInstance = fact.instance
			this.emit('data', fact)
		}
		this.receiver.highmark(highestInstance)
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
