//////////////////////////////////////////////////
// GLOBAL vARIABLES                             //
//////////////////////////////////////////////////

// Instantiate a loader
var loaderJson = new THREE.ObjectLoader();
//var loaderGLTF = new THREE.GLTFLoader();
//var loaderOBJ = new THREE.OBJLoader();
var loaderMTL = new THREE.MTLLoader();
var loaderFBX = new THREE.FBXLoader();
var loader = new THREE.TextureLoader();

var mixer;											//THREE.js animations mixer
var loaderAnim = document.getElementById('js-loader');


//Create clock, set autostart to true
var clock = new THREE.Clock(true);

//////////////////////////////////////////////////
// Renderer                                     //
//////////////////////////////////////////////////
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor( 0xEEEEEE );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight, false);
document.body.appendChild(renderer.domElement);
// shading
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;

window.addEventListener( 'resize', onWindowResize, false );


// Camera and scene variables
var scene = new THREE.Scene();


var camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000);
// The objects added to this array should have an animate() function.
// This function will be called by the render function for each frame.
var AnimateObject = new Array();

// WorldObjects are the objects that the player can touch.
var WorldObjects = new Array();
// Planet Classes
var PlanetClasses = new Array();
var time, lastTime;

LoadLevel1(scene);

// Initialize player
var player = new Player(PlanetClasses[0]);
AnimateObject.push(player);

//////////////////////////////////////////////////
// MENU AND GAME SCREEN.                        //
//////////////////////////////////////////////////

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controlsEnabled = true;
			player.controls.enabled = true;
			blocker.style.display = 'none';
		}
		else {
			player.controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			instructions.style.display = '';
		}
	};
	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	};
	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		if ( /Firefox/i.test( navigator.userAgent ) ) {
			var fullscreenchange = function ( event ) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
					element.requestPointerLock();
				}
			};
			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
		startGame();
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}



function startGame(){
	//////////////////////////////////////////////////
	// RENDERING                                    //
	//////////////////////////////////////////////////
	var interval = 0;
	var render = function() {
		// run physics
		time = Date.now();
		if (lastTime !== undefined) {
		   let dt = (time - lastTime) / 1000;
		   world.step(fixedTimeStep, dt, maxSubSteps);
		}
		lastTime = time;

		//Get the seconds elapsed since last getDelta call
		//var timeElapsed = clock.getDelta();
		//Or get the amount of time elapsed since start of the clock/program
		//var timeElapsed = clock.getTimeElapsed();

		//light fluctuation for models
		//flare();

		//places new object in time intervals
		var timeElapsed = Math.round(clock.getElapsedTime());
		//console.log(timeElapsed);
		if (timeElapsed % 10 == 0 && timeElapsed != interval){
			randomPlace();
			interval = timeElapsed; //This deals with multiple items being dropped at the same second due to rounding
		 }

		//randomPlace();
		// Animation Mixer for character
		if (mixer) {
			mixer.update(clock.getDelta());
		}

		// Update the miniView
		// renderMiniView(player.position);

		AnimateObject.forEach(function(object){object.animate();});
		requestAnimationFrame(render);
		renderer.render(scene, camera);

	};

	//////////////////////////////////////////////////
	// INITIALISE AND RENDER SCENE                  //
	//////////////////////////////////////////////////
	// Initialize MiniView
	initMiniView();

	// Initialize GUI Elements
	initGUIElements();
	render();
}
