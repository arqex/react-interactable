import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Animated, PanResponder } from 'react-native'

class InteractableView extends Component {
	constructor( props ){
		super( props )

		this.pan = new Animated.ValueXY();

		this._pr = this.createPanResponder( props )
	}

	static propTypes = {
		snapPoints: PropTypes.array,
		frictionAreas: PropTypes.array,
		horizontalOnly: PropTypes.bool,
		verticalOnly: PropTypes.bool,
		animatedValueX: PropTypes.instanceOf( Animated.Value ),
		animatedValueY: PropTypes.instanceOf( Animated.Value ),
		onSnap: PropTypes.func,
		onSnapStart: PropTypes.func,
		onEnd: PropTypes.func,
		onDrag: PropTypes.func,
	}

	static defaultProps = {
		snapPoints: [],
		frictionAreas: [],
		onSnap: function(){},
		onSnapStart: function(){},
		onEnd: function(){},
		onDrag: function(){},
	}

	render(){
		let {x,y} = this.getPan()
		let position = { transform: [
			{translateX: x}, {translateY: y}
		]}
		
		return (
			<Animated.View style={ position } {...this._pr.panHandlers }>
				{ this.props.children }
			</Animated.View>
		)
	}

	createPanResponder( props ){
		let {x,y} = this.getPan()

		let eventPan = {dx: x, dy: y};
		if(props.horizontalOnly){
			delete eventPan.dy
		}
		if(props.verticalOnly){
			delete eventPan.dx
		}

		let applyFriction 
		let pan
		
		return PanResponder.create({
			onMoveShouldSetResponderCapture: () => true,
			onMoveShouldSetPanResponderCapture: () => true,
	
			onPanResponderGrant: (e, gestureState) => {
				pan = this.getPan()

				let offset = {x: pan.x._value, y: pan.y._value}
				applyFriction = combineAreaFactors( props.frictionAreas, offset );

				pan.setOffset( offset );
				pan.setValue({x: 0, y: 0});
				
				this.props.onDrag({ state: 'start', x: pan.x._value, y: pan.y._value })
			},
	
			onPanResponderMove: function( evt, {dx, dy}){
				pan.setValue( applyFriction({x: dx, y: dy}) )
			},
	
			onPanResponderRelease: (e, {vx, vy}) => {

				let pan = this.getPan()

				// Flatten the offset to avoid erratic behavior
				pan.flattenOffset();

				let endDragEvent = { state: 'end', x: pan.x._value, y: pan.y._value }

				if( this.props.snapPoints ){
					let {horizontalOnly, verticalOnly} = this.props
					let calculateX = verticalOnly ? 0 : 1
					let calculateY = horizontalOnly ? 0 : 1
					let closest = this.getClosestPoint( pan.x._value, pan.y._value, calculateX, calculateY )
					let snapPoint = closest.point
					
					endDragEvent.targetSnapPointId = snapPoint.id
					this.props.onSnapStart( {index: closest.index, id: snapPoint.id} )

					Animated.spring( pan, {
						toValue: snapPoint,
						velocity: {x: vx, y: vy},
						tension: 40,
						friction: 7
					}).start( () => {
						this.props.onSnap( {index: closest.index, id: snapPoint.id} );
						this.props.onStop( {x: pan.x._value, y: pan.y._value} )
					})
				}
				else {

				}
				
				this.props.onDrag( endDragEvent )
			}
		})
	}

	getClosestPoint( x, y, calculateX, calculateY ){
		let snaps = this.props.snapPoints
		let i = snaps.length - 1 
		let point = snaps[i]
		let index = i
		let distance = this.calculatePointDistance( x, y, point, calculateX, calculateY )

		while( i-- > 0 ){
			let d = this.calculatePointDistance(x, y, snaps[i], calculateX, calculateY)
			if( d < distance ){
				distance = d
				point = snaps[i]
				index = i
			}
		}
		
		return { point, index }
	}

	calculatePointDistance( x0, y0, {x,y}, calculateX, calculateY){
		return Math.pow(x0 - (x || 0), 2) * calculateX + Math.pow(y0 - (y || 0 ), 2) * calculateY
	}

	getPan(){
		let pan = new Animated.ValueXY
		pan.x = this.props.animatedValueX || this.pan.x
		pan.y = this.props.animatedValueY || this.pan.y
		return pan
	}
}

let combineAreaFactors = function( areas, offset ){
	let combined = [];
	areas.forEach( a => combined.push( getAreaFactor(a, offset) ) )
	return function( coords ){
		let result = { ...coords }
		combined.forEach( c => {
			result = c( result )
		})
		return result;
	}
}

let offsetKeys = {
	top: 'y', right: 'x', bottom: 'y', left: 'x'
}

let getAreaFactor = function( area, offset ){
	let comparators = [];
	for( let key in area.influenceArea ){
		comparators.push(
			areaFrictionFunctions[key]( area.influenceArea[key] - offset[ offsetKeys[key] ], area.damping )
		)
	}

	return function( coords ){
		let result = coords;
		comparators.forEach( c => {
			result = c( result )
		})
		return result;
	}
}

const areaFrictionFunctions = {
	top: function( value, friction ){ 
		let calculator = areaFrictionCalculators.negative( value, friction )

		return function( coords ){
			return {
				x: coords.x,
				y: coords.y * calculator( coords.y )
			}
		}
	},
	right: function( value, friction ){ 
		let calculator = areaFrictionCalculators.positive( value, friction )

		return function( coords ){
			return {
				x: coords.x * calculator( coords.x ),
				y: coords.y
			}
		}
	},
	bottom: function( value, friction ){ 
		let calculator = areaFrictionCalculators.positive( value, friction )

		return function( coords ){
			return {
				x: coords.x,
				y: coords.y * calculator( coords.y )
			}
		}
	},
	left: function( value, friction ){ 
		let calculator = areaFrictionCalculators.negative( value, friction )

		return function( coords ){
			return {
				x: coords.x * calculator( coords.x ),
				y: coords.y
			}
		}
	},
}

const areaFrictionCalculators = {
	// top, left
	negative: (value, friction) => {
		return function( position ){
			let factors = calculateFrictionFactors( position, value )
			return (1-friction)*factors[0] + factors[1]
		}
	},
	// right, bottom
	positive: (value, friction) => {
		return function( position ){
			let factors = calculateFrictionFactors( position, value )
			return factors[0] + (1-friction)*factors[1]
		}
	}
}

// The idea is: when we cross a limit the friction starts
// This return an array with 2 values [proportionBeforeLimit, proportionAfterLimit]
function calculateFrictionFactors( coord, limit ){
	let init = 0 - limit
	let end = coord - limit
	if( end <= 0 ){
		return [1, 0]
	}
	else if( init >= 0 ){
		return [0, 1]
	}

	init = init * -1
	let total = init + end
	return [ init/total, end/total]
}

export default {View: InteractableView}