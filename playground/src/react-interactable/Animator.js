import Behaviors from './Behaviors'

const ANIMATOR_PAUSE_CONSECUTIVE_FRAMES = 10;
const ANIMATOR_PAUSE_ZERO_VELOCITY = 1.0;

class PhysicsAnimator {
	behaviors = []
	physicsObject = {vx: 0, vy: 0, mass: 1}
	consecutiveFramesWithNoMovement = 0
	screenScale = 1
	lastFrameTS = 0
	isRunning = false
	ticking = false
	isDragging = false

	constructor( View, listener, debug ){
		this.View = View
		this.animatorListener = listener
		if( !debug ){
			let nofn = function(){}
			this.debugStart = nofn;
			this.debugEnd = nofn;
		}
	}

	doFrame( frameTimeMillis ) {
		if( !this.isRunning ) return;

		if ( this.lastFrameTS ) {
			this.animateFrameWithDeltaTime(
				(frameTimeMillis - this.lastFrameTS) * 1e-3
			);
		}

		this.lastFrameTS = frameTimeMillis;
		this.animatorListener.onAnimationFrame();
		requestAnimationFrame( () => this.doFrame( Date.now() ) )
	}

	debugStart( behavior ){
		if( this.debug !== true && this.debug !== behavior.type ) return;
		this.debugB = behavior
		this.debugInitialV = {...this.physicsObject}
	}

	debugEnd() {
		if (!this.debugB || (this.debug !== true && this.debug !== this.debugB.type)) return;
		console.log( `Debug ${this.debugB.type}`, {
			dvx: this.physicsObject.vx - this.debugInitialV.vx,
			dvy: this.physicsObject.vy - this.debugInitialV.vy,
		})
	}
	
	animateFrameWithDeltaTime( deltaTime ) {
		if( !deltaTime ) return;

		let { physicsObject, behaviors, View } = this
		let hadMovement = false
		let coords = View.getTranslation()

		behaviors.forEach( behavior => {
			this.debugStart( behavior )
			Behaviors[ behavior.type ].doFrame( behavior, deltaTime, physicsObject, coords, View )
			this.debugEnd()
		})

		let dx = 0;
		let {vx,vy} = physicsObject
		
		if ( Math.abs(vx) > ANIMATOR_PAUSE_ZERO_VELOCITY ) {
			dx = deltaTime * vx;
			hadMovement = true;
		}

		let dy = 0;
		if ( Math.abs(vy) > ANIMATOR_PAUSE_ZERO_VELOCITY ) {
			dy = deltaTime * vy;
			hadMovement = true;
		}
		
		View.animate( dx, dy )

		let cfwnm = hadMovement ? 0 : this.consecutiveFramesWithNoMovement + 1
		this.consecutiveFramesWithNoMovement = cfwnm

		if (cfwnm >= ANIMATOR_PAUSE_CONSECUTIVE_FRAMES && !this.isDragging ) {
			this.stopRunning();
			this.animatorListener.onAnimatorPause();
		}
	}

	addBehavior( type, options, isTemp ){
		let b = Behaviors[ type ]
		if( !b ) return;

		let behavior = b.create( options, isTemp )
		let behaviors = this.behaviors
		let idx = 0

		while (behaviors.length > idx && behaviors[idx].priority <= behavior.priority) {
			++idx;
		}
		behaviors.splice( idx, 0, behavior )

		this.ensureRunning()
		return behavior
	}

	remove( condition ){
		let behaviors = this.behaviors
		let i = behaviors.length
		while( i-- > 0 ){
			if( condition(behaviors[i]) ){
				behaviors.splice( i, 1 )
			}
		}
	}

	removeBehavior( behavior ) {
		this.remove( target => target === behavior )
	}

	removeTypeBehaviors( type ){
		this.remove( target => target.type === type )
	}
	
	removeTempBehaviors(){
		this.remove( target => target.isTemp )
	}
	
	getVelocity(){ 
		return { x: this.physicsObject.vx, y: this.physicsObject.vy }
	}

	ensureRunning() {
		this.isRunning || this.startRunning()
	}

	startRunning() {
		this.isRunning = true;
		this.lastFrameTS = 0;
		this.consecutiveFramesWithNoMovement = 0;
		requestAnimationFrame( () => this.doFrame( Date.now() ) )
	}

	stopRunning() {
		this.removeTempBehaviors();
		this.physicsObject = {vx: 0, vy: 0, mass: this.physicsObject.mass}
		this.isRunning = false;
	}
}

export default PhysicsAnimator