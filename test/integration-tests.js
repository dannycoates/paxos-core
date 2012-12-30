var assert = require('assert')

var Proposer = require('../proposer')
var Acceptor = require('../acceptor')
var Learner = require('../learner')

var values = []
var count = 10
for (var i = 1; i <= count; i++) {
	values.push(i)
}

var learner = new Learner(2)
var proposer = new Proposer(1, 2, learner)
var acceptor1 = new Acceptor(10, learner)
var acceptor2 = new Acceptor(11, learner)
var acceptor3 = new Acceptor(12, learner)
var acceptors = [acceptor3, acceptor2, acceptor1]

proposer.on(
	'prepare',
	function (prepare) {
		acceptors.forEach(function (a) {
			a.prepare(prepare.copy())
		})
	}
)
proposer.on(
	'propose',
	function (proposal) {
		proposal.value = values.shift()
		proposer.accept(proposal)
	}
)

proposer.on(
	'accept',
	function (proposal) {
		acceptors.forEach(function (a) {
			a.accept(proposal.copy())
		})
	}
)

acceptors.forEach(
	function (a) {
		a.on('promised', proposer.promised.bind(proposer))
		a.on('refused', proposer.refused.bind(proposer))
		a.on('accepted', learner.accepted.bind(learner))
	}
)

describe("the whole f'ing thing", function () {

	it('works in the best case scenario', function (done) {
		var facts = []
		learner.on(
			'data',
			function (fact) {
				facts.push(fact)
				if (fact.instance === count) {
					assert.equal(facts.length, count)
					acceptors.forEach(
						function (a) {
							assert.equal(Object.keys(a.instances).length, 0)
						}
					)
					assert.equal(Object.keys(learner.receiver.instances).length, 0)
					assert.equal(Object.keys(proposer.instances).length, 0)
					done()
				}
			}
		)

		for (var i = 0; i < count; i++) {
			proposer.prepare()
		}
	})
})

