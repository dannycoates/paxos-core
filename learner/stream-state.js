module.exports = function () {

	function StreamingState(previousInstance) {
		this.previousInstance = previousInstance
	}

	StreamingState.prototype.add = function (stream, fact) {
		if (this.previousInstance >= fact.instance) {
			// ignore repeat facts
			return this
		}
		if (this.previousInstance + 1 === fact.instance) {
			this.previousInstance = fact.instance
			stream.emitProposal(fact)
			return this
		}
		return new BufferingState(this.previousInstance, fact)
	}

	function BufferingState(previousInstance, newestFact) {
		this.previousInstance = previousInstance
		this.gapLength = newestFact.instance - (previousInstance + 1)
		this.gap = []
		this.newestFact = newestFact
	}

	function compareInstance(a, b) {
		return a.instance - b.instance
	}

	function sameInstance(fact) {
		return function (other) { return other.instance === fact.instance }
	}

	BufferingState.prototype.add = function (stream, fact) {
		if (
				fact.instance <= this.previousInstance ||
				fact.instance === this.newestFact.instance ||
				this.gap.some(sameInstance(fact))
		) {
			// ignore repeat facts
			return this
		}
		else if (fact.instance < this.newestFact.instance) {
			this.gap.push(fact)
		}
		else {
			this.gapLength = fact.instance - (this.previousInstance + 1)
			this.gap.push(this.newestFact)
			this.newestFact = fact
		}

		if(this.gap.length === this.gapLength) {
			this.gap.sort(compareInstance)
			for (var i = 0; i < this.gapLength; i++) {
				stream.emitProposal(this.gap[i])
			}
			stream.emitProposal(this.newestFact)
			return new StreamingState(this.newestFact.instance)
		}

		return this
	}

	// only StreamingState needs to be public
	// because it is always the initial state
	return StreamingState
}
