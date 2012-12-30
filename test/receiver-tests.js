var assert = require('assert')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Receiver = require('../learner/receiver')(inherits, EventEmitter)
var Proposal = require('../lib/proposal')()

describe('Receiver', function () {

	describe('accepted' , function () {

		var receiver = null

		beforeEach(function () {
			receiver = new Receiver(2)
		})

		it('keeps new proposals before there is a majority', function () {
			var proposal = new Proposal(4, 3, 'x', 2, 1)
			receiver.accepted(proposal)
			assert.equal(proposal, receiver.instanceProposals[4][0])
		})

		it('only keeps one proposal for a given acceptor', function () {
			var proposal = new Proposal(4, 3, 'x', 2, 1)
			receiver.accepted(proposal)
			receiver.accepted(proposal)
			assert.equal(receiver.instanceProposals[4].length, 1)
		})

		it('emits a fact when a majority is reached', function (done) {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 3, 'x', 2, 0)
			receiver.on('fact', done.bind(null, null))
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
		})

		it('deletes the instanceProposals when a fact is chosen', function () {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 3, 'x', 2, 0)
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
			assert.equal(receiver.instanceProposals[1], undefined)
		})

		it('emits the proposal with the largest ballot', function (done) {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 5, 'x', 2, 0)
			receiver.on('fact', function (fact) {
				assert.equal(fact, proposal1)
				done()
			})
			receiver.accepted(proposal0)
			receiver.accepted(proposal1)
		})

		it('skips proposals for previously chosen instances', function () {
			receiver.highmark(4)

			var proposal2 = new Proposal(4, 3, 'x', 2, 1)
			receiver.accepted(proposal2)
			assert.equal(receiver.instanceProposals[4], undefined)
		})

	})
})
