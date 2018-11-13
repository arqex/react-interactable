import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InteractablePoint from './InteractablePoint'
import PhysicsAnimator from './physics/PhysicsAnimator'
import PhysicsAnchorBehavior from './physics/PhysicsAnchorBehavior'
import PhysicsBounceBehavior from './physics/PhysicsBounceBehavior'
import PhysicsFrictionBehavior from './physics/PhysicsFrictionBehavior'
import PhysicsGravityWellBehavior from './physics/PhysicsGravityWellBehavior'
import PhysicsSpringBehavior from './physics/PhysicsSpringBehavior'

export default function injectDependencies( Animated, PanResponder ){

	return class InteractableView extends Component {
		static propTypes = {
			snapPoints: PropTypes.array,
			frictionAreas: PropTypes.array,
			alertAreas: PropTypes.array,
			horizontalOnly: PropTypes.bool,
			verticalOnly: PropTypes.bool,
			dragWithSprings: PropTypes.bool,
			dragEnabled: PropTypes.bool,
			animatedValueX: PropTypes.instanceOf(Animated.Value),
			animatedValueY: PropTypes.instanceOf(Animated.Value),
			onSnap: PropTypes.func,
			onSnapStart: PropTypes.func,
			onEnd: PropTypes.func,
			onDrag: PropTypes.func,
			boundaries: PropTypes.object,
			dragToss: PropTypes.number
		}

		static defaultProps = {
			snapPoints: [],
			frictionAreas: [],
			alertAreas: [],
			boundaries: {},
			dragToss: .1,
			dragWithSprings: false,
			dragEnabled: true,
			onSnap: function () { },
			onSnapStart: function () { },
			onStop: function () { },
			onDrag: function () { },
			onAlert: function () { },
		}

		initialPositionSet = false

		constructor(props) {
			super(props)

			// In case animatedValueXY is not given
			this.animated = new Animated.ValueXY(0,0)

			// This guy will apply all the physics
			this.animator = this.createAnimator( props )

			// Cache when the view is inside of an alert area
			this.insideAlertAreas = {}

			// Save the last animation end position to report good coordinates in the events
			this.lastEnd = {x: 0, y: 0}

			this._pr = this.createPanResponder(props)
			
			this.setPropBehaviours( {}, props )
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
			let animated = this.getAnimated()
			return {
				x: animated.x._value,
				y: animated.y._value
			}
		}

		setTranslationX( tx ){
			( this.props.animatedValueX || this.animated.x ).setValue( tx )
		}

		setTranslationY(ty) {
			( this.props.animatedValueY || this.animated.y ).setValue( ty )
		}

		setTranslation( tx, ty ){
			this.setTranslationX( tx )
			this.setTranslationY( ty )
		}

		createAnimator(){
			return new PhysicsAnimator( this, {
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

			let {x,y}  = this.getTranslation()
			this.setTranslation( x + dx, y + dy ) 
		}

		getAnimated(){
			let { animatedValueX, animatedValueY } = this.props

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
					let {x,y} = this.getAnimated()
					let offset = {x: x._value, y: y._value}
					x.setOffset( offset.x )
					y.setOffset( offset.y )
					x.setValue( 0 )
					y.setValue( 0 )
					
					this.startDrag( {x: x0, y: y0} )
				},

				onPanResponderMove: (evt, { dx, dy }) => {
					this.dragBehavior.anchorPoint = {
						x: this.props.verticalOnly ? 0 : dx,
						y: this.props.horizontalOnly ? 0 : dy
					}
				},

				onPanResponderRelease: () => {
					this.endDrag()
					let {x,y} = this.getAnimated()
					x.flattenOffset()
					y.flattenOffset()
				}
			})
		}


		reportAlertEvent( position ){
			let inside = this.insideAlertAreas
			let {alertAreas, onAlert} = this.props

			alertAreas.forEach( ({ influenceArea, id }) => {
				if ( !influenceArea || !id ) return;

				if (influenceArea.pointInside(position) ) {
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

		addTempDragBehavior( drag ) {
			var res;
			let pos = this.getTranslation()

			if ( !drag || drag.tension === Infinity ) {
				res = new PhysicsAnchorBehavior( this, pos );
			}
			else {
				res = new PhysicsSpringBehavior(this, pos);
				res.tension = drag.tension;
			}
			this.animator.addTempBehavior( res );

			if (drag && drag.damping > 0) {
				let frictionBehavior = new PhysicsFrictionBehavior(this, drag.damping);
				this.animator.addTempBehavior(frictionBehavior);
			}

			return res;
		}

		resetTouchEventFlags() {
			this.isSwiping = false;
			this.isChildIsScrollContainer = false;
		}

		startDrag( ev ){
			let pos = this.getTranslation()
			this.props.onDrag({state: 'start', x: pos.x + this.lastEnd.x, y: pos.y + this.lastEnd.y})
			this.dragStartLocation = { x: ev.x, y: ev.y }
			this.animator.removeTempBehaviors();
			this.animator.isDragging = true
			this.dragBehavior = this.addTempDragBehavior(this.dragWithSprings);
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
				x: x + this.lastEnd.x + toss * velocity.x,
				y: y + this.lastEnd.y + toss * velocity.y
			};

			let snapPoint = InteractablePoint.findClosestPoint(this.props.snapPoints, projectedCenter);
			let targetSnapPointId = snapPoint && snapPoint.id || "";

			this.props.onDrag({ state: 'end', x: x + this.lastEnd.x, y: y + this.lastEnd.y, targetSnapPointId })

			this.addTempSnapToPointBehavior(snapPoint);
			this.addTempBounceBehaviorWithBoundaries( this.props.boundaries );
		}

		addTempSnapToPointBehavior( snapPoint ) {
			if (!snapPoint == null)  return;
			let { snapPoints, onSnap, onSnapStart } = this.props

			let index = snapPoints.indexOf(snapPoint)

			onSnap({index, id: snapPoint.id});
			onSnapStart({index, id: snapPoint.id});

			let snapBehavior = new PhysicsSpringBehavior(this, {x: snapPoint.x, y: snapPoint.y} );
			if( snapPoint.tension ){
				snapBehavior.tension = snapPoint.tension;
			}

			this.animator.addTempBehavior(snapBehavior);
			
			let frictionBehavior = new PhysicsFrictionBehavior(this, snapPoint.damping);
			this.animator.addTempBehavior(frictionBehavior);
		}

		getBoundariesWithDefaults( boundaries ){
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
		}

		addTempBounceBehaviorWithBoundaries( boundaries ) {
			if ( !boundaries ) return;

			let {minPoint, maxPoint} = this.getBoundariesWithDefaults( boundaries )

			this.animator.addTempBehavior(
				new PhysicsBounceBehavior(this, minPoint, maxPoint, boundaries.bounce )
			);
		}

		addConstantBoundaries(boundaries) {
			if (!boundaries) return;

			let { minPoint, maxPoint } = this.getBoundariesWithDefaults(boundaries)

			let bounceBehavior = new PhysicsBounceBehavior( this, minPoint, maxPoint, 0 );
			this.animator.addBehavior(bounceBehavior);
			this.oldBoundariesBehavior = bounceBehavior;
		}

		addConstantSpringBehavior(point) {
			let anchor = { x: point.x || Infinity, y: point.y || Infinity }

			let springBehavior = new PhysicsSpringBehavior(this, anchor);
			springBehavior.tension = point.tension;
			springBehavior.setInfluence( this.influenceAreaFromPoint(point) );

			this.animator.addBehavior(springBehavior);

			if ( point.damping ) {
				let frictionBehavior = new PhysicsFrictionBehavior(this, point.damping);
				frictionBehavior.setInfluence( this.influenceAreaFromPoint(point) );

				this.animator.addBehavior(frictionBehavior);
			}
		}

		addConstantGravityBehavior( point ) {
			let anchor = { x: point.x || Infinity, y: point.y || Infinity }

			let gravityBehavior = new PhysicsGravityWellBehavior(this, anchor);

			gravityBehavior.setStrength(point.strength);
			gravityBehavior.setFalloff(point.falloff);

			let influenceArea = this.influenceAreaFromPoint(point)
			gravityBehavior.setInfluence( influenceArea );

			this.animator.addBehavior(gravityBehavior);

			if ( point.damping ) {
				this.addFrictionBehavior(
					point,
					influenceArea || this.influenceAreaWithRadius(1.4 * point.falloff, anchor)
				)
			}
		}


		addFrictionBehavior( point, friction ) {
			let frictionBehavior = new PhysicsFrictionBehavior(this, point.damping);
			frictionBehavior.setInfluence( friction || this.influenceAreaFromPoint(point) );
			this.animator.addBehavior(frictionBehavior);
		}

		addConstantFrictionBehavior( point ) {
			return this.addFrictionBehavior( point )
		}

		influenceAreaFromPoint( point ) {
			let {influenceArea} = point
			if (!influenceArea) return;

			return {
				minPoint: {
					x: influenceArea.left || -Infinity,
					y: influenceArea.top || -Infinity
				},
				maxPoint: {
					x: influenceArea.right || Infinity,
					y: influenceArea.bottom || Infinity
				}
			}
		}

		influenceAreaWithRadius( radius, anchor) {
			if (radius <= 0) return null;
			return {
				minPoint: {x: anchor.x - radius, y: anchor.y - radius},
				maxPoint: {x: anchor.x + radius, y: anchor.y + radius}
			}
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

		setBoundaries( boundaries) {
			this.boundaries = boundaries;
			animator.removeBehavior(this.oldBoundariesBehavior);
			this.addConstantBoundaries(boundaries);
		}

		setSpringsPoints( springPoints ) {
			this.springPoints = springPoints;
			springPoints.forEach( point => this.addConstantSpringBehavior(point) )
		}

		setGravityPoints( gravityPoints ) {
			this.gravityPoints = gravityPoints;
			gravityPoints.forEach( point => this.addConstantGravityBehavior(point) )
		}

		setFrictionAreas( frictionAreas) {
			this.frictionAreas = frictionAreas;
			frictionAreas.forEach(point => this.addConstantFrictionBehavior(point))
		}

		setVelocity( velocity ) {
			if ( this.dragBehavior ) return;
			this.velocity = velocity;
			this.animator.setTargetVelocity(this, this.velocity);
			this.endDrag();
		}

		snapTo( index ) {
			if( !this.snapPoints || !index || index >= this.snapPoints.length ) return;
			
			this.animator.removeTempBehaviors();
			this.dragBehavior = null;
			let snapPoint = snapPoints[index]
			this.addTempSnapToPointBehavior(snapPoint);
			this.addTempBounceBehaviorWithBoundaries(this.boundaries);
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

			if( prevProps.frictionAreas !== props.frictionAreas ){
				this.animator.removeTypeBehaviors('friction')
				props.frictionAreas && this.setFrictionAreas( props.frictionAreas )
			}
			
			
			/*
			snapPoints: [],
			frictionAreas: [],
			alertAreas: [],
			boundaries: {},
			dragToss: .1,
			dragWithSprings: false,
			dragEnabled: true,
			*/
		}
	}
}
