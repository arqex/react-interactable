export default class PhysicsBehavior {
	static DURATION_BETWEEN_HAPTICS = 500

	influence = false
	isTemp = false
	haptics = false
	lastIsWithinInfluenceInitialized = false
	lastIsWithinInfluence = false
	priority = 1

	constructor( target, anchorPoint ){
		this.target = target
		this.anchorPoint = anchorPoint
	}

	isWithinInfluence() {
		if( !this.influence ) return true

		let res = true
		let target = this.target
		let { minPoint, maxPoint } = this.influence

		if (target.getTranslationX() < minPoint.x) res = false;
		if (target.getTranslationX() > maxPoint.x) res = false;

		if (target.getTranslationY() < minPoint.y) res = false;
		if (target.getTranslationY() > maxPoint.y) res = false;

		if ( this.haptics && this.lastIsWithinInfluenceInitialized) {
			if (res != this.lastIsWithinInfluence) {
				doHaptic();
			}
			this.lastIsWithinInfluenceInitialized = true;
			this.lastIsWithinInfluence = res;
		}
		return res;
	}

	doHaptic() {
		let time = Date.now()
		if (time - lastHapticsAction > DURATION_BETWEEN_HAPTICS) {
			// Vibrate here
			lastHapticsAction = time;
		}
	}

}