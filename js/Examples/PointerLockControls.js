/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */
//const CANNON = require('cannon.min.js');

THREE.PointerLockControls = function ( camera, domElement, character, cannonMesh ) {

	if ( domElement === undefined ) {
		console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
		domElement = document.body;
	}

	this.domElement = domElement;
	this.isLocked = false;
	this.camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000);
	this.player = character;
	this.cannonMesh = cannonMesh;
	this.speedMult = 1;
	this.launchMult = 1;
	this.i = 1;
	
	this.playerRotation = new THREE.Quaternion();

	var scope = this;
	this.LeftOrRight = 0;
	
	var keyState = {};
	
	
	var curCamZoom = 60;
	var curCamHeight = 70;

	var cameraReferenceOrientation = new THREE.Quaternion();
	var cameraReferenceOrientationObj = new THREE.Object3D();
	var poleDir = new THREE.Vector3(1,0,0);

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
		charEuler.setFromQuaternion( character.quaternion );
		

		if(!isGrounded) euler.y -= movementX * 0.002;
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
		orbitPoint.x=value.x;
		orbitPoint.y=value.y;
		orbitPoint.z=value.z;
		character.position.set(value);
	};
	
	this.Update = function(){
		// fov scales according to scale and speedMult
		//this.camera.fov = Math.max(55, Math.min(45 + this.speedMult*10, 65/(1 + (scope.scale * 0.01) )));
		//this.camera.updateProjectionMatrix();
		
		this.checkKeyStates();

		// now we position and orient the camera with respect to player and planet using matrix transforms
	    /*var playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
		
		var cameraPosition = this.player.position.clone();
		var poleDirection = new THREE.Vector3(1,0,0);

	    var localUp = cameraPosition.clone().normalize();
		
		if(this.LeftOrRight===-1){
	 		cameraReferenceOrientationObj.rotation.y = 0.05;
	 		this.LeftOrRight = 0;
	 	}
	 	else if(this.LeftOrRight===1){
	 		cameraReferenceOrientationObj.rotation.y = -0.05;
	 		this.LeftOrRight = 0;
	 	}
		
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

	 	//this.camera.matrixAutoUpdate = false;

		var cameraPlace = new THREE.Matrix4();
	    cameraPlace.makeTranslation ( 0, curCamHeight * scope.scale * 0.8, curCamZoom * scope.scale * 0.8);

	    var cameraRot = new THREE.Matrix4();
	    cameraRot.makeRotationX(-0.32 - (playerPosition.length()/1200));

	    var oneTwo = new THREE.Matrix4();
	    oneTwo.multiplyMatrices(cameraTransform , cameraPlace);

		var oneTwoThree = new THREE.Matrix4();
	    oneTwoThree.multiplyMatrices(oneTwo, cameraRot);
*/
	    //this.camera.matrix = oneTwoThree;
		
		/*console.log(camera.position);*/
		
	};
	
	this.checkKeyStates = function () {
		if(this.speedMult < 1){ this.speedMult = 1;}

		// get quaternion and position to apply impulse
		var playerPositionCannon = new CANNON.Vec3(scope.cannonMesh.position.x, scope.cannonMesh.position.y, scope.cannonMesh.position.z);

		// get unit (directional) vector for position
	    var norm = playerPositionCannon.normalize();

	   	var localTopPoint = new CANNON.Vec3(0,0,500);
	   	var topVec = new CANNON.Vec3(0,0,1);
	   	var quaternionOnPlanet = new CANNON.Quaternion();
	    quaternionOnPlanet.setFromVectors(topVec, playerPositionCannon);
	    var topOfBall = quaternionOnPlanet.vmult(new CANNON.Vec3(0,0,norm).vadd(new CANNON.Vec3(0,0, scope.scale * 10)));

		// find direction on planenormal by crossing the cross prods of localUp and camera dir
		var camVec = new THREE.Vector3();
	    camera.getWorldDirection( camVec );
	    camVec.normalize();

		var playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
		playerPosition.normalize();

		// lateral directional vector
		var cross1 = new THREE.Vector3();
		cross1.crossVectors(playerPosition, camVec);

		// front/back vector
		var cross2 = new THREE.Vector3();
		cross2.crossVectors(playerPosition, cross1);
		
		if (keyState[32]) {
				// build up launchMult if spacebar down
				if(this.launchMult < 6) this.launchMult += 1/(this.i++ * 1.1);
	    }

	    if (keyState[38] || keyState[87]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // up arrow or 'w' - move forward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(
													   -cross2.x * 150 *this.speedMult,
													   -cross2.z * 150 *this.speedMult,
													   -cross2.y * 150 *this.speedMult
													   ),topOfBall);
	    }

	    if (keyState[40] || keyState[83]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // down arrow or 's' - move backward
          this.cannonMesh.applyImpulse(new CANNON.Vec3(
													   cross2.x * 150 *this.speedMult,
													   cross2.z * 150 *this.speedMult,
													   cross2.y * 150 *this.speedMult
													   ) ,topOfBall);
	    }

	    if (keyState[37] || keyState[65]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // left arrow or 'a' - rotate left
	        this.cannonMesh.applyImpulse(new CANNON.Vec3(cross1.x * 100 * this.speedMult,
														 cross1.z * 100 * this.speedMult,
														 cross1.y * 100 * this.speedMult
														 ) ,topOfBall);
	        this.LeftOrRight -= 1;
	    }

	    if (keyState[39] || keyState[68]) {
	    	if(this.speedMult < 3.5) this.speedMult += 0.005;
	        // right arrow or 'd' - rotate right
            this.cannonMesh.applyImpulse(new CANNON.Vec3(
														 -cross1.x * 100 * this.speedMult,
														 -cross1.z * 100 * this.speedMult,
														 -cross1.y * 100 * this.speedMult
														 ), topOfBall);
            this.LeftOrRight += 1;
	    }
	    if(!(keyState[38] || keyState[87] || keyState[40] || keyState[83] || keyState[37] || keyState[65] || keyState[39] || keyState[68])){
	    	// decrement speedMult when no keys down
	    	this.speedMult -= 0.06;
	    }

	    // launch if spacebar up and launchMult greater than 1
	    if (!keyState[32] && this.launchMult > 1 ) {// SpaceBar

			var camVec2 = new THREE.Vector3();
		    camera.getWorldDirection( camVec2 );
		    camVec2.normalize();

		    // apply upward force to launch
		    var upforce = new THREE.Vector3(0,1,0);
		    var ufQuat = new THREE.Quaternion();
		    camera.getWorldQuaternion( ufQuat );
		    upforce.applyQuaternion(ufQuat);

		    camVec2.add(upforce.divideScalar(1));
		    camVec2.normalize();

		    var cross1o = new THREE.Vector3();
			cross1o.crossVectors(playerPosition, camVec2);
			var cross2o = new THREE.Vector3();
			cross2o.crossVectors(playerPosition, cross1o);

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
		    	launchIntoOrbit.copy(playerPosition).normalize().divideScalar(1);
		    }

	        this.cannonMesh.applyImpulse(new CANNON.Vec3(launchIntoOrbit.x * 2750*2 * this.launchMult , launchIntoOrbit.z * 2750*2 * this.launchMult , launchIntoOrbit.y * 2750*2 * this.launchMult ), topOfBall);
			
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

