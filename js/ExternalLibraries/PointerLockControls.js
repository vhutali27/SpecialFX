/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PointerLockControls = function ( camera, domElement, character ) {

	if ( domElement === undefined ) {

		console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
		domElement = document.body;

	}

	this.domElement = domElement;
	this.isLocked = false;
	this.character = character;

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	
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
	var orbitPoint;
	
	var clock = new THREE.Clock(true);
	var radius;
	var xRotation =1;
	var yRotation =1;

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();

	var mouseX;
	var mouseY;

	function onMouseMove( event ) {
		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		
		mouseX = event.pageX;
		mouseY = event.pageY;
		
		
		movementX*=xRotation;

		euler.setFromQuaternion( camera.quaternion );
		charEuler.setFromQuaternion( character.quaternion );
		

		//euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;
		charEuler.y -= movementX * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );
		character.quaternion.setFromEuler( charEuler );

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
	
	// New Controls
	this.setRadius = function ( value ) {
		radius = value;
	};
	
	this.UpdateDirection = function ( x, z){
		dirX = x;
		dirZ = z;
	};
	
	this.setOrbitPoint = function ( value ) {
		orbitPoint = value;
	};
	
	this.ControllerMovement = function(){
		if(isGrounded)
		{
			// Sprinting
			if(Sprinting){
				currentMoveSpeed = sprintSpeed;
			}
			else{
				currentMoveSpeed = moveSpeed;
			}
			
			// Jumping
			var addJumpForce = 0;
			if(Jumping){
				addJumpForce = jumpForce;
			}
			var delta = 1- clock.getDelta();
			// move forward parallel to the xz-plane
			// assumes camera.up is y-up
			vec.setFromMatrixPosition( this.character.matrix);
			vec.crossVectors( this.character.up, vec );
			this.character.position.addScaledVector( vec, dirZ*currentMoveSpeed*delta );
			
			// Flat Direction
			this.character.up.reflect(this.character.up.sub(orbitPoint).normalize());
			//var moveDir = new THREE.Vector3(dirX*currentMoveSpeed*delta, addJumpForce*delta, dirZ*currentMoveSpeed*delta);
			
			// Translate
			//this.character.position.add( moveDir.multiplyScalar(currentMoveSpeed) );
			//this.character.rotation.x += 2*Math.PI*((dirZ*currentMoveSpeed*delta)/(2*Math.PI*radius));
		}
	};
	var OrbitQua = new THREE.Quaternion();
	this.OrbitalPull = function()
	{
		// Inward Rotation To Core
		var targetDir = this.character.up.clone().sub(orbitPoint).normalize();
		var delta = 1- clock.getDelta();
		
		// Normal Spherical Movement Applies
		if( isGrounded ){
			
			//this.character.quaternion = (OrbitQua.setFromUnitVectors(this.character.up, targetDir).multiply(this.character.quaternion));

			if(orbitPoint.distanceTo(this.character.position) > (1.5) && !Jumping)
			{
				this.character.up.y -= hoverGravity*delta;
			}
		}
		
		//Move towards new planet
		else
		{
			this.character.position.x += -targetDir.x*delta*orbitGravity;
			this.character.position.y += -targetDir.y*delta*orbitGravity;
			this.character.position.z += -targetDir.z*delta*orbitGravity;
		}
	};
	
	this.feetToGround = function() {
		var targetDir = this.character.up.clone().sub(orbitPoint).normalize();
		var distanceToSurface = orbitPoint.distanceTo(this.character.position) - radius;
		var delta = 1- clock.getDelta();
		
		if(distanceToSurface > 2 && distanceToSurface < 150)
		{
			//THREE.Quaternion.slerp(this.character.quaternion, OrbitQua.setFromUnitVectors(this.character.up, targetDir).multiply( this.character.quaternion ), this.character.quaternion , delta);
		}
		else if (distanceToSurface < 2 )
		{
			isGrounded = true;
		}
	};
	
	this.Update = function(){
		this.ControllerMovement();
		this.OrbitalPull();
		this.feetToGround();
		
	};
	
	// End of New Controls

	/*this.moveForward = function ( distance ) {
		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn( this.character.matrix, 0 );

		vec.crossVectors( this.character.up, vec );

		this.character.position.addScaledVector( vec, distance );

	};
	
	this.moveUp = function ( distance ){
		
		// move on the y-axis
		this.character.position.y += distance;
	};

	this.moveRight = function ( distance ) {
		if( distance < 0) step*=-1;
		
		vec.setFromMatrixColumn( this.character.matrix, 0 );

		this.character.position.addScaledVector( vec, distance );	

	};*/

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

