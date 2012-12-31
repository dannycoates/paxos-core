module.exports = function () {

	function StreamState(startingInstance) {
		this.state = new Streaming(startingInstance || 0)
	}

	StreamState.prototype.add = function (fact) {
		var facts = this.state.add(fact)
		this.state = this.state.next
		return facts
	}

	function Streaming(previousInstance) {
		this.previousInstance = previousInstance
		this.next = this
	}

	var empty = []

	Streaming.prototype.add = function (fact) {
		if (this.previousInstance >= fact.instance) {
			// ignore repeat facts
			return empty
		}
		if (this.previousInstance + 1 === fact.instance) {
			this.previousInstance = fact.instance
			return [fact]
		}
		this.next = new Buffering(this.previousInstance, fact)
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

	function sameInstance(fact) {
		return function (other) { return other.instance === fact.instance }
	}

	Buffering.prototype.add = function (fact) {
		if (
				fact.instance <= this.previousInstance ||
				fact.instance === this.newestFact.instance ||
				this.gap.some(sameInstance(fact))
		) {
			// ignore repeat facts
			return empty
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
			this.gap.push(this.newestFact)
			this.gap.sort(compareInstance)
			this.next = new Streaming(this.newestFact.instance)
			return this.gap
		}
		return empty
	}

	return StreamState
}
