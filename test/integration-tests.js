var assert = require('assert')

var Proposer = require('../proposer')
var Acceptor = require('../acceptor')
var Learner = require('../learner')

var NoServer = require('../lib/no-server')()
var Paxos = require('../paxos')(Learner, Acceptor, Proposer)

var paxos = new Paxos(new NoServer(), null, 1, 1)

var values = []
var count = 10
for (var i = 1; i <= count; i++) {
	values.push(i)
}

describe("the whole f'ing thing", function () {

	it('works in the best case scenario', function (done) {
		var facts = []
		paxos.learner.on(
			'data',
			function (fact) {
				facts.push(fact)
				if (fact.instance === count) {
					assert.equal(facts.length, count)
					done()
				}
			}
		)

		while (values.length > 0) {
			paxos.submit(values.shift())
		}
	})
})
