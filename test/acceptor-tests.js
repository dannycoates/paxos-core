var assert = require('assert')
var Proposal = require('../lib/proposal')()
var Acceptor = require('../acceptor')

describe('Acceptor', function () {

	var acceptor = null

	beforeEach(function () {
		acceptor = new Acceptor(1)
	})

	describe('prepare()', function () {

		it('stores the highest round',
			function () {
				var prep1 = new Proposal(1, 9, 1)
				var prep2 = new Proposal(1, 9, 2)
				var prep3 = new Proposal(1, 9, 3)

				acceptor.prepare(prep2)
				assert.equal(acceptor.instance(1).round, prep2.round)
				acceptor.prepare(prep1)
				assert.equal(acceptor.instance(1).round, prep2.round)
				acceptor.prepare(prep3)
				assert.equal(acceptor.instance(1).round, prep3.round)
			}
		)

		it('emits the accepted proposal if one exists',
			function (done) {
				var proposal1 = new Proposal(4, 9, 3, 'x')
				acceptor.accept(proposal1)
				acceptor.once('promised', function (proposal) {
					assert.equal(proposal.value, proposal1.value)
					done()
				})

				acceptor.prepare(new Proposal(4, 9, 5))
			}
		)
	})

	describe('accept()', function () {

		it('does not accept a proposal with a lower round',
			function (done) {
				var proposal1 = new Proposal(4, 9, 5, 'x')
				var proposal2 = new Proposal(4, 9, 3, 'x')

				acceptor.accept(proposal1)
				acceptor.once('rejected', function (proposal) {
					assert.equal(proposal.round, proposal1.round)
					done()
				})
				acceptor.accept(proposal2)
			}
		)

		it('emits the accepted proposal',
			function (done) {
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal.round, proposal1.round)
					done()
				})

				var proposal1 = new Proposal(4, 9, 3, 'x')
				acceptor.accept(proposal1)
			}
		)

		it('accepts the first proposal if no prepare requests have been made',
			function (done) {
				var proposal1 = new Proposal(4, 9, 3, 'x')
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal.round, proposal1.round)
					done()
				})
				acceptor.accept(proposal1)
			}
		)

		it('rejects a proposal if a prepare request had a higher round',
			function (done) {
				var prep1 = new Proposal(4, 9, 5)
				var proposal1 = new Proposal(4, 9, 3, 'x')
				acceptor.once('rejected', function (proposal) {
					assert.equal(proposal.round, prep1.round)
					done()
				})
				acceptor.prepare(prep1)
				acceptor.accept(proposal1)
			}
		)

	})
})
