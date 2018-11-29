import Utils from './Utils'

function def( value, defaultValue ){
	return value === undefined ? defaultValue : value
}

export default {
	anchor: {
		create: (options, isTemp = false) => (
			{ x0: options.x, y0: options.y, priority: 1, isTemp, type: 'anchor' }
		),
		doFrame: (options, deltaTime, state, coords ) => {
			// Velocity = dx / deltaTime
			state.vx = (options.x0 - coords.x) / deltaTime
			state.vy = (options.y0 - coords.y) / deltaTime
		}
	},

	bounce: {
		create: (options, isTemp = false) => ({
			type: 'bounce',
			bounce: def(options.bounce, .5),
			minPoint: options.influence.minPoint,
			maxPoint: options.influence.maxPoint,
			priority: 3,
			isTemp
		}),
		doFrame: ({minPoint, maxPoint, bounce}, deltaTime, state, {x,y}, target ) => {
			// Apply limits

			if (minPoint.x > x) target.setTranslationX(minPoint.x);
			if (minPoint.y > y) target.setTranslationY(minPoint.y);
			if (maxPoint.x < x) target.setTranslationX(maxPoint.x);
			if (maxPoint.y < y) target.setTranslationY(maxPoint.y);

			let { vx, vy } = state

			if (minPoint.x > x && vx < 0) {
				state.vx = -vx * bounce
			}
			if (minPoint.y > y && vy < 0) {
				state.vy= -vy * bounce
			}
			if (maxPoint.x < x && vx > 0) {
				state.vx = -vx * bounce
			}
			if (maxPoint.y < y && vy > 0) {
				state.vy = -vy * bounce
			}
		}
	},

	friction: {
		create: ( options, isTemp = false ) => ({
			type: 'friction',
			damping: def(options.damping, .7),
			influence: Utils.createArea( options.influenceArea || {} ),
			priority: 2,
			isTemp
		}),
		doFrame: (options, deltaTime, state, coords) => {
			if( !Utils.isPointInArea( coords, options.influence) ) return;
			
			let pow = Math.pow(options.damping, 60.0 * deltaTime)
			state.vx = pow * state.vx
			state.vy = pow * state.vy
		}
	},

	gravity: {
		create: ( options, isTemp = false ) => ({
			type: 'gravity',
			x0: def(options.x, Infinity),
			y0: def(options.y, Infinity),
			strength: def(options.strength, 400),
			falloff: def(options.falloff, 40),
			damping: def(options.damping, 0),
			influence: Utils.createArea(options.influenceArea || {}),
			isTemp,
			priority: 1
		}),
		doFrame: (options, deltaTime, state, coords) => {
			if( !Utils.isPointInArea( coords, options.influence) ) return;

			let dx = options.x0 !== Infinity ? coords.x - options.x0 : 0;
			let dy = options.y0 !== Infinity ? coords.y - options.y0 : 0;
			let dr = Math.sqrt(dx * dx + dy * dy);

			if (!dr) return;

			let { falloff, strength } = options
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
			x0: def(options.x, 0),
			y0: def(options.y, 0),
			tension: def(options.tension, 300),
			influence: Utils.createArea( options.influenceArea || {} ),
			isTemp,
			priority: 1
		}),
		doFrame: ( options, deltaTime, state, coords) => {
			if( !Utils.isPointInArea( coords, options.influence) ) return;
	
			let dx = coords.x - options.x0;
			if( dx ){
				// time * acceleration
				state.vx += deltaTime * ((-1 * options.tension * dx) / state.mass)
			}
	
			let dy = coords.y - options.y0;
			if( dy ){
				// time * acceleration
				state.vy += deltaTime * ((-1 * options.tension * dy) / state.mass)
			}
		}
	}
}