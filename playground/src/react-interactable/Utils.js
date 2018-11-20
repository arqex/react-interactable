export default {
	createArea: function( boundaries ){
		return {
			minPoint: {
				x: boundaries.left === undefined ? -Infinity : boundaries.left,
				y: boundaries.top === undefined ? -Infinity : boundaries.top
			},
			maxPoint: {
				x: boundaries.right === undefined ? Infinity : boundaries.right,
				y: boundaries.bottom === undefined ? Infinity : boundaries.bottom
			}
		}
	},
	createAreaFromRadius: function( radius, anchor ){
		return {
			minPoint: {x: anchor.x - radius, y: anchor.y - radius},
			maxPoint: {x: anchor.x + radius, y: anchor.y + radius}
		}
	},
	isPointInArea: function( {x, y}, area ){
		if( !area ) return true

		let { minPoint, maxPoint } = area

		return x>=minPoint.x && x <= maxPoint.x && y >= minPoint.y && y <= maxPoint.y
	},
	findClosest: function( origin, points ){
		let minDistance = Infinity;
		let closestPoint = null;
		let distances = []
		points.forEach( point => {
			let distance = this.getDistance( point, origin );
			distances.push( distance )
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		})
		// console.log( distances )
		return closestPoint
	},
	getDistance( point, relative ){
		let p = {x: point.x === undefined ? Infinity : point.x, y: point.y === undefined ? Infinity : point.y }
		let r = {x: relative.x === undefined ? Infinity : relative.x, y: relative.y === undefined ? Infinity : relative.y }
		if( p.x === Infinity && p.y === Infinity ) return Infinity
		let dx = p.x === Infinity ? 0 : Math.abs(r.x - p.x)
		let dy = p.y === Infinity ? 0 : Math.abs(r.y - p.y)
		
		return Math.sqrt( dx*dx + dy*dy )
	},
	getDelta( point, origin ){
		return {
			x: point.x - origin.x,
			y: point.y - origin.y
		}
	}
}