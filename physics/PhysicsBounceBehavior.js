import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsBounceBehavior extends PhysicsBehavior {
	constructor( target, minPoint, maxPoint, bounce, haptics){
		super(target, haptics);
		this.minPoint = minPoint;
		this.maxPoint = maxPoint;
		this.bounce = bounce || .5;
		this.priority = 3;
	}
	executeFrameWithDeltaTime(deltaTime, physicsObject) {
		this.applyLimits();

		let { minPoint, maxPoint, bounce, target } = this

		if (minPoint.x === target.getTranslationX() && physicsObject.velocity.x < 0.0) {
			physicsObject.velocity( 
				-physicsObject.velocity.x * bounce,
				physicsObject.velocity.y
			)
			doHaptic();
		}
		if (minPoint.y === target.getTranslationY() && physicsObject.velocity.y < 0.0) {
			physicsObject.velocity( 
				physicsObject.velocity.x,
				-physicsObject.velocity.y * bounce
			)
			doHaptic();
		}
		if (maxPoint.x === target.getTranslationX() && physicsObject.velocity.x > 0.0) {
			physicsObject.velocity( 
				-physicsObject.velocity.x * bounce,
				physicsObject.velocity.y
			)
			doHaptic();
		}
		if (maxPoint.y === target.getTranslationY() && physicsObject.velocity.y > 0.0) {
			physicsObject.velocity( 
				physicsObject.velocity.x,
				-physicsObject.velocity.y * bounce
			)
			doHaptic();
		}
	}

	applyLimits() {
		let {minPoint, maxPoint, target } = this
		if (minPoint.x > target.getTranslationX()) {
			target.setTranslationX(minPoint.x);
		}
		if (minPoint.y > target.getTranslationY()) {
			target.setTranslationY(minPoint.y);
		}
		if (maxPoint.x < target.getTranslationX()) {
			target.setTranslationX(maxPoint.x);
		}
		if (maxPoint.y < target.getTranslationY()) {
			target.setTranslationY(maxPoint.y);
		}
	}
}