module.exports = function (Learner, Acceptor, Proposer) {

	function Paxos(server, storage, id, majority, startingInstance) {
		this.values = []
		this.prepared = []
		this.server = server
		this.learner = new Learner(majority, startingInstance || 0)
		this.acceptor = new Acceptor(id, this.learner, storage)
		this.proposer = new Proposer(id, majority, this.learner)

		this.onAcceptorPromised = onAcceptorPromised.bind(this)
		this.onAcceptorRejected = onAcceptorRejected.bind(this)
		this.onAcceptorAccepted = onAcceptorAccepted.bind(this)

		this.onProposerPrepare = onProposerPrepare.bind(this)
		this.onProposerPropose = onProposerPropose.bind(this)
		this.onProposerAccept = onProposerAccept.bind(this)

		this.server.on('prepare', this.acceptor.onPrepare)
		this.server.on('accept', this.acceptor.onAccept)
		this.server.on('promised', this.proposer.onPromised)
		this.server.on('rejected', this.proposer.onRejected)
		this.server.on('accepted', this.learner.onAccepted)

		this.acceptor.on('promised', this.onAcceptorPromised)
		this.acceptor.on('rejected', this.onAcceptorRejected)
		this.acceptor.on('accepted', this.onAcceptorAccepted)

		this.proposer.on('prepare', this.onProposerPrepare)
		this.proposer.on('propose', this.onProposerPropose)
		this.proposer.on('accept', this.onProposerAccept)
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
		this.proposer.promised(proposal)
		this.server.promised(proposal)
	}

	function onAcceptorRejected(proposal) {
		this.proposer.rejected(proposal)
		this.server.rejected(proposal)
	}

	function onAcceptorAccepted(proposal) {
		this.learner.accepted(proposal)
		this.server.accepted(proposal)
	}

	function onProposerPrepare(prepare) {
		this.acceptor.prepare(prepare)
		this.server.prepare(prepare)
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
		this.server.accept(proposal)
	}

	return Paxos
}
