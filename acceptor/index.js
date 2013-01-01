var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Proposal = require('../lib/proposal')()
var Acceptor = require('./acceptor')(assert, inherits, EventEmitter, Proposal)

module.exports = Acceptor
