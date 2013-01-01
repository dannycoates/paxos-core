var assert = require('assert')
var Prepare = require('../lib/prepare')()
var Proposal = require('../lib/proposal')()
var Acceptor = require('../acceptor')

describe('Acceptor', function () {

	var acceptor = null
	var fakeLearner = {on: function () {}, highmark: function () { return 0 }}

	beforeEach(function () {
		acceptor = new Acceptor(1, fakeLearner)
	})

	describe('prepare()', function () {

		it('stores the highest ballot',
			function () {
				var prep1 = new Prepare(1, 1)
				var prep2 = new Prepare(1, 2)
				var prep3 = new Prepare(1, 3)

				acceptor.prepare(prep2)
				assert.equal(acceptor.instance(1).ballot, prep2.ballot)
				acceptor.prepare(prep1)
				assert.equal(acceptor.instance(1).ballot, prep2.ballot)
				acceptor.prepare(prep3)
				assert.equal(acceptor.instance(1).ballot, prep3.ballot)
			}
		)

		it('emits the accepted proposal if one exists',
			function (done) {
				var proposal1 = new Proposal(4, 3, 'x')
				acceptor.accept(proposal1)
				acceptor.once('promised', function (proposal) {
					assert.equal(proposal.value, proposal1.value)
					done()
				})

				acceptor.prepare(new Prepare(4, 5))
			}
		)
	})

	describe('accept()', function () {

		it('does not accept a proposal with a lower ballot',
			function (done) {
				var proposal1 = new Proposal(4, 5, 'x')
				var proposal2 = new Proposal(4, 3, 'x')

				acceptor.accept(proposal1)
				acceptor.once('rejected', function (proposal) {
					assert.equal(proposal.ballot, proposal1.ballot)
					done()
				})
				acceptor.accept(proposal2)
			}
		)

		it('emits the accepted proposal',
			function (done) {
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal.ballot, proposal1.ballot)
					done()
				})

				var proposal1 = new Proposal(4, 3, 'x')
				acceptor.accept(proposal1)
			}
		)

		it('accepts the first proposal if no prepare requests have been made',
			function (done) {
				var proposal1 = new Proposal(4, 3, 'x')
				acceptor.once('accepted', function (proposal) {
					assert.equal(proposal.ballot, proposal1.ballot)
					done()
				})
				acceptor.accept(proposal1)
			}
		)

		it('refuses a proposal if a prepare request had a higher ballot',
			function (done) {
				var prep1 = new Prepare(4, 5)
				var proposal1 = new Proposal(4, 3, 'x')
				acceptor.once('rejected', function (proposal) {
					assert.equal(proposal.ballot, prep1.ballot)
					done()
				})
				acceptor.prepare(prep1)
				acceptor.accept(proposal1)
			}
		)

	})
})
