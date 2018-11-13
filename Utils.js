export default {
	createArea: function( boundaries ){
		return {
			minPoint: {
				x: boundaries.left || -Infinity,
				y: boundaries.top || -Infinity
			},
			maxPoint: {
				x: boundaries.right || Infinity,
				y: boundaries.bottom || Infinity
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
		if( !this.area ) return true

		let { minPoint, maxPoint } = area

		return x>=minPoint.x && x <= maxPoint.x && y >= minPoint.y && y <= maxPoint.y
	},
	findClosest: function( origin, points ){
		let minDistance = Infinity;
		let closestPoint = null;
		points.forEach( point => {
			let distance = this.getDistance( point, origin );
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = point;
			}
		})
		return closestPoint
	},
	getDistance( point, {x,y} ){
		if( point.x === Infinity && point.y === Infinity ) return Infinity
		let dx = point.x === Infinity ? point.x : Math.abs(x - point.x)
		let dy = point.y === Infinity ? point.x : Math.abs(y - point.y)
		
		return Math.sqrt( dx*dx + dy*dy )
	},
	getDelta( point, origin ){
		return {
			x: point.x - origin.x,
			y: point.y - origin.y
		}
	}
}