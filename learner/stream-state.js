module.exports = function () {

	function StreamState(startingInstance) {
		this.state = new Streaming(startingInstance || 0)
	}

	StreamState.prototype.add = function (proposal) {
		var facts = this.state.add(proposal)
		this.state = this.state.next
		return facts
	}

	function Streaming(previousInstance) {
		this.previousInstance = previousInstance
		this.next = this
	}

	var empty = []

	Streaming.prototype.add = function (proposal) {
		if (this.previousInstance >= proposal.instance) {
			// ignore repeat facts
			return empty
		}
		if (this.previousInstance + 1 === proposal.instance) {
			this.previousInstance = proposal.instance
			return [proposal]
		}
		this.next = new Buffering(this.previousInstance, proposal)
		return empty
	}

	function Buffering(previousInstance, newestFact) {
		this.previousInstance = previousInstance
		this.next = this
		this.gapLength = newestFact.instance - (previousInstance + 1)
		this.gap = []
		this.newestFact = newestFact
	}

	function compareInstance(a, b) {
		return a.instance - b.instance
	}

	function sameInstance(proposal) {
		return function (other) { return other.instance === proposal.instance }
	}

	Buffering.prototype.add = function (proposal) {
		if (
				proposal.instance <= this.previousInstance
				|| proposal.instance === this.newestFact.instance
				|| this.gap.some(sameInstance(proposal))
		) {
			// ignore repeat facts
			return empty
		}
		else if (proposal.instance < this.newestFact.instance) {
			this.gap.push(proposal)
		}
		else {
			this.gapLength = proposal.instance - (this.previousInstance + 1)
			this.gap.push(this.newestFact)
			this.newestFact = proposal
		}

		if(this.gap.length === this.gapLength) {
			this.gap.push(this.newestFact)
			this.gap.sort(compareInstance)
			this.next = new Streaming(this.newestFact.instance)
			return this.gap
		}
		return empty
	}

	return StreamState
}
