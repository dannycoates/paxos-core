var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Proposal = require('../lib/proposal')()
var AcceptState = require('./accept-state')(Proposal)
var Acceptor = require('./acceptor')(assert, inherits, EventEmitter, AcceptState)

module.exports = Acceptor
