import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsAnchorBehavior extends PhysicsBehavior {
	executeFrameWithDeltaTime( deltaTime, physicsObject ) {
		if (!deltaTime) return;

		let dx = this.anchorPoint.x - this.target.getTranslationX();
		let dy = this.anchorPoint.y - this.target.getTranslationY();

		physicsObject.velocity = {
			x: dx / deltaTime,
			y: dy / deltaTime
		};
	}
}