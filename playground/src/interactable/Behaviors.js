import Utils from './Utils'

export default {
	anchor: {
		create: (options, isTemp = false) => (
			{ x: options.x, y: options.y, priority: 1, isTemp, type: 'anchor' }
		),
		doFrame: (options, deltaTime, state, target ) => {
			let {x,y} = target.getTranslation()

			// Velocity = dx / deltaTime
			state.vx = (options.x - x) / deltaTime
			state.vy = (options.y - y) / deltaTime
		}
	},

	bounce: {
		create: (options, isTemp = false) => ({
			type: 'bounce',
			bounce: options.bounce || .5,
			minPoint: options.influence.minPoint,
			maxPoint: options.influence.maxPoint,
			priority: 3,
			isTemp
		}),
		doFrame: ({minPoint, maxPoint, bounce}, deltaTime, state, target ) => {
			let {x,y} = target.getTranslation()
			
			// Apply limits
			if (minPoint.x > x) target.setTranslationX(minPoint.x);
			if (minPoint.y > y) target.setTranslationY(minPoint.y);
			if (maxPoint.x < x) target.setTranslationX(maxPoint.x);
			if (maxPoint.y < y) target.setTranslationY(maxPoint.y);

			let { vx, vy } = state

			if (minPoint.x >= x && vx < 0) {
				state.vx = -vx * bounce
			}
			if (minPoint.y >= y && vy < 0) {
				state.vy= -vy * bounce
			}
			if (maxPoint.x <= x && vx > 0) {
				state.vx = -vx * bounce
			}
			if (maxPoint.y <= y && vy > 0) {
				state.vy = -vy * bounce
			}
		}
	},

	friction: {
		create: ( options, isTemp = false ) => ({
			type: 'friction',
			damping: options.damping || .7,
			influence: Utils.createArea( options.influenceArea || {} ),
			priority: 2,
			isTemp
		}),
		doFrame: (options, deltaTime, state, target) => {
			let pos = target.getTranslation()
			if( !Utils.isPointInArea( pos, options.influence) ) return;
			
			let pow = Math.pow(options.damping, 60.0 * deltaTime)
			state.vx = pow * state.vx
			state.vy = pow * state.vy
		}
	},

	gravity: {
		create: ( options, isTemp = false ) => ({
			type: 'gravity',
			x: options.x || Infinity,
			y: options.y || Infinity,
			strength: options.strength || 400,
			falloff: options.falloff || 40,
			damping: options.damping || 0,
			influence: options.damping ? Utils.createAreaFromRadius( 1.4 * options.falloff || 40, options ) : Utils.createArea( options.influenceArea || {} ),
			isTemp,
			priority: 1
		}),
		doFrame: (options, deltaTime, state, target) => {
			let pos = target.getTranslation()

			if( !Utils.isPointInArea( pos, options.influence) ) return;
			let {x, y, falloff, strength} = options
			let dx = pos.x - x;
			let dy = pos.y - y;
			
			let dr = Math.sqrt(dx * dx + dy * dy);
			if (!dr) return;

			let a = (-strength * dr * Math.exp(-0.5 * (dr * dr) / (falloff * falloff))) / state.mass;
			let ax = dx / dr * a;
			let ay = dy / dr * a;
			
			state.vx += deltaTime * ax
			state.vy += deltaTime * ay
		}
	},

	spring: {
		create: ( options, isTemp = false ) => ({
			type: 'spring',
			x: options.x || 0,
			y: options.y || 0,
			tension: options.tension || 300,
			influence: Utils.createArea( options.influenceArea || {} ),
			isTemp,
			priority: 1
		}),
		doFrame: ( options, deltaTime, state, target) => {
			let pos = target.getTranslation()
			if( !Utils.isPointInArea( pos, options.influence) ) return;

			let {x,y,tension} = options
	
			let dx = pos.x - x;
			let ax = (-tension * dx) / state.mass;
	
			let dy = pos.y - y;
			let ay = (-tension * dy) / state.mass;
			
			state.vx = state.vx + deltaTime * ax
			state.vy = state.vy + deltaTime * ay
		}
	}
}