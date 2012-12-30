var assert = require('assert')
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var Acceptor = require('./acceptor')(assert, inherits, EventEmitter)

module.exports = Acceptor
