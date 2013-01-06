module.exports = function (logger, inherits, EventEmitter, Learner, Acceptor, Proposer) {

	function Paxos(id, majority, storage, startingInstance) {
		EventEmitter.call(this)
		this.values = []
		this.prepared = []
		this.learner = new Learner(majority, startingInstance || 0)
		this.acceptor = new Acceptor(id, storage)
		this.proposer = new Proposer(id, majority)

		this.prepare = this.acceptor.onPrepare
		this.accept = this.acceptor.onAccept
		this.promised = this.proposer.onPromised
		this.rejected = this.proposer.onRejected
		this.accepted = this.learner.onAccepted
		this.learn = this.learner.onLearn

		this.acceptor.on('promised', onAcceptorPromised.bind(this))
		this.acceptor.on('rejected', onAcceptorRejected.bind(this))
		this.acceptor.on('accepted', onAcceptorAccepted.bind(this))

		this.proposer.on('prepare', onProposerPrepare.bind(this))
		this.proposer.on('propose', onProposerPropose.bind(this))
		this.proposer.on('accept', onProposerAccept.bind(this))
		this.proposer.on('reject', this.proposer.onRejected)

		this.learner.on('data', onLearnerData.bind(this))
		this.learner.on('learned', onLearnerLearned.bind(this))
	}
	inherits(Paxos, EventEmitter)

	Paxos.prototype.made = function (proposal) {
		return this.proposer.id === proposal.requester
	}

	Paxos.prototype.submit = function (value) {
		if (this.prepared.length > 0) {
			var proposal = prepared.shift()
			this.proposer.accept(proposal)
		}
		else {
			this.values.push(value)
			this.proposer.prepare()
		}
	}

	function onAcceptorPromised(proposal) {
		logger.info('id %s PROMISED\t%s', this.proposer.id, proposal)
		if (this.made(proposal)) {
			this.proposer.promised(proposal)
		}
		else {
			this.emit('promised', proposal)
		}
	}

	function onAcceptorRejected(proposal) {
		logger.info('id %s REJECTED\t%s', this.proposer.id, proposal)
		if (this.made(proposal)) {
			this.proposer.rejected(proposal)
			this.values.unshift(proposal.value)
		}
		else {
			this.emit('rejected', proposal)
		}
	}

	function onAcceptorAccepted(proposal) {
		logger.info('id %s ACCEPTED\t%s', this.proposer.id, proposal)
		if (this.made(proposal)) {
			this.learner.accepted(proposal)
		}
		else {
			this.emit('accepted', proposal)
		}
	}

	function onProposerPrepare(proposal) {
		logger.info('id %s PREPARE\t%s', this.proposer.id, proposal)
		this.acceptor.prepare(proposal)
		this.emit('prepare', proposal)
	}

	function onProposerPropose(proposal) {
		logger.info('id %s PROPOSE\t%s', this.proposer.id, proposal)
		if (this.values.length > 0) {
			proposal.value = this.values.shift()
			this.proposer.accept(proposal)
		}
		else {
			this.prepared.push(proposal)
		}
	}

	function onProposerAccept(proposal) {
		logger.info('id %s ACCEPT\t%s', this.proposer.id, proposal)
		this.acceptor.accept(proposal)
		this.emit('accept', proposal)
	}

	function onLearnerData(proposal) {
		logger.info('id %s LEARNED\t%s', this.proposer.id, proposal)
		this.acceptor.learn(proposal)
		this.proposer.learn(proposal)
		if (this.made(proposal)) {
			this.emit('data', proposal)
		}
	}

	function onLearnerLearned(proposal) {
		this.emit('learned', proposal)
	}

	return Paxos
}
