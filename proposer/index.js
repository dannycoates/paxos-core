var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Prepare = require('../lib/prepare')()
var Proposal = require('../lib/proposal')()
var State = require('./propose-state')(assert, Prepare, Proposal)
var Proposer = require('./proposer')(assert, inherits, EventEmitter, State)

module.exports = Proposer
