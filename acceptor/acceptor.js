module.exports = function (assert, inherits, EventEmitter, AcceptState, NoStorage) {

	function Acceptor(id, learner, storage) {
		EventEmitter.call(this)
		this.id = id
		this.learner = learner //TODO learner can probably be move "up" a level
		this.learner.on('data', onlearnerData.bind(this))
		this.storage = storage || new NoStorage()
		this.highmark = this.learner.highmark()
		this.instances = {}

		this.onPrepare = this.prepare.bind(this)
		this.onAccept = this.accept.bind(this)

		this._registerStorageEvents()
	}
	inherits(Acceptor, EventEmitter)

	Acceptor.prototype._registerStorageEvents = function () {
		var events = ['promised', 'rejected', 'accepted', 'stored', 'lookup']
		for (var i = 0; i < events.length; i++) {
			var event = events[i]
			this.storage.on(event, this.emit.bind(this, event))
		}
	}

	Acceptor.prototype.instance = function (id) {
		var instance = this.instances[id] || new AcceptState(id, this.id)
		this.instances[id] = instance
		return instance
	}

	Acceptor.prototype.prepare = function (prepare) {
		if (prepare.instance <= this.highmark) {
			return this.lookup(prepare.instance, 'promised')
		}

		var proposal = this.instance(prepare.instance).prepare(prepare)
		this.storage.set(proposal, 'promised')
	}

	Acceptor.prototype.accept = function (proposal) {
		if (proposal.instance <= this.highmark) {
			return this.lookup(proposal.instance, 'rejected')
		}

		var instance = this.instance(proposal.instance)
		var accepted = instance.accept(proposal)
		if (accepted) {
			return this.storage.set(accepted, 'accepted')
		}
		this.emit('rejected', instance.proposal())
	}

	Acceptor.prototype.lookup = function (instance, event) {
		this.storage.get(instance, event || 'lookup')
	}

	function onlearnerData(proposal) {
		this.highmark = proposal.instance
		this.storage.set(proposal)
		delete this.instances[proposal.instance]
	}

	return Acceptor
}
