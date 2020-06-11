/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */
//const CANNON = require('cannon.min.js');

THREE.PointerLockControls = function ( camera, domElement, playerClass) {

	if ( domElement === undefined ) {
		console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
		domElement = document.body;
	}

	character = playerClass.mesh;
	cannonMesh = playerClass.mesh.cannon;
	this.camera = camera;
	this.domElement = domElement;
	this.isLocked = false;
	this.player = character;
	this.cannonMesh = cannonMesh;
	this.speedMult = 1;
	this.launchMult = 1;
	this.scale=1;
	this.i = 1;

	var scope = this;
	this.LeftOrRight = 0;
	this.yAngle = 0;

	var keyState = {};

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };
	var zRotation = 0.5;
	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var cameraLocalRotation = new THREE.Euler( 0, 0, 0, 'YXZ' );
	var cameraRotationPlayer = new THREE.Quaternion();

	// Controller Movement
	var charEuler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	var moveSpeed = 1;
	var sprintSpeed = 2;
	var jumpForce = 2;
	var isGrounded;
	var currentMoveSpeed = 1;
	var Sprinting = false;
	var Jumping = false;
	var dirX;
	var dirZ;

	// Gravity
	var hoverGravity = 1;
	var orbitGravity = 1;
	var currentOrbitGravity = 0.0001;
	var gravityLetoff = 0.0001;

	// Orbit Planet
	var orbitPoint = new THREE.Vector3();

	var clock = new THREE.Clock(true);
	var radius;

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();

	var mouseX;
	var mouseY;
	var poleDir = new THREE.Vector3(1,0,0);

	this.tmpQuaternion = new THREE.Quaternion();
	var rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;
	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		scope.yAngle -= movementY * 0.002;
		scope.yAngle = Math.max( - PI_2, Math.min( PI_2, scope.yAngle));

		var x= new THREE.Vector3(),y= new THREE.Vector3(),z = new THREE.Vector3();
		// Update the cameras z and y basis to that of the object.
		character.matrix.extractBasis(x,y,z);
		// Apply rotations
		z.applyAxisAngle(y,-movementX * 0.002);
		x.applyAxisAngle(y,-movementX * 0.002);
		character.matrix.makeBasis(x.normalize(),y.normalize(),z.normalize()).setPosition(character.position);

		scope.dispatchEvent( changeEvent );

	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( lockEvent );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( unlockEvent );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.setOrbitPoint = function ( value ) {
		orbitPoint.copy(value);
	};

	this.Update = function () {
			if(this.speedMult < 1){ this.speedMult = 1;}

			// get quaternion and position to apply impulse
			var playerPositionCannon = new CANNON.Vec3(scope.cannonMesh.position.x, scope.cannonMesh.position.y, scope.cannonMesh.position.z);

			// get unit (directional) vector for position
	    var norm = playerPositionCannon.normalize();

	   	var localTopPoint = new CANNON.Vec3(0,0,500);
	   	var topVec = new CANNON.Vec3(0,0,1);
	   	var quaternionOnPlanet = new CANNON.Quaternion();
	    quaternionOnPlanet.setFromVectors(topVec, playerPositionCannon);
	    var topOfBall = quaternionOnPlanet.vmult(new CANNON.Vec3(0,0,norm).vadd(new CANNON.Vec3(0,0, 1 * 10)));

			// find direction on planenormal by crossing the cross prods of localUp and camera dir
			var x= new THREE.Vector3(),y= new THREE.Vector3(),z = new THREE.Vector3();
			character.matrix.extractBasis(x,y,z);
			// lateral directional vector
			var cross1 = new THREE.Vector3();
			// front/back vector
			var cross2 = new THREE.Vector3();
			cross1.copy(x);
			cross2.copy(z);

			if (keyState[32]) {
				// build up launchMult if spacebar down
				if(this.launchMult < 6) this.launchMult += 1/(this.i++ * 1.1);
	    }

	    if (keyState[38] || keyState[87]) {
	    		if(this.speedMult < 1) this.speedMult += 0.005;
	        // up arrow or 'w' - move forward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(
													   -cross2.x * 150/2 *this.speedMult,
													   -cross2.z * 150/2 *this.speedMult,
													   -cross2.y * 150/2 *this.speedMult
													   ),topOfBall);
	    }

	    if (keyState[40] || keyState[83]) {
	    	if(this.speedMult <1) this.speedMult += 0.005;
	        // down arrow or 's' - move backward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(
													   cross2.x * 150/2 *this.speedMult,
													   cross2.z * 150/2 *this.speedMult,
													   cross2.y * 150/2 *this.speedMult
													   ) ,topOfBall);
	    }

	    if (keyState[37] || keyState[65]) {
	    	if(this.speedMult < 1) this.speedMult += 0.005;
	        // left arrow or 'a' - rotate left
	        this.cannonMesh.applyImpulse(new CANNON.Vec3(
														 -cross1.x * 100/2 * this.speedMult,
														 -cross1.z * 100/2 * this.speedMult,
														 -cross1.y * 100/2 * this.speedMult
														 ) ,topOfBall);
	        this.LeftOrRight -= 1;
	    }

	    if (keyState[39] || keyState[68]) {
	    	if(this.speedMult < 1) this.speedMult += 0.005;
	        // right arrow or 'd' - rotate right
            this.cannonMesh.applyImpulse(new CANNON.Vec3(
														 cross1.x * 100/2 * this.speedMult,
														 cross1.z * 100/2 * this.speedMult,
														 cross1.y * 100/2 * this.speedMult
														 ), topOfBall);
            this.LeftOrRight += 1;
	    }
	    if(!(keyState[38] || keyState[87] || keyState[40] || keyState[83] || keyState[37] || keyState[65] || keyState[39] || keyState[68])){
	    	// decrement speedMult when no keys down
	    	this.speedMult -= 0.1;
	    }

			// Planet Switching on 'Key'E' Press
			if(keyState[69]){
				playerClass.changePlanet();
			}

			// Shoot Bullets
			if(keyState[0]){
				//Left click
				playerClass.shoot();
			}

			// Change Ammo Type
			if(keyState[2]){
				// Right Click
				playerClass.changeAmmo();
			}

	    // launch if spacebar up and launchMult greater than 1
	    if (!keyState[32] && this.launchMult > 1 ) {// SpaceBar
		    var cross1o = new THREE.Vector3();
				var cross2o = new THREE.Vector3();
				cross1o.copy(x);
				cross2o.copy(z);

		    var launchIntoOrbit = new THREE.Vector3();
		     if(keyState[38] || keyState[87]){//W
				launchIntoOrbit.copy(cross2o).negate();
		    }else
		    if (keyState[40] || keyState[83]) {//S
		    	launchIntoOrbit.copy(cross2o);
		    }else
		    if (keyState[37] || keyState[65]) {//A
		    	launchIntoOrbit.copy(cross1o);
		    }else
		    if (keyState[39] || keyState[68]) {//D
		    	launchIntoOrbit.copy(cross1o).negate();
		    }
		    else{
		    	launchIntoOrbit.copy(y).normalize();
		    }

	        this.cannonMesh.applyImpulse(new CANNON.Vec3(launchIntoOrbit.x * 275/2 * this.launchMult , launchIntoOrbit.z * 275/2 * this.launchMult , launchIntoOrbit.y * 275/2 * this.launchMult ), topOfBall);

	        scope.cooldown = Date.now();

	        this.launchMult = 1;
	        this.i = 1;
		}
	};

	function onKeyDown( event ) {
    	event = event || window.event;
        keyState[event.keyCode || event.which] = true;
    }

    function onKeyUp( event ) {
        event = event || window.event;
        keyState[event.keyCode || event.which] = false;
    }

	this.domElement.addEventListener('contextmenu', function( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener('keydown', onKeyDown, false );
	this.domElement.addEventListener('keyup', onKeyUp, false );


	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();

};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;
