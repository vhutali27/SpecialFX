/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */
const CANNON = require('cannon.min.js');

THREE.PointerLockControls = function ( camera, domElement, character, pivot ) {

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
	
	// New Vars
	var playerRotation = new THREE.Quaternion();
	var cameraReferenceOrientation = new THREE.Quaternion();
	var cameraReferenceOrientationObj = new THREE.Object3D();
	var poleDir = new THREE.Vector3(1,0,0);
	
	// Gravity
	var hoverGravity = 1;
	var orbitGravity = 1;
	var currentOrbitGravity = 0.0001;
	var gravityLetoff = 0.0001;
	
	// Orbit Planet
	var orbitPoint = new THREE.Vector3();
	
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
		charEuler.setFromQuaternion( pivot.quaternion );
		

		if(!isGrounded) euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;
		charEuler.y -= movementX * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );
		pivot.quaternion.setFromEuler( charEuler );

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
		orbitPoint.x=value.x;
		orbitPoint.y=value.y;
		orbitPoint.z=value.z;
		pivot.position.set(value);
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
			
			
		}
	};

	
	this.OrbitalPull = function()
	{	
		// Normal Spherical Movement Applies
		if( !isGrounded ){
			//yes
		}
		else{
			//pivot.rotation.z += 0.1;	
		}
	};
	
	this.feetToGround = function() {
		var distanceToSurface = orbitPoint.distanceTo(this.character.position) - radius;
		var delta = 1- clock.getDelta();
		
		if(distanceToSurface > 2 && distanceToSurface < 150)
		{
			//pivot.up.y -= delta;
			//THREE.Quaternion.slerp(this.character.quaternion, OrbitQua.setFromUnitVectors(this.character.up, targetDir).multiply( this.character.quaternion ), this.character.quaternion , delta);
		}
		else if (distanceToSurface < 2 && !isGrounded)
		{
				
		}
		
		var playerPosition = new THREE.Vector3(character.position.x, character.position.y, character.position.z);
		var poleDirection = new THREE.Vector3(1,0,0);
		var localUp = playerPosition.clone().normalize();

		/*if(this.left){
			cameraReferenceOrientationObj.rotation.y = 0.05;
			this.left = false;
		}
		else if(this.right){
			cameraReferenceOrientationObj.rotation.y = -0.05;
			this.right = false;
		}*/
		
		var referenceForward = new THREE.Vector3(0, 0, 1);
		referenceForward.applyQuaternion(cameraReferenceOrientationObj.quaternion);

		var correctionAngle = Math.atan2(referenceForward.x, referenceForward.z);
		var cameraPoru = new THREE.Vector3(0,-1,0);

		cameraReferenceOrientationObj.quaternion.setFromAxisAngle(cameraPoru,correctionAngle);
		poleDir.applyAxisAngle(localUp,correctionAngle).normalize();

		cameraReferenceOrientationObj.quaternion.copy(cameraReferenceOrientation);

		var cross = new THREE.Vector3();
		cross.crossVectors(poleDir,localUp);

		var dot = localUp.dot(poleDir);
		poleDir.subVectors(poleDir , localUp.clone().multiplyScalar(dot));

		var cameraTransform = new THREE.Matrix4();
		cameraTransform.set(	poleDir.x,localUp.x,cross.x,cameraPosition.x,
					poleDir.y,localUp.y,cross.y,cameraPosition.y,
					poleDir.z,localUp.z,cross.z,cameraPosition.z,
					0,0,0,1);
		
		character.matrixAutoUpdate = false;
		
		var cameraPlace = new THREE.Matrix4();
		cameraPlace.makeTranslation ( 0, 2 * 0.8, 0 * 0.8);

		var cameraRot = new THREE.Matrix4();
		cameraRot.makeRotationX(-0.32 - (playerPosition.length()/1200));

		var oneTwo = new THREE.Matrix4();
		oneTwo.multiplyMatrices(cameraTransform , cameraPlace);

		var oneTwoThree = new THREE.Matrix4();
		oneTwoThree.multiplyMatrices(oneTwo, cameraRot);

		character.matrix = oneTwoThree;
		
	};
	
	this.Update = function(){
		this.ControllerMovement();
		this.OrbitalPull();
		this.feetToGround();
		
	};
	
	// End of New Controls

	this.moveForward = function ( distance ) {
		// move forward parallel to the xz-plane
		// assumes camera.up is y-up
		
		pivot.rotation.x += distance;

		//vec.setFromMatrixColumn( this.character.matrix, 0 );
		//
		//vec.crossVectors( this.character.up, vec );
		//
		//this.character.position.addScaledVector( vec, distance );

	};
	
	this.moveUp = function ( distance ){
		
		// move on the y-axis
		this.character.up.y += distance;
	};

	this.moveRight = function ( distance ) {
		pivot.rotation.z += distance;
		//if( distance < 0) step*=-1;
		//
		//vec.setFromMatrixColumn( this.character.matrix, 0 );
		//
		//this.character.position.addScaledVector( vec, distance );	

	};

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

