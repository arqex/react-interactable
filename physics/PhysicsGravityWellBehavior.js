import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsGravityWell extends PhysicsBehavior {
	strength = 400
	falloff = 40

	setStrength(strength) {
		this.strength = strength;
	}

	setFalloff(falloff) {
		this.falloff = falloff;
	}

	executeFrameWithDeltaTime(deltaTime, physicsObject) {
		if ( !this.isWithinInfluence()) return;

		let { target, anchorPoint, falloff, strength } = this;
		
		let dx = target.getTranslationX() - anchorPoint.x;
		let dy = target.getTranslationY() - anchorPoint.y;

		let dr = Math.sqrt(dx * dx + dy * dy);
		if (!dr) return;

		let a = (-strength * dr * Math.exp(-0.5 * (dr * dr) / (falloff * falloff))) / physicsObject.mass;

		let ax = dx / dr * a;
		let ay = dy / dr * a;
		
		physicsObject.vx += deltaTime * ax,
		physicsObject.vy += deltaTime * ay
	}
}