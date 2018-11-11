import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Animated, PanResponder } from 'react-native'
import PhysicsAnimator from './physics/PhysicsAnimator'

class InteractableView extends Component {

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

		this.animator = this.createAnimator( props )

		l
		this.initializeAnimator
	}

	render() {
		let { x, y } = this.getPan()
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

	setEventListener( listener ){
		this.listener = listener
	}

	createAnimator( props ){
		let animator = new PhysicsAnimator({
			onAnimatorPause: () => {
				this.listener.onStop( this.getCurrentPosition() )
			},
			onAnimationFrame: () => {
				let pos = this.getCurrentPosition()
				if( this.reportOnAnimateEvents ){
					this.listener.onAnimatedEvent( pos )
				}
				this.reportAlertEvent( pos )
			}
		})
	}

	reportAlertEvent( pos ){
		let inside = this.insideAlertAreas
		let {alertAreas, onAlert} = this.props

		alertAreas.forEach( ({ influenceArea, id }) => {
			if ( !influenceArea || !id ) return;

			if ( influenceArea.pointInside(position) ) {
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

	getCurrentPosition(){
		return {
			x: this.getTranslationX(),
			y: this.getTranslationY()
		}
	}

	addTempDragBehavior( drag ) {
		var res;

		if ( !drag || drag.tension === Infinity ) {
			res = new PhysicsAnchorBehavior( this, this.getCurrentPosition() );
		}
		else {
			res = new PhysicsSpringBehavior(this, getCurrentPosition());
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
		let pos = this.getCurrentPosition()
		this.props.onDrag({state: 'start', x: pos.x, y: pos.y})
		this.dragStartLocation = { x: ev.x, y: ev.y }
		this.animator.removeTempBehaviors();
		this.animator.setDragging(true);
		this.dragBehavior = this.addTempDragBehavior(this.dragWithSprings);
	}

	endDrag(){
		this.animator.removeTempBehaviors();
		this.dragBehavior = null;
		this.animator.setDragging(false);

		let velocity = this.animator.getTargetVelocity(this);
		if (this.horizontalOnly) velocity.y = 0;
		if (this.verticalOnly) velocity.x = 0;
		
		let toss = 0.1;
		if (this.dragWithSprings != null) toss = this.dragWithSprings.toss;

		let projectedCenter = {
			x: getTranslationX() + toss * velocity.x,
			y: getTranslationY() + toss * velocity.y
		};

		let snapPoint = InteractablePoint.findClosestPoint(snapPoints, projectedCenter);
		let targetSnapPointId = snapPoint && snapPoint.id || "";

		let pos = getCurrentPosition();
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

		let minPoint = {
			x: influenceArea.getLeft() || -Infinity,
			y: influenceArea.getTop() || -Infinity
		}

		let maxPoint = {
			x: influenceArea.getRight() || Infinity,
			y: influenceArea.getBottom() || Infinity
		}

		return new PhysicsArea(minPoint, maxPoint);
	}

	influenceAreaWithRadius( radius, anchor) {
		if (radius <= 0) return null;

		let minPoint = {x: anchor.x - radius, y: anchor.y - radius};
		let maxPoint = {x: anchor.x + radius, y: anchor.y + radius};
		
		return new PhysicsArea(minPoint, maxPoint);
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

	setInitialPosition( initialPosition) {
		this.initialPosition = initialPosition;
		this.setTranslationX(initialPosition.x);
		this.setTranslationY(initialPosition.y);
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

}
