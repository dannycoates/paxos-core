var EventEmitter = require('events').EventEmitter
var Stream = require('stream')
var inherits = require('util').inherits

var StreamState = require('./stream-state')()
var Learner = require('./learner')(inherits, EventEmitter)
var LearnerStream = require('./learner-stream')(inherits, Stream, Learner, StreamState)

module.exports = LearnerStream
