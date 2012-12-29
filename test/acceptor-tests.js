var assert = require('assert')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Proposal = require('../lib/proposal')()
var Prepare = require('../lib/prepare')()
var Acceptor = require('../acceptor/acceptor')(inherits, EventEmitter)

describe('Acceptor', function () {

	var acceptor = null

	beforeEach(function () {
		acceptor = new Acceptor(1)
	})

	describe('prepare', function () {

		it('stores the highest ballot',
			function () {
				var prep1 = new Prepare(1, 1)
				var prep2 = new Prepare(1, 2)
				var prep3 = new Prepare(1, 3)

				acceptor.prepare(prep2)
				assert.equal(acceptor.instances[1], prep2)
				acceptor.prepare(prep1)
				assert.equal(acceptor.instances[1], prep2)
				acceptor.prepare(prep3)
				assert.equal(acceptor.instances[1], prep3)
			}
		)

		it('emits the accepted proposal if one exists',
			function (done) {
				var proposal1 = new Proposal(4, 3, 'x', 2, 1)
				acceptor.accept(proposal1)
				acceptor.once('prepared', function (proposal) {
					assert.equal(proposal, proposal1)
					done()
				})

				acceptor.prepare(new Prepare(4, 5))
			}
		)

		it('updates the accepted proposal ballot if the prepare ballot is larger',
			function () {
				var proposal = new Proposal(4, 3, 'x', 2, 1)
				acceptor.accept(proposal)

				var prep = new Prepare(4, 5)
				acceptor.prepare(prep)
				assert.equal(proposal.ballot, prep.ballot)
			}
		)
	})

	describe('accept', function () {

		it('does not accept a proposal with a lower ballot',
			function (done) {
				var proposal1 = new Proposal(4, 5, 'x', 2, 1)
				var proposal2 = new Proposal(4, 3, 'x', 2, 1)

				acceptor.accept(proposal1)
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal, proposal1)
					done()
				})
				acceptor.accept(proposal2)
			}
		)

		it('emits the accepted proposal',
			function (done) {
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal, proposal1)
					done()
				})

				var proposal1 = new Proposal(4, 3, 'x', 2, 1)
				acceptor.accept(proposal1)
			}
		)

		it('accepts the first proposal if no prepare requests have been made',
			function (done) {
				var proposal1 = new Proposal(4, 3, 'x', 2, 1)
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal, proposal1)
					done()
				})
				acceptor.accept(proposal1)
			}
		)

		it('rejects a proposal if a prepare request had a higher ballot',
			function (done) {
				var prep1 = new Prepare(4, 5)
				var proposal1 = new Proposal(4, 3, 'x', 2, 1)
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal, prep1)
					done()
				})
				acceptor.prepare(prep1)
				acceptor.accept(proposal1)
			}
		)

	})
})
