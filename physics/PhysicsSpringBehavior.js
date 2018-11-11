import PhysicsBehavior from "./PhysicsBehavior";

export default class PhysicsSpringBehavior extends PhysicsBehavior {
	tension = 300

	executeFrameWithDeltaTime(deltaTime, physicsObject) {
		if (!this.isWithinInfluence()) return;
		
		let { target, anchorPoint, tension } = this

		let dx = target.getTranslationX() - anchorPoint.x;
		let ax = (-tension * dx) / physicsObject.mass;

		let dy = target.getTranslationY() - anchorPoint.y;
		let ay = (-tension * dy) / physicsObject.mass;

		let {vx,vy} = physicsObject
		physicsObject.vx = vx + deltaTime * ax
		physicsObject.vy = vy + deltaTime * ay
	}
}