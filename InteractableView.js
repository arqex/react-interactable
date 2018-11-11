import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Animated, PanResponder } from 'react-native'
import PhysicsAnimator from './physics/PhysicsAnimator'
import PhysicsAnchorBehavior from './physics/PhysicsAnchorBehavior'
import PhysicsBounceBehavior from './physics/PhysicsBounceBehavior'
import PhysicsFrictionBehavior from './physics/PhysicsFrictionBehavior'
import PhysicsGravityWellBehavior from './physics/PhysicsGravityWellBehavior'
import PhysicsSpringBehavior from './physics/PhysicsSpringBehavior'

export default class InteractableView extends Component {
	static propTypes = {
		snapPoints: PropTypes.array,
		frictionAreas: PropTypes.array,
		alertAreas: PropTypes.array,
		horizontalOnly: PropTypes.bool,
		verticalOnly: PropTypes.bool,
		animatedValueX: PropTypes.instanceOf(Animated.Value),
		animatedValueY: PropTypes.instanceOf(Animated.Value),
		onSnap: PropTypes.func,
		onSnapStart: PropTypes.func,
		onEnd: PropTypes.func,
		onDrag: PropTypes.func,
	}

	static defaultProps = {
		snapPoints: [],
		frictionAreas: [],
		onSnap: function () { },
		onSnapStart: function () { },
		onStop: function () { },
		onDrag: function () { },
		onAlert: function () { },
	}

	initialPositionSet = false
	dragEnable = true

	constructor(props) {
		super(props)

		// In case animatedValueXY is not given
		this.animated = new Animated.ValueXY(0,0)

		// This guy will apply all the physics
		this.animator = this.createAnimator( props )

		// Cache when the view is inside of an alert area
		this.insideAlertAreas = {}

		this._pr = this.createPanResponder(props)
	}

	render() {
		let { x, y } = this.animated
		let position = {
			transform: [
				{ translateX: x }, { translateY: y }
			]
		}

		return (
			<Animated.View style={position} {...this._pr.panHandlers}>
				{this.props.children}
			</Animated.View>
		)
	}

	getTranslation(){
		let {animatedValueX, animatedValueY } = this.props

		return {
			x: animatedValueX ? animatedValueX._value : this.animated.x._value,
			y: animatedValueY ? animatedValueY._value : this.animated.y._value
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

	createAnimator( props ){
		return new PhysicsAnimator( this, {
			onAnimatorPause: () => {
				this.props.onStop( this.getTranslation() )
			},
			onAnimationFrame: () => {
				this.reportAlertEvent( this.getTranslation() )
			}
		})
	}

	animate( dx, dy ){
		let {x,y}  = this.getTranslation()
		this.setTranslation( x + dx, y + dy ) 
	}

	createPanResponder(props) {
		return PanResponder.create({
			onMoveShouldSetResponderCapture: () => true,
			onMoveShouldSetPanResponderCapture: () => true,

			onPanResponderGrant: (e, {x0, y0}) => {
				this.startDrag({x: x0, y: y0})
			},

			onPanResponderMove: function (evt, { dx, dy }) {
				this.dragBehavior.setAnchorPoint({
					x: this.props.verticalOnly ? 0 : dx,
					y: this.props.horizontalOnly ? 0 : dy
				})
			},

			onPanResponderRelease: (e, { vx, vy }) => {
				this.endDrag()
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
		this.props.onDrag({state: 'start', x: pos.x, y: pos.y})
		this.dragStartLocation = { x: ev.x, y: ev.y }
		this.animator.removeTempBehaviors();
		this.animator.isDragging = true
		this.dragBehavior = this.addTempDragBehavior(this.dragWithSprings);
	}

	endDrag(){
		this.animator.removeTempBehaviors();
		this.dragBehavior = null;
		this.animator.isDragging = false


		let velocity = this.animator.getTargetVelocity(this);
		if (this.horizontalOnly) velocity.y = 0;
		if (this.verticalOnly) velocity.x = 0;
		
		let toss = 0.1;
		if (this.dragWithSprings != null) toss = this.dragWithSprings.toss;

		let {x,y} = this.getTranslation()
		let projectedCenter = {
			x: x + toss * velocity.x,
			y: y + toss * velocity.y
		};

		let snapPoint = InteractablePoint.findClosestPoint(snapPoints, projectedCenter);
		let targetSnapPointId = snapPoint && snapPoint.id || "";

		let pos = getTranslation();
		this.props.onDrag({ state: 'end', x: pos.x, y: pos.y, targetSnapPointId })

		this.addTempSnapToPointBehavior(snapPoint);
		this.addTempBounceBehaviorWithBoundaries(this.boundaries);
	}

	addTempSnapToPointBehavior( snapPoint ) {
		if (!snapPoint == null)  return;
		let { snapPoints, onSnap, onSnapStart } = this.props

		let index = snapPoints.indexOf(snapPoint)

		onSnap({index, id: snapPoint.id});
		onSnapStart({index, id: snapPoint.id});

		let snapBehavior = new PhysicsSpringBehavior(this, snapPoint.positionWithOrigin());
		snapBehavior.tension = snapPoint.tension;

		this.animator.addTempBehavior(snapBehavior);
		
		let frictionBehavior = new PhysicsFrictionBehavior(this, snapPoint.damping || 0.7);
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
			new PhysicsBounceBehavior(this, minPoint, maxPoint, boundaries.getBounce(), boundaries.isHaptic())
		);
	}

	addConstantBoundaries(boundaries) {
		if (!boundaries) return;

		let { minPoint, maxPoint } = this.getBoundariesWithDefaults(boundaries)

		let bounceBehavior = new PhysicsBounceBehavior(this, minPoint, maxPoint, 0, boundaries.isHaptic());
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

	setVerticalOnly(verticalOnly) {
		this.verticalOnly = verticalOnly;
	}

	setHorizontalOnly(horizontalOnly) {
		this.horizontalOnly = horizontalOnly;
	}

	setDragEnabled(dragEnabled) {
		this.dragEnabled = dragEnabled;

		if (this.dragBehavior && !dragEnabled) {
			this.handleEndOfDrag();
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
	setDragWithSprings( dragWithSprings) {
		this.dragWithSprings = dragWithSprings;
	}
	setDragToss( dragToss) {
		this.dragToss = dragToss;
	}
	setReportOnAnimatedEvents( reportOnAnimatedEvents) { 
		this.reportOnAnimatedEvents = reportOnAnimatedEvents; 
	}

	setSnapPoints( snapPoints) {
		this.snapPoints = snapPoints;
	}

	setAlertAreas( alertAreas) {
		this.alertAreas = alertAreas;
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
		if (dragBehavior != null) return;
		this.velocity = velocity;
		this.animator.setTargetVelocity(this, this.velocity);
		this.handleEndOfDrag();
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
		this.handleEndOfDrag();
	}
}
