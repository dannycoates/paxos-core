var logger = console

var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Proposal = require('./lib/proposal')()
var Proposer = require('./proposer')
var Acceptor = require('./acceptor')
var Learner = require('./learner')
var Paxos = require('./paxos')(logger, inherits, EventEmitter, Learner, Acceptor, Proposer)

Paxos.prototype.Proposal = Proposal
Paxos.Proposal = Proposal

module.exports = Paxos
