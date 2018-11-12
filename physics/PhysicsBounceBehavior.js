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
		let { x, y } = target.getTranslation()
		let { vx, vy } = physicsObject

		if (minPoint.x === x && vx < 0) {
			physicsObject.vx = -vx * bounce
			doHaptic();
		}
		if (minPoint.y === y && vy < 0) {
			physicsObject.vy= -vy * bounce
			doHaptic();
		}
		if (maxPoint.x === x && vx > 0) {
			physicsObject.vx = -vx * bounce
			doHaptic();
		}
		if (maxPoint.y === y && vy > 0) {
			physicsObject.vy = -vy * bounce
			doHaptic();
		}
	}

	applyLimits() {
		let {minPoint, maxPoint, target } = this
		let {x,y} = target.getTranslation()

		if (minPoint.x > x) target.setTranslationX(minPoint.x);
		if (minPoint.y > y) target.setTranslationY(minPoint.y);
		if (maxPoint.x < x) target.setTranslationX(maxPoint.x);
		if (maxPoint.y < y) target.setTranslationY(maxPoint.y);
	}
}