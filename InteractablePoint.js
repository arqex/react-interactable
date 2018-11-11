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

	distanceFromPoint( {x, y} ){
		if( this.x === Infinity && this.y === Infinity ) return Infinity
		let dx = this.x === Infinity ? this.x : Math.abs(x - this.x)
		let dy = this.y === Infinity ? this.x : Math.abs(y - this.y)
		
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
		array.forEach( point => {
			let curDist = point.distanceFromPoint(relativePoint);
			if (curDist < minDist) {
				minDist = curDist;
				closestPoint = point;
			}
		})
		return closestPoint
	}
}