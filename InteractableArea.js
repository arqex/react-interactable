export default class InteractableArea {
	constructor( top, left, bottom, right, bounce, haptics ){
		this.top = top || -Infinity
		this.left = left || -Infinity
		this.bottom = bottom || Infinity
		this.right = bottom || Infinity
		this.bounce = bounce
		this.haptics = haptics
	}

	pointInside( {x,y} ){
		if( cx < this.left || cx > this.right || cy < this.top || cy > this.bottom ){
			return false
		}
		return true
	}

	pointInsideWithOrigin( point, origin ){
		return this.pointInside({
			x: point.x - origin.x,
			y: point.y - origin.y
		})
	}
}