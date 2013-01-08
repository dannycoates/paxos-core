var assert = require('assert')
var Paxos = require('../index')

describe("Paxos", function () {

	var paxos = null

	beforeEach(function () {
		paxos = new Paxos(1, 1)
	})

	describe('submit()', function () {

		it('works in the best case scenario', function (done) {
			var facts = []
			var values = []
			var count = 10
			for (var i = 1; i <= count; i++) {
				values.push(i)
			}
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
})
