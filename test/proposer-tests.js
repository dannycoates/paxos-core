var assert = require('assert')
// var inherits = require('util').inherits
// var EventEmitter = require('events').EventEmitter
// var Proposal = require('../lib/proposal')()
var Proposer = require('../proposer')

describe('Proposer', function () {

	var proposer = null

	beforeEach(function () {
		proposer = new Proposer(1, 2)
	})

	describe('prepare', function () {

		it('creates and stores a paxos state', function () {
			proposer.prepare()
			assert.equal(proposer.instances[1].instance, 1)
		})

		it('creates states with incrementing ids starting at 1', function () {
			for (var i = 1; i <= 10; i++) {
				proposer.prepare()
				assert.equal(proposer.instances[i].instance, i)
			}
		})


	})

	describe('promise', function () {

		it('')
	})
})
