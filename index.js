var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Proposer = require('./proposer')
var Acceptor = require('./acceptor')
var Learner = require('./learner')
var Paxos = require('./paxos')(inherits, EventEmitter, Learner, Acceptor, Proposer)

module.exports = Paxos
