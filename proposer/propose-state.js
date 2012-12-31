module.exports = function (assert, inherits, EventEmitter, Prepare, Proposal) {

	function ProposeState(proposer, instance, ballot) {
		EventEmitter.call(this)
		this.proposerId = proposer.id
		this.instance = instance
		this.ballot = ballot || 0
		this.value = null
		this.valueBallot = 0

		// TODO: decide where timeouts go. At this point there's arguments for
		// here, where they become part of the state, or in the communication
		// layer which keeps the state "time free". I think I'd prefer to keep
		// knowledge of time out of the state, but it seems easier to implement
		// here. So lets try to do it "there" and only come back if its too ugly.

		this.promises = []
		this.majority = proposer.majority
	}
	inherits(ProposeState, EventEmitter)

	ProposeState.create = function (proposer, instance, ballot) {
		var state = new ProposeState(proposer, instance, ballot)
		state.on('prepare', proposer.onPrepare)
		state.on('accept', proposer.onAccept)
		state.on('propose', proposer.onPropose)
		return state
	}

	ProposeState.prototype.nextBallot = function (previous) {
		var id = previous % 100
		var counter = (previous - id) + 100 //here's the increment
		this.ballot = counter + this.proposerId
		this.promises = []
		return this.ballot
	}

	ProposeState.prototype.prepare = function (previousBallot) {
		this.nextBallot(previousBallot || this.ballot)
		this.emit('prepare', new Prepare(this.instance, this.ballot))
	}

	ProposeState.prototype.proposal = function () {
		var proposal = new Proposal(this.instance, this.ballot, this.value, this.valueBallot)
		var event = this.value ? 'accept' : 'propose'
		this.emit(event, proposal)
	}

	function sameAcceptor(proposal) {
		return function (other) { return proposal.acceptor === other.acceptor }
	}

	function highestValueBallot(a, b) {
		return (a.valueBallot || 0) > (b.valueBallot || 0) ? a : b
	}

	ProposeState.prototype.promised = function (proposal) {
		assert.equal(this.instance, proposal.instance)

		if (this.ballot < proposal.ballot) {
			// prepare failed, retry with a higher ballot
			return this.prepare(proposal.ballot)
		}

		if (!this.promises.some(sameAcceptor(proposal))) {
			this.promises.push(proposal)
		}
		if (this.promises.length === this.majority) {
			var highest = this.promises.reduce(highestValueBallot)
			if (highest.valueBallot) {
				this.value = highest.value
				// otherwise there were no accepted proposals
			}
			this.valueBallot = this.ballot
			return this.proposal()
		}
	}

	ProposeState.prototype.complete = function (proposer) {
		this.removeListener('prepare', proposer.onPrepare)
		this.removeListener('accept', proposer.onAccept)
		this.removeListener('propose', proposer.onPropose)
	}

	return ProposeState
}
