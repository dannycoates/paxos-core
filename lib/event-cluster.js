module.exports = function (Paxos) {

	function EventCluster(n) {
		this.nodes = {}
		var majority = Math.floor(n / 2) + 1
		for (var i = 1; i <= n; i++) {
			this.nodes[i] = new Paxos(i, majority)
		}
		this._wireNodes()
	}

	EventCluster.prototype.reply = function (name, message) {
		var node = this.nodes[message.requester]
		node[name](message)
	}

	EventCluster.prototype.broadcast = function (name, message) {
		for (var i = 1; i <= Object.keys(this.nodes).length; i++) {
			if (i !== message.requester) {
				var node = this.nodes[i]
				//console.log('id %s %s\t%s', i, name, message)
				node[name](message)
			}
		}
	}

	EventCluster.prototype._wireNodes = function () {
		for (var i = 1; i <= Object.keys(this.nodes).length; i++) {
			var node = this.nodes[i]
			node.on('prepare', this.broadcast.bind(this, 'prepare'))
			node.on('promised', this.reply.bind(this, 'promised'))
			node.on('accept', this.broadcast.bind(this, 'accept'))
			node.on('accepted', this.reply.bind(this, 'accepted'))
			node.on('rejected', this.reply.bind(this, 'rejected'))
			node.on('data', this.broadcast.bind(this, 'learn'))
		}
	}

	EventCluster.prototype.members = function () {
		return Object.keys(this.nodes).map(
			function (x) { return this.nodes[x] }.bind(this)
		)
	}

	EventCluster.prototype.get = function (id) {
		return this.nodes[id]
	}

	return EventCluster
}
