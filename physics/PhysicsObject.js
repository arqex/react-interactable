export default class PhysicsObject {
	constructor(velocity, mass){
		this.velocity = velocity || {x: 0, y: 0}
		this.mass = mass || 1
	}
}