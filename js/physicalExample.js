// Tutorial can be found on:
// https://pandaqitutorials.com/Games/7-three-js-physics-with-physijs

Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

//scene = new Physijs.Scene();

// Box
box = new Physijs.BoxMesh(
   new THREE.CubeGeometry( 5, 5, 5 ),
   new THREE.MeshBasicMaterial({ color: 0x888888 })
);
scene.add( box );

//scene.simulate();

var scene = new Physijs.Scene({fixedTimeStep: (1/60), blabla});

//Attributes to pass in the object
fixedTimeStep (default 1 / 60) //How much time one simulation step takes to simulate
reportsize (default 50) //If you know how much objects your world will have, you can set this to optimize

//Methods to call on it
setGravity (default Vector3( 0, -10, 0 ) ) //Sets the direction and strength of the gravity
setFixedTimeStep //Resets the timestep dynamically (do not call it every frame!)

//The simulation call also can take a parameter:
//The maximum steps/iterations the physics system is allowed to perform (more = even more accurate collisions, but slower performance)
scene.simulate({ maxSteps: someValue});









// Tutorial can be found on:
// https://gamedevelopment.tutsplus.com/tutorials/creating-a-simple-3d-physics-game-using-threejs-and-physijs--cms-29453
//var scene = new Physijs.Scene();
//var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000);
//
//Physijs.scripts.worker = 'lib/physijs_worker.js';
//Physijs.scripts.ammo = 'ammo.js';
//
//// the physics calculations happen in a different thread
//// and will not be in sync or as fast as the scene render loop.
//
///*Even the next call to scene.simulate may happen while the
// *previous calculations are still running. In order to make it
// *properly in sync with the physics calculations, we could use
// *the Physijs scene's update event.*/
//scene.addEventListener( 'update', function() {
//    //your code. physics calculations have done updating
//});
//
///*In order to register a collision on a Physijs mesh object
//named arbitrarily as cube, we can listen to the collision event.*/
//car.addEventListener( 'collision', function( objCollidedWith, linearVelOfCollision, angularVelOfCollision ) {
//    /*Within the above method, this will refer to cube, while objCollidedWith is the object cube has collided with.*/
//    
//});
//
//
///* Notice the usage of Physijs.createMaterial to create the
//necessary physics materials by passing a friction value and
//a restitution value. The friction value determines the grip
//on the ground, and the restitution value determines the bounciness.
//One important thing to note is that when we provide a mass value of 0,
//we create a stationary mesh object.*/
//ground_material = Physijs.createMaterial(
//    new THREE.MeshStandardMaterial( { color: 0x00ff00 } ),friction, 0.9 // low restitution
//);
//// Ground
//ground = new Physijs.BoxMesh(new THREE.BoxGeometry(150, 1, 150),ground_material,0 // mass
//);
//ground.receiveShadow = true;
//scene.add( ground );
//
//car.carriage_constraint = new Physijs.HingeConstraint(
//    car.carriage, // First object to be constrained
//    car.body, // constrained to this
//    new THREE.Vector3( 6, 0, 0 ), // at this point
//    new THREE.Vector3( 0, 1, 0 ) // along this axis
//);
//scene.addConstraint( car.carriage_constraint );
//car.carriage_constraint.setLimits(
//    -Math.PI / 3, // minimum angle of motion, in radians
//    Math.PI / 3, // maximum angle of motion, in radians
//    0, // applied as a factor to constraint error
//    0 // controls bounce at limit (0.0 == no bounce)
//);
//
//function addWheel(wheel, pos, isBig, weight){
//    var geometry=wheel_geometry;
//    if(isBig){
//        geometry=big_wheel_geometry;
//    }
//    wheel = new Physijs.CylinderMesh(
//        geometry,
//        wheel_material,
//        weight
//    );
//    wheel.name="cart";
//    wheel.rotation.x = Math.PI / 2;
//    wheel.position.set(pos.x,pos.y,pos.z);
//    wheel.castShadow = true;
//    scene.add( wheel );
//    wheel.setDamping(0,damping);
//    var wheelConstraint = new Physijs.DOFConstraint(
//        wheel, car.body, pos
//    );
//    if(isBig){
//        wheelConstraint = new Physijs.DOFConstraint(
//        wheel, car.carriage, pos);
//    }
//    scene.addConstraint( wheelConstraint );
//    wheelConstraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
//    wheelConstraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
//    return wheelConstraint;
//}
//
//car.wheel_fm_constraint=addWheel(car.wheel_fm, new THREE.Vector3( -7.5, 6.5, 0 ),false,300);
//car.wheel_fm_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
//car.wheel_fm_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });
//
///* We use the releaseBall method to position the ball
// * randomly within our game area whenever it gets collected.*/
//
//function addBall(){
//    var ball_material = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x0000ff ,shading:THREE.FlatShading}),friction,.9 // good restitution
//    );
//    var ball_geometry = new THREE.SphereGeometry( 2,16,16);
//         
//    ball = new Physijs.SphereMesh(ball_geometry,ball_material,20);
//    ball.castShadow = true;
//    releaseBall();
//    scene.add( ball );
//    ball.setDamping(0,0.9);
//     
//    ball.addEventListener( 'collision', onCollision);
//}
//function releaseBall(){
//    var range =10+Math.random()*30;
//    ball.position.y = 16;
//    ball.position.x = ((2*Math.floor(Math.random()*2))-1)*range;
//    ball.position.z = ((2*Math.floor(Math.random()*2))-1)*range;
//    ball.__dirtyPosition = true;//force new position
//     
//    // You also need to cancel the object's velocity
//    ball.setLinearVelocity(new THREE.Vector3(0, 0, 0));
//    ball.setAngularVelocity(new THREE.Vector3(0, 0, 0));
//}
//
///*One thing worth noticing is the fact that we need to override
// *the position values set by the physics simulation in order to
// *reposition our ball. For this, we use the __dirtyPosition flag,
// *which makes sure that the new position is used for further physics simulation.
//
//The ball gets collected when it collides with any part of the
//vehicle which happens in the onCollision listener method.*/
//
//function onCollision(other_object, linear_velocity, angular_velocity ){
//    if(other_object.name==="cart"){
//        score++;
//        releaseBall();
//        scoreText.innerHTML=score.toString();
//    }
//}
//
//// Driving the Vehicle
//
//document.onkeydown = handleKeyDown;
//document.onkeyup = handleKeyUp;
// 
//function handleKeyDown(keyEvent){
//    switch( keyEvent.keyCode ) {
//        case 37:
//        // Left
//            car.wheel_fm_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, 1, 200 );
//            car.wheel_fm_constraint.enableAngularMotor( 1 );
//        break;
//        case 39:
//        // Right
//            car.wheel_fm_constraint.configureAngularMotor( 1, -Math.PI / 3, Math.PI / 3, -1, 200 );
//            car.wheel_fm_constraint.enableAngularMotor( 1 );
//        break;
//        case 38:
//        // Up
//            car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, 6, 2000 );
//            car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, 6, 2000 );
//            car.wheel_bl_constraint.enableAngularMotor( 2 );
//            car.wheel_br_constraint.enableAngularMotor( 2 );
//        break;
//        case 40:
//        // Down
//            car.wheel_bl_constraint.configureAngularMotor( 2, 1, 0, -6, 2000 );
//            car.wheel_br_constraint.configureAngularMotor( 2, 1, 0, -6, 2000 );
//            car.wheel_bl_constraint.enableAngularMotor( 2 );
//            car.wheel_br_constraint.enableAngularMotor( 2 );
//        break;
//    }
//}
//function handleKeyUp(keyEvent){
//   switch( keyEvent.keyCode ) {
//        case 37:
//        // Left
//            car.wheel_fm_constraint.disableAngularMotor( 1 );
//        break;
//        case 39:
//        // Right
//            car.wheel_fm_constraint.disableAngularMotor( 1 );
//        break;
//        case 38:
//        // Up
//            car.wheel_bl_constraint.disableAngularMotor( 2 );
//            car.wheel_br_constraint.disableAngularMotor( 2 );
//        break;
//        case 40:
//        // Down
//            car.wheel_bl_constraint.disableAngularMotor( 2 );
//            car.wheel_br_constraint.disableAngularMotor( 2 );
//        break;
//    }
//}
//
////////////////////////////////////////////////////
//// MENU AND GAME SCREEN.                        //
////////////////////////////////////////////////////
//
//var blocker = document.getElementById( 'blocker' );
//var instructions = document.getElementById( 'instructions' );
//// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
//var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
//if ( havePointerLock ) {
//	var element = document.body;
//	var pointerlockchange = function ( event ) {
//		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
//			controlsEnabled = true;
//			controls.enabled = true;
//			blocker.style.display = 'none';
//		} else {
//			controls.enabled = false;
//			blocker.style.display = '-webkit-box';
//			blocker.style.display = '-moz-box';
//			blocker.style.display = 'box';
//			instructions.style.display = '';
//		}
//	};
//	var pointerlockerror = function ( event ) {
//		instructions.style.display = '';
//	};
//	// Hook pointer lock state change events
//	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
//	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
//	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
//	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
//	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
//	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
//	instructions.addEventListener( 'click', function ( event ) {
//		instructions.style.display = 'none';
//		// Ask the browser to lock the pointer
//		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
//		if ( /Firefox/i.test( navigator.userAgent ) ) {
//			var fullscreenchange = function ( event ) {
//				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
//					document.removeEventListener( 'fullscreenchange', fullscreenchange );
//					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
//					element.requestPointerLock();
//				}
//			};
//			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
//			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
//			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
//			element.requestFullscreen();
//		} else {
//			element.requestPointerLock();
//		}
//	}, false );
//} else {
//	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
//}
//function onWindowResize() {
//	camera.aspect = window.innerWidth / window.innerHeight;
//	camera.updateProjectionMatrix();
//	renderer.setSize( window.innerWidth, window.innerHeight );
//}
//
