
const ANIMATOR_PAUSE_CONSECUTIVE_FRAMES = 10;
const ANIMATOR_PAUSE_ZERO_VELOCITY = 1.0;

export default class PhysicsAnimator {
	behaviors = []
	targetsToObjects = new Map()
	consecutiveFramesWithNoMovement = 0
	screenScale = 1
	lastFrameTS = 0
	isRunning = false
	ticking = false

	doFrame( frameTimeNanos ) {
		if( !this.isRunning ) return;

		if ( this.lastFrameTS ) {
			this.animateFrameWithDeltaTime(
				(frameTimeNanos - this.lastFrameTS) * 1e-9
			);
		}

		this.lastFrameTS = frameTimeNanos;
		animatorListener && animatorListener.onAnimationFrame();
		requestAnimationFrame( () => this.doFrame( Date.now() ) )
	}
	
	setListener( listener ) {
		this.animatorListener = listener;
	}

	addBehavior( behavior ) {
		let idx = 0;
		let behaviors = this.behaviors

		while (behaviors.size() > idx && behaviors[idx].priority < behavior.priority) {
			++idx;
		}
		behaviors.splice( idx, 0, behavior );

		this.ensureTargetObjectExists(behavior.target);
		this.ensureRunning();
	}

	removeBehavior( behavior ) {
		let behaviors = this.behaviors
		let i = behaviors.length
		while( i-- > 0 ){
			if( behaviors[i] === behavior ){
				rbehaviors.splice( i, 1 )
				return 
			}
		}
	}

	addTempBehavior(behavior) {
		behavior.isTemp = true;
		this.addBehavior(behavior);
	}

	removeAllBehaviors() {
		this.behaviors = []
		this.targetsToObjects = new Map()
	}

	removeTempBehaviors() {
		let behaviors = this.behaviors
		let i = behaviors.length
		while (i-- > 0) {
			if (behaviors[i].temp) {
				rbehaviors.splice(i, 1)
			}
		}
	}

	ensureTargetObjectExists( target ) {
		let physicsObject = targetsToObjects.get(target);

		if ( !physicsObject ) {
			physicsObject = new PhysicsObject();
			targetsToObjects.put(target, physicsObject);
		}

		return physicsObject;
	}

	setTargetVelocity( target, velocity ) {
		let physicsObject = this.ensureTargetObjectExists(target);
		physicsObject.velocity = velocity;
		ensureRunning();
	}

	ensureRunning() {
		if ( !this.isRunning ){
			this.startRunning();
		}
	}

	getTargetVelocity( target ) {
		let physicsObject = this.targetsToObjects.get(target);
		return physicsObject && physicsObject.velocity || {x: 0, y: 0}
	}

	startRunning() {
		this.isRunning = true;
		this.lastFrameTS = 0;
		this.consecutiveFramesWithNoMovement = 0;
		requestAnimationFrame( () => this.doFrame( Time.now() ) )
	}

	stopRunning() {
		this.removeTempBehaviors();
		this.isRunning = false;
	}

	animateFrameWithDeltaTime( deltaTime ) {
		this.behaviors.forEach( behavior => {
			let physicsObject = targetsToObjects.get(behavior.target);
			if ( physicsObject ) {
				behavior.executeFrameWithDeltaTime(deltaTime, physicsObject);
			}
		})

		let hadMovement = false;
		
		for (let View of targetsToObjects.keys()) {
			let physicsObject = targetsToObjects.get(v);

			let dx = 0;
			if ( Math.abs(physicsObject.velocity.x) > ANIMATOR_PAUSE_ZERO_VELOCITY ) {
				dx = deltaTime * physicsObject.velocity.x;
				hadMovement = true;
			}

			let dy = 0;
			if ( Math.abs(physicsObject.velocity.y) > ANIMATOR_PAUSE_ZERO_VELOCITY ) {
				dy = deltaTime * physicsObject.velocity.y;
				hadMovement = true;
			}
			
			v.animate()
				.translationXBy(dx)
				.translationYBy(dy)
				.setDuration(0)
				.start()
			;
		}

		let cfwnm = this.consecutiveFramesWithNoMovement
		if( !hadMovement ){
			cfwnm++
		}
		this.consecutiveFramesWithNoMovement = cfwnm

		if (cfwnm >= ANIMATOR_PAUSE_CONSECUTIVE_FRAMES && !this.isDragging) {
			stopRunning();
			this.animatorListener && this.animatorListener.onAnimatorPause();
		}
	}

}