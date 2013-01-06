module.exports = function (inherits, Stream, Receiver, StreamState) {

	// TODO: a way to "query" acceptors for gap instances?
	function Learner(majority, startingInstance) {
		Stream.call(this)
		this.readable = true
		this.stream = new StreamState(startingInstance || 0)
		this.receiver = new Receiver(majority, startingInstance)
		this.receiver.on('learned', onLearned.bind(this))

		this.onAccepted = this.accepted.bind(this)
		this.onLearn = this.learn.bind(this)
	}
	inherits(Learner, Stream)

	function onLearned(proposal) {
		proposal.learned = true
		this.emit('learned', proposal)
		var facts = this.stream.add(proposal)
		var highestInstance;
		for (var i = 0; i < facts.length; i++) {
			var proposal = facts[i]
			highestInstance = proposal.instance
			this.emit('data', proposal)
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

	Learner.prototype.learn = function (proposal) {
		this.receiver.learn(proposal)
	}

	return Learner
}
