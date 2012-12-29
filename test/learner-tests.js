var assert = require('assert')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Learner = require('../learner/learner')(inherits, EventEmitter)
var Proposal = require('../lib/proposal')()

describe('Learner', function () {

	describe('accepted' , function () {

		var learner = null

		beforeEach(function () {
			learner = new Learner(2)
		})

		it('keeps new proposals before there is a majority', function () {
			var proposal = new Proposal(4, 3, 'x', 2, 1)
			learner.accepted(proposal)
			assert.equal(proposal, learner.instanceProposals[4][0])
		})

		it('only keeps one proposal for a given acceptor', function () {
			var proposal = new Proposal(4, 3, 'x', 2, 1)
			learner.accepted(proposal)
			learner.accepted(proposal)
			assert.equal(learner.instanceProposals[4].length, 1)
		})

		it('emits a fact when a majority is reached', function (done) {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 3, 'x', 2, 0)
			learner.on('fact', done.bind(null, null))
			learner.accepted(proposal0)
			learner.accepted(proposal1)
		})

		it('deletes the instanceProposals when a fact is chosen', function () {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 3, 'x', 2, 0)
			learner.accepted(proposal0)
			learner.accepted(proposal1)
			assert.equal(learner.instanceProposals[1], undefined)
		})

		it('emits the proposal with the largest ballot', function (done) {
			var proposal0 = new Proposal(4, 3, 'x', 2, 1)
			var proposal1 = new Proposal(4, 5, 'x', 2, 0)
			learner.on('fact', function (fact) {
				assert.equal(fact, proposal1)
				done()
			})
			learner.accepted(proposal0)
			learner.accepted(proposal1)
		})

		it('skips proposals for previously chosen instances', function () {
			learner.highmark(4)

			var proposal2 = new Proposal(4, 3, 'x', 2, 1)
			learner.accepted(proposal2)
			assert.equal(learner.instanceProposals[4], undefined)
		})

	})
})
