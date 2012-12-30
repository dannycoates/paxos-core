var EventEmitter = require('events').EventEmitter
var Stream = require('stream')
var inherits = require('util').inherits

var StreamState = require('./stream-state')()
var Receiver = require('./receiver')(inherits, EventEmitter)
var Learner = require('./learner')(inherits, Stream, Receiver, StreamState)

module.exports = Learner
