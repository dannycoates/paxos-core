module.exports = function (inherits, EventEmitter, Learner, Acceptor, Proposer) {

	function Paxos(id, majority, storage, startingInstance) {
		EventEmitter.call(this)
		this.values = []
		this.prepared = []
		this.learner = new Learner(majority, startingInstance || 0)
		this.acceptor = new Acceptor(id, this.learner, storage)
		this.proposer = new Proposer(id, majority, this.learner)

		this.prepare = this.acceptor.onPrepare
		this.accept = this.acceptor.onAccept
		this.promised = this.proposer.onPromised
		this.rejected = this.proposer.onRejected
		this.accepted = this.learner.onAccepted

		this.onAcceptorPromised = onAcceptorPromised.bind(this)
		this.onAcceptorRejected = onAcceptorRejected.bind(this)
		this.onAcceptorAccepted = onAcceptorAccepted.bind(this)

		this.onProposerPrepare = onProposerPrepare.bind(this)
		this.onProposerPropose = onProposerPropose.bind(this)
		this.onProposerAccept = onProposerAccept.bind(this)

		this.acceptor.on('promised', this.onAcceptorPromised)
		this.acceptor.on('rejected', this.onAcceptorRejected)
		this.acceptor.on('accepted', this.onAcceptorAccepted)

		this.proposer.on('prepare', this.onProposerPrepare)
		this.proposer.on('propose', this.onProposerPropose)
		this.proposer.on('accept', this.onProposerAccept)

		this.learner.on('learned', this.emit.bind(this, 'learned'))
	}
	inherits(Paxos, EventEmitter)

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
		this.proposer.promised(proposal)
		this.emit('promised', proposal)
	}

	function onAcceptorRejected(proposal) {
		this.proposer.rejected(proposal)
		this.emit('rejected', proposal)
	}

	function onAcceptorAccepted(proposal) {
		this.learner.accepted(proposal)
		this.emit('accepted', proposal)
	}

	function onProposerPrepare(prepare) {
		this.acceptor.prepare(prepare)
		this.emit('prepare', prepare)
	}

	function onProposerPropose(proposal) {
		if (this.values.length > 0) {
			proposal.value = this.values.shift()
			this.proposer.accept(proposal)
		}
		else {
			this.prepared.push(proposal)
		}
	}

	function onProposerAccept(proposal) {
		this.acceptor.accept(proposal)
		this.emit('accept', proposal)
	}

	return Paxos
}
