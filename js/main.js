//////////////////////////////////////////////////
// GLOBAL VARIABLES                             //
//////////////////////////////////////////////////

// Instantiate a loader
var loaderJson = new THREE.ObjectLoader(loadingManager);
//var loaderGLTF = new THREE.GLTFLoader(loadingManager);
//var loaderOBJ = new THREE.OBJLoader(loadingManager);
var loaderMTL = new THREE.MTLLoader(loadingManager);
var loaderFBX = new THREE.FBXLoader(loadingManager);
var loader = new THREE.TextureLoader(loadingManager);

var mixer;											//THREE.js animations mixer
var loaderAnim = document.getElementById('js-loader');


//Create clock, set autostart to true
var clock = new THREE.Clock(true);



window.addEventListener( 'resize', onWindowResize, false );

// Camera and scene variables
var scene = new THREE.Scene();
// Orthographic Camera to be used for the mini view
var orthoCamera = new THREE.OrthographicCamera(-5000, 5000, window.innerHeight / 2, window.innerHeight / - 2, 0, 10000 );
orthoCamera.position.set(3000, 0, 6000);

var camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 15000);
// The objects added to this array should have an animate() function.
// This function will be called by the render function for each frame.
var AnimateObject = new Array();

// WorldObjects are the objects that the player can touch.
var WorldObjects = new Array();
var WorldCannonObjects = new Array();
// Planet Classes
var PlanetClasses = new Array();
var time, lastTime;

LoadLevel1(scene);

// Initialize player
var player = new Player(PlanetClasses[0]);
AnimateObject.push(player);

var START_GAME = false;
//////////////////////////////////////////////////
// MENU AND GAME SCREEN.                        //
//////////////////////////////////////////////////

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
		if(!RESOURCES_LOADED) return;
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

	loadingScreen.camera.aspect = window.innerWidth / window.innerHeight;
	loadingScreen.camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function startGame(){
	//////////////////////////////////////////////////
	// INITIALISE AND RENDER SCENE                  //
	//////////////////////////////////////////////////
	// Initialize MiniView
	//miniScene();

	// Initialize GUI Elements
	initGUIElements();
	START_GAME = true;
}

//////////////////////////////////////////////////
// RENDERING                                    //
//////////////////////////////////////////////////
var interval = 0;
var render = function() {
	if(START_GAME){
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
	}
	requestAnimationFrame(render);
	if(RESOURCES_LOADED) renderer.render(scene, camera);
};
render();
