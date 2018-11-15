import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Animator from './Animator'
import Utils from './Utils';

const propBehaviors = {
	frictionAreas: 'friction',
	gravityPoints: 'gravity',
	springPoints: 'spring',
}

export default function injectDependencies( Animated, PanResponder ){

	return class InteractableView extends Component {
		static propTypes = {
			snapPoints: PropTypes.array,
			frictionAreas: PropTypes.array,
			alertAreas: PropTypes.array,
			gravityPoints: PropTypes.array,
			horizontalOnly: PropTypes.bool,
			verticalOnly: PropTypes.bool,
			dragWithSpring: PropTypes.objet,
			dragEnabled: PropTypes.bool,
			animatedValueX: PropTypes.instanceOf(Animated.Value),
			animatedValueY: PropTypes.instanceOf(Animated.Value),
			onSnap: PropTypes.func,
			onSnapStart: PropTypes.func,
			onEnd: PropTypes.func,
			onDrag: PropTypes.func,
			boundaries: PropTypes.object,
			initialPosition: PropTypes.object,
			dragToss: PropTypes.number
		}

		static defaultProps = {
			snapPoints: [],
			frictionAreas: [],
			alertAreas: [],
			gravityPoints: [],
			boundaries: {},
			initialPosition: {x: 0, y: 0},
			dragToss: .1,
			dragWithSpring: false,
			dragEnabled: true,
			onSnap: function () { },
			onSnapStart: function () { },
			onStop: function () { },
			onDrag: function () { },
			onAlert: function () { },
		}

		initialPositionSet = false
		isDragging = false

		constructor(props) {
			super(props)

			// In case animatedValueXY is not given
			this.animated = new Animated.ValueXY(0,0)

			// This guy will apply all the physics
			this.animator = this.createAnimator( props )

			// Cache when the view is inside of an alert area
			this.insideAlertAreas = {}

			// cache calculated areas
			this.propAreas = {
				alert: [],
				boundaries: false
			}

			this._pr = this.createPanResponder(props)
			
			// Set behaviors and prop defaults
			this.setPropBehaviours( {}, props )

			// Set initial position
			let {x,y} = this.getAnimated( props )
			x.setValue( props.initialPosition.x )
			y.setValue( props.initialPosition.y )
			
			// Save the last animation end position to report good coordinates in the events
			this.lastEnd = {...this.initialPosition}
		}

		render() {
			let { x, y } = this.getAnimated()
	
			let position = {
				transform: [
					{ translateX: x }, { translateY: y }
				]
			}

			let panHandlers = this.props.dragEnabled ? this._pr.panHandlers : {}

			return (
				<Animated.View style={position} {...panHandlers}>
					{this.props.children}
				</Animated.View>
			)
		}

		getTranslation(){
			let {x, y} = this.getAnimated()
			return {
				x: x._value + x._offset,
				y: y._value + y._offset
			}
		}

		setTranslationX( tx ){
			let animated = this.props.animatedValueX || this.animated.x
			animated.setValue( tx - animated._offset )
		}

		setTranslationY(ty) {
			let animated = this.props.animatedValueY || this.animated.y
			animated.setValue( ty - animated._offset )
		}

		setTranslation( tx, ty ){
			this.setTranslationX( tx )
			this.setTranslationY( ty )
		}

		createAnimator(){
			return new Animator( this, {
				onAnimatorPause: () => {
					let { x, y } = this.getTranslation()
					this.lastEnd = {x: Math.round(x), y: Math.round(y)}
					this.props.onStop( this.lastEnd )
				},
				onAnimationFrame: () => {
					this.reportAlertEvent( this.getTranslation() )
				}
			})
		}

		animate( dx, dy ){
			if(!dx && !dy) return
			let animated = this.getAnimated()
			console.log( dx + animated.x._value + animated.x._offset )

			let {x,y}  = this.getTranslation()
			this.setTranslation( x + dx, y + dy ) 
		}

		getAnimated( props ){
			let { animatedValueX, animatedValueY } = (props || this.props)

			return {
				x: animatedValueX || this.animated.x ,
				y: animatedValueY || this.animated.y
			}
		}

		createPanResponder() {
			return PanResponder.create({
				onMoveShouldSetResponderCapture: () => true,
				onMoveShouldSetPanResponderCapture: () => true,

				onPanResponderGrant: (e, {x0, y0}) => {	
					this.startDrag( {x: x0, y: y0} )
				},

				onPanResponderMove: (evt, gesture ) => {
					this.onDragging( gesture )
				},

				onPanResponderRelease: () => {
					this.endDrag()
				}
			})
		}

		reportAlertEvent( position ){
			let inside = this.insideAlertAreas
			let { onAlert } = this.props

			this.propAreas.alert.forEach( ({ influence, id }) => {
				if ( !influence || !id ) return;

				if ( Utils.isPointInArea( position, influence ) ) {
					if ( !inside[id] ) {
						onAlert({id, value:"enter"});
						inside[id] = 1;
					}
				} else if (inside[id]) {
					onAlert({ id, value: "leave" });
					inside[id] = 0;
				}
			})
		}

		startDrag( ev ){
			// Prepare the animated
			let {x,y} = this.getAnimated()
			let offset = {x: x._value, y: y._value}
			x.setOffset( offset.x )
			y.setOffset( offset.y )
			x.setValue( 0 )
			y.setValue( 0 )

			// Save the offset for triggering events with the right coordinates
			this.lastEnd = offset
			console.log( offset )

			// Set relative boundaries to not to drag after them
			if( this.propAreas.boundaries ){
				let {minPoint, maxPoint} = this.propAreas.boundaries.influence
				this.dragBoundaries = {
					minPoint: { x: minPoint.x - offset.x, y: minPoint.y - offset.y },
					maxPoint: { x: maxPoint.x - offset.x, y: maxPoint.y - offset.y }
				}
			}
			else {
				this.dragBoundaries = {}
			}

			// Prepare the animation
			let pos = {x: 0, y: 0}
			this.props.onDrag({state: 'start', x: offset.x, y: offset.y})
			this.dragStartLocation = { x: ev.x, y: ev.y }
			this.animator.removeTempBehaviors();
			this.animator.isDragging = true
			this.animator.vx = 0
			this.animator.vy = 0
			this.addTempDragBehavior( this.props.dragWithSpring );

			// Stop text selection
			if (document) {
				let styles = document.body.style
				this.userSelectCache = styles.userSelect
				styles.userSelect = "none"
			}
		}

		onDragging({dx, dy}){
			let animated = this.getAnimated()
			let x = dx + animated.x._offset
			let y = dy + animated.y._offset

			let {minPoint, maxPoint} = this.dragBoundaries
			if( !this.props.verticalOnly ){
				if (minPoint) {
					if (minPoint.x > x) x = minPoint.x
					if (maxPoint.x < x) x = maxPoint.x
				}
				this.dragBehavior.x0 = x
			}

			if (!this.props.horizontalOnly) {
				if (minPoint) {
					if (minPoint.y > y) y = minPoint.y
					if (maxPoint.y < y) y = maxPoint.y
				}
				this.dragBehavior.y0 = y
			}

			console.log( this.dragBehavior )
		}

		endDrag(){
			this.animator.removeTempBehaviors();
			this.dragBehavior = null;
			this.animator.isDragging = false

			let { animator, horizontalOnly, verticalOnly, dragWithSprings, boundaies } = this


			let velocity = animator.getVelocity();
			if (horizontalOnly) velocity.y = 0;
			if (verticalOnly) velocity.x = 0;
			
			let toss = dragWithSprings && dragWithSprings.toss || this.props.dragToss;
			let {x,y} = this.getTranslation()
			let projectedCenter = {
				x: x + toss * velocity.x,
				y: y + toss * velocity.y
			};

			console.log( 'pc', projectedCenter, velocity)
			let snapPoint = Utils.findClosest(projectedCenter, this.props.snapPoints);
			let targetSnapPointId = snapPoint && snapPoint.id || "";

			this.props.onDrag({ state: 'end', x: x, y: y, targetSnapPointId })

			this.addTempSnapToPointBehavior(snapPoint);
			this.addTempBoundaries();

			let animated = this.getAnimated()
			animated.x.flattenOffset()
			animated.y.flattenOffset()

			// Restore text selection
			if (document) {
				document.body.userSelect = this.userSelectCache || ''
			}
		}

		addTempDragBehavior( drag ) {
			let pos = this.getTranslation()

			if ( !drag || drag.tension === Infinity ) {
				this.dragBehavior = this.animator.addBehavior( 'anchor', pos, true )
			}
			else {
				pos.tension = drag.tension || 300
				this.dragBehavior = this.animator.addBehavior( 'spring', pos, true )
				if( drag.damping ){
					this.animator.addBehavior('friction', drag, true)
				}
			}
		}

		addTempSnapToPointBehavior( snapPoint ) {
			if (!snapPoint)  return;
			let { snapPoints, onSnap, onSnapStart } = this.props

			let index = snapPoints.indexOf(snapPoint)

			onSnap({index, id: snapPoint.id});
			onSnapStart({index, id: snapPoint.id});

			let springOptions = {
				damping: .7,
				tension: 300,
				...snapPoint
			}

			this.addBehavior( 'spring', springOptions, true )
		}

		setDragEnabled( dragEnabled ) {
			this.dragEnabled = dragEnabled;

			if (this.dragBehavior && !dragEnabled) {
				this.endDrag();
			}
		}

		setInitialPosition( initialPosition ) {
			this.initialPosition = initialPosition;
			this.setTranslation( initialPosition )
		}

		setVelocity( velocity ) {
			if ( this.dragBehavior ) return;
			this.animator.vx = velocity.x
			this.animator.vy = velocity.y
			this.endDrag();
		}

		snapTo( index ) {
			let {snapPoints} = this.props;

			if( !snapPoints || !index || index >= snapPoints.length ) return;
			
			this.animator.removeTempBehaviors();
			this.dragBehavior = null;
			let snapPoint = snapPoints[index]

			this.addTempSnapToPointBehavior(snapPoint);
			this.addTempBoundaries();
		}

		addTempBoundaries(){
			let boundaries = this.propAreas.boundaries;
			if( !boundaries ) return;
			this.animator.addBehavior( 'bounce', boundaries, true );
		}

		changePosition( position ) {
			if ( this.dragBehavior ) return;

			this.setTranslation( position )
			this.endDrag();
		}

		componentDidUpdate( prevProps ){
			this.setPropBehaviours( prevProps, this.props )
		}

		setPropBehaviours( prevProps, props ){
			// spring, gravity, friction
			Object.keys( propBehaviors ).forEach( prop => {
				if( prevProps[ prop ] !== props[ prop ] ){
					this.animator.removeTypeBehaviors(propBehaviors[prop])
					this.addTypeBehaviors( propBehaviors[prop], props[ prop ] )
				}
			})

			if( prevProps.alertAreas !== props.alertAreas ){
				let alertAreas = []
				props.alertAreas.forEach( area => {
					alertAreas.push({
						id: area.id,
						influence: Utils.createArea( area.influenceArea )
					})
				})
				this.propAreas.alert = alertAreas
			}

			if( prevProps.boundaries !== props.boundaries ){
				this.animator.removeBehavior( this.oldBoundariesBehavior )
				if( props.boundaries ){
					let bounce = {
						bounce: props.boundaries.bounce || 0,
						influence: Utils.createArea( props.boundaries )
					}
					this.propAreas.boundaries = bounce
					this.oldBoundariesBehavior = this.animator.addBehavior( 'bounce', bounce )
				}
				else {
					this.propAreas.boundaries = false
				}
			}
		}

		addTypeBehaviors( type, behaviors, isTemp ){
			behaviors.forEach( b => this.addBehavior( type, b, isTemp )	)
		}

		addBehavior( type, behavior, isTemp ){
			this.animator.addBehavior( type, behavior, isTemp )
			if( behavior.damping && type !== 'friction' ){
				this.animator.addBehavior('friction', behavior, isTemp )
			}
		}
	}
}
