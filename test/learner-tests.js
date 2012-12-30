var assert = require('assert')

var Learner = require('../learner')
var Proposal = require('../lib/proposal')()

function makeFacts(count, start) {
	var facts = []
	var start = start || 1
	for (var i = start; i < start + count; i++) {
		facts.push(new Proposal(i, 999))
	}
	return facts
}

function randomSort(a, b) {
	return Math.random() - 0.5
}

describe('Learner', function () {

	describe('on(data)' , function () {

		var receiver = null
		var ls = null

		beforeEach(function () {
			ls = new Learner(2)
			receiver = ls.receiver
		})

		afterEach(function () {
			receiver.removeAllListeners('fact')
			ls.removeAllListeners('data')
		})

		it('emits data events immediately when receiver emits sequentially',
			function (done) {
				var count = 10
				var i = 1
				var facts = makeFacts(count)
				ls.on('data', function (fact) {
					assert.equal(facts.length, count - i)
					assert.equal(fact.instance, i++)
					if (i > count) {
						done()
					}
				})
				while (facts.length) {
					receiver.emit('fact', facts.shift())
				}
			}
		)

		it('emits data in instance order when receiver emits out of order',
			function (done) {
				var count = 100
				var i = 1
				var facts = makeFacts(count).sort(randomSort)
				ls.on('data', function (fact) {
					assert.equal(fact.instance, i++)
					if (i > count) {
						done()
					}
				})
				while (facts.length) {
					receiver.emit('fact', facts.shift())
				}
			}
		)

		it('emits data in instance order when receiver emits in order and out',
			function (done) {
				var count = 100
				var i = 1
				var facts = makeFacts(20)
					.concat(makeFacts(10, 21).sort(randomSort))
					.concat(makeFacts(50, 31))
					.concat(makeFacts(10, 81).sort(randomSort))
					.concat(makeFacts(10, 91))
				ls.on('data', function (fact) {
					assert.equal(fact.instance, i++)
					if (i > count) {
						done()
					}
				})
				while (facts.length) {
					receiver.emit('fact', facts.shift())
				}
			}
		)

		it('ignores facts it has already handled',
			function (done) {
				var count = 100
				var i = 1
				var facts = makeFacts(10)
					.concat(makeFacts(10).sort(randomSort))
					.concat(makeFacts(40, 11).sort(randomSort))
					.concat(makeFacts(40, 11).sort(randomSort))
					.concat(makeFacts(50, 51))
				ls.on('data', function (fact) {
					assert.equal(fact.instance, i++)
					if (i > count) {
						done()
					}
				})
				while (facts.length) {
					receiver.emit('fact', facts.shift())
				}
			}
		)
	})
})
