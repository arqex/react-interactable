import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsAnchorBehavior extends PhysicsBehavior {
	executeFrameWithDeltaTime( deltaTime, physicsObject ) {
		if (!deltaTime) return;

		let {x,y} = this.target.getTranslation()

		// Velocity = dx / deltaTime
		physicsObject.vx = (this.anchorPoint.x - x) / deltaTime
		physicsObject.vy = (this.anchorPoint.y - y) / deltaTime
	}
}