var assert = require('assert')
var Paxos = require('../index')
var Cluster = require('../lib/event-cluster')(Paxos)
var Proposal = require('../lib/proposal')()

describe('Paxos Cluster', function () {

	var cluster = null

	beforeEach(function () {
		cluster = new Cluster(3)
	})

	it('all nodes learn the value', function (done) {
		var i = 0

		function count(proposal) {
			assert.equal(proposal.value, 'foo')
			if (++i === cluster.members().length) {
				done()
			}
		}

		cluster.members().forEach(
			function (node) {
				node.on('learned', count)
			}.bind(this)
		)

		cluster.get(1).submit('foo')
	})
})
