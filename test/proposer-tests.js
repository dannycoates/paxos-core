var assert = require('assert')
// var inherits = require('util').inherits
// var EventEmitter = require('events').EventEmitter
var Proposal = require('../lib/proposal')()
var Proposer = require('../proposer')

describe('Proposer', function () {

	var proposer = null

	beforeEach(function () {
		proposer = new Proposer(1, 2)
	})

	describe('prepare()', function () {

		it('creates and stores a paxos state', function () {
			proposer.prepare()
			assert.equal(proposer.instances[1].instance, 1)
		})

		it('creates states with incrementing ids starting at 1',
			function () {
				for (var i = 1; i <= 10; i++) {
					proposer.prepare()
					assert.equal(proposer.instances[i].instance, i)
				}
			}
		)
	})

	describe('promised()', function () {

		it('does nothing if the instance was not create with prepare()',
			function () {
				proposer.promised(new Proposal(1, 1, 1))
				assert.equal(proposer.instances[1], undefined)
			}
		)

		it('calls promised() on the instance',
			function (done) {
				proposer.prepare()
				proposer.instances[1].promised = function () { done() }
				proposer.promised(new Proposal(1, 1, 1))
			}
		)

		it('emits the action determined by the instance',
			function (done) {
				proposer.prepare()
				var proposal = new Proposal(1, 1, 1)
				var instance = proposer.instances[1]
				instance.action = 'foo'
				instance.promised = function () { return proposal }
				proposer.once('foo', function (p) {
					assert.equal(proposal, p)
					done()
				})

				proposer.promised(proposal)
			}
		)
	})

	describe('accept()', function () {

		it('emits accept with the given proposal',
			function (done) {
				var proposal = new Proposal(1, 1, 1)
				proposer.once('accept', function (p) {
					assert.equal(proposal, p)
					done()
				})

				proposer.accept(proposal)
			}
		)
	})

	describe('rejected()', function () {

	})

	describe('learn()', function () {

	})
})
