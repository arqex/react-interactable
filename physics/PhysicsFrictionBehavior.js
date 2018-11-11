import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsFrictionBehavior extends PhysicsBehavior {
	priority = 2

	constructor( target, friction ){
		super( target, false )
		this.friction = friction
	}

	executeFrameWithDeltaTime(deltaTime, physicsObject) {
		if ( !this.sWithinInfluence() ) return;

		physicsObject.velocity = {
			x: Math.pow(this.friction, 60.0 * deltaTime) * physicsObject.velocity.x,
			y: Math.pow(this.friction, 60.0 * deltaTime) * physicsObject.velocity.y
		}
	}
}