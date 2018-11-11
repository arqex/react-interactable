import PhysicsBehavior from './PhysicsBehavior'

export default class PhysicsFrictionBehavior extends PhysicsBehavior {
	priority = 2

	constructor( target, friction ){
		super( target, false )
		this.friction = friction
	}

	executeFrameWithDeltaTime(deltaTime, physicsObject) {
		if ( !this.isWithinInfluence() ) return;

		let {vx, vy} = physicsObject
		let pow = Math.pow(this.friction, 60.0 * deltaTime)
		physicsObject.vx = pow * vx
		physicsObject.vy = pow * vy
	}
}