var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Prepare = require('../lib/prepare')()
var Proposal = require('../lib/proposal')()
var Paxos = require('./instance-state')(assert, Prepare, Proposal)
var Proposer = require('./proposer')(assert, inherits, EventEmitter, Paxos)

module.exports = Proposer
