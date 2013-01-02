var assert = require('assert')
var Paxos = require('../index')

var paxos = new Paxos(1, 1)

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
