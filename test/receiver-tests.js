var assert = require('assert')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var LearnState = require('../learner/learn-state')()
var Receiver = require('../learner/receiver')(inherits, EventEmitter, LearnState)
var Proposal = require('../lib/proposal')()

describe('Receiver', function () {

	describe('accepted' , function () {

		var receiver = null

		beforeEach(function () {
			receiver = new Receiver(2)
		})

		it('keeps new proposals before there is a majority', function () {
			var proposal = new Proposal(4, 9, 3, 'x', 2, 1)
			receiver.accepted(proposal)
			assert.equal(proposal, receiver.instances[4].proposals[0])
		})

		it('only keeps one proposal for a given acceptor', function () {
			var proposal = new Proposal(4, 9, 3, 'x', 2, 1)
			receiver.accepted(proposal)
			receiver.accepted(proposal)
			assert.equal(receiver.instances[4].proposals.length, 1)
		})

		it('emits a fact when a majority is reached', function (done) {
			var proposal0 = new Proposal(4, 9, 3, 'x', 2, 0)
			var proposal1 = new Proposal(4, 9, 3, 'x', 2, 1)
			receiver.on('learned', done.bind(null, null))
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
		})

		it('deletes the instance when a fact is chosen', function () {
			var proposal0 = new Proposal(4, 9, 3, 'x', 2, 0)
			var proposal1 = new Proposal(4, 9, 3, 'x', 2, 1)
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
			assert.equal(receiver.instances[1], undefined)
		})

		it('requires the winning round to have a majority of votes', function (done) {
			var proposal0 = new Proposal(4, 9, 3, 'y', 3, 0)
			var proposal1 = new Proposal(4, 9, 5, 'x', 5, 1)
			var proposal2 = new Proposal(4, 9, 5, 'x', 5, 2)
			var learned = false
			receiver.on('learned', function (fact) {
				assert.equal(fact.round, proposal2.round)
				learned = true
				done()
			})
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
			assert(!learned)
			receiver.accepted(proposal2)
		})

		it('skips proposals for previously chosen instances', function () {
			receiver.highmark(4)

			var proposal2 = new Proposal(4, 9, 3, 'x', 2, 1)
			receiver.accepted(proposal2)
			assert.equal(receiver.instances[4], undefined)
		})

	})
})
