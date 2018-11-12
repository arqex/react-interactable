import InteractableArea from './InteractableArea'
import { array } from 'prop-types';
export default class IntractablePoint {
	constructor( id, x, y, damping, tension, strength, falloff, influenceArea ){
		this.id = id;
		this.x = x || Infinity;
		this.y = y || Infinity;
		this.damping = damping;
		this.tension = tension;
		this.influenceArea = influenceArea && new InteractableArea(influenceArea);
		this.strength = strength;
		this.falloff = falloff;
	}

	positionWithOrigin(){
		return { x: this.x, y: this.y }
	}

	distanceFromPoint( point ){
		return IntractablePoint.distanceFromPointRelative( this, point )
	}

	static distanceFromPointRelative( point, {x,y} ){
		if( point.x === Infinity && point.y === Infinity ) return Infinity
		let dx = point.x === Infinity ? point.x : Math.abs(x - point.x)
		let dy = point.y === Infinity ? point.x : Math.abs(y - point.y)
		
		return Math.sqrt( dx*dx + dy*dy )
	}

	static deltaBetweenPointAndOrigin( point, origin ) {
		return {
			x: point.x - origin.x,
			y: point.y - origin.y
		}
	}

	static findClosestPoint( pointArray, relativePoint ) {
		let minDist = Infinity;
		let closestPoint = null;
		pointArray.forEach( point => {
			let curDist = IntractablePoint.distanceFromPointRelative( point, relativePoint );
			if (curDist < minDist) {
				minDist = curDist;
				closestPoint = point;
			}
		})
		return closestPoint
	}
}