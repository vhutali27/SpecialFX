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
	var isFacingDown = false;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	var charEuler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();


	function onMouseMove( event ) {
		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		
		if(isFacingDown){
			movementX*=-1;
			movementY*=1;
		}

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
	
	this.facingUp = function (value) { // Changes character orientation
		if(isFacingDown === value){
			this.character.rotation.z += Math.PI;
		}
		isFacingDown = !value;	
	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.moveForward = function ( distance ) {
		if(isFacingDown) distance *= -1;
		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn( this.character.matrix, 0 );

		vec.crossVectors( this.character.up, vec );

		this.character.position.addScaledVector( vec, distance*5 );

	};
	
	this.moveUp = function ( distance ){
		if(isFacingDown) distance *= -1;
		
		// move on the y-axis
		this.character.position.y += distance;
	};

	this.moveRight = function ( distance ) {
		
		vec.setFromMatrixColumn( this.character.matrix, 0 );

		//this.character.position.addScaledVector( vec, distance*5 );
		
		this.character.rotation.z += distance/10;

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

