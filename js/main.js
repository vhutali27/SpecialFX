//////////////////////////////////////////////////
// GLOBAL vARIABLES                             //
//////////////////////////////////////////////////
// Physics libraries that will be used.
Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';


// to create the world add this to your main script
  // initialize Cannon world
 var world = new CANNON.World();
  world.gravity.set(0, 0, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  
// variables for physics
fixedTimeStep = 1.0 / 60.0; // seconds
const maxSubSteps = 3;

var scene = new THREE.Scene();

// Loader
loader = new THREE.TextureLoader();
var camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000);
// The objects added to this array should have an animate() function.
// This function will be called by the render function for each frame.
var AnimateObject = new Array();

// WorldObjects are the objects that the player can touch.
var WorldObjects = new Array();
var time, lastTime;
//////////////////////////////////////////////////
// Renderer                                     //
//////////////////////////////////////////////////


renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor(0xEEEEEE);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth,
				 window.innerHeight,
				 false);
scene.add(camera);
// shading
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
  
document.body.appendChild(renderer.domElement);

window.addEventListener( 'resize', onWindowResize, false );

// adjust friction between ball & ground
  groundMaterial = new CANNON.Material('groundMaterial');
  ballMaterial = new CANNON.Material('ballMaterial');
  var groundGroundCm = new CANNON.ContactMaterial(ballMaterial, groundMaterial, {
      friction: 0.0, //it ws 0.9
      restitution: 0.0,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
      frictionEquationStiffness: 1e8,
      frictionEquationRegularizationTime: 3,
  });
  var ballCm = new CANNON.ContactMaterial(ballMaterial, ballMaterial, {
      friction: 0.0,
      restitution: 0.9
  });
  world.addContactMaterial(groundGroundCm);
  world.addContactMaterial(ballCm);
//////////////////////////////////////////////////
// LIGHTING                                     //
//////////////////////////////////////////////////

// This was just lighting so we could test the game.
// It is subject to change as we add more features.
var ambientLight = new THREE.AmbientLight(0xf1f1f1);
scene.add(ambientLight);

var spotLight = new THREE.DirectionalLight(0xffffff);
spotLight.position.set(60,60,60);
scene.add(spotLight);

//////////////////////////////////////////////////
// CREATING THE WORLD                           //
//////////////////////////////////////////////////

//Objects (We build a mesh using a geometry and a material)
/**
	* Function that makes a sphere
	* @param {type} material THREE.SOME_TYPE_OF_CONSTRUCTED_MATERIAL
	* @param {type} size decimal
	* @param {type} segments integer
	* @returns {getSphere.obj|THREE.Mesh}
*/
function getSphere( material, size, segments){
	var geometry = new THREE.SphereGeometry(size, segments, segments);
	var obj = new Physijs.SphereMesh(geometry, material);
	obj.castShadow = true;
	return obj;
}

/**
	* Function that makes a cube
	* @param {type} material THREE.SOME_TYPE_OF_CONSTRUCTED_MATERIAL
	* @param {type} size decimal
	* @returns {getSquare.obj|THREE.Mesh}
*/
function getSquare(material, size){
	var geometry = new THREE.BoxGeometry(size, size, size);
	var obj = new Physijs.BoxMesh(geometry, material, 5);
	obj.castShadow = true;
	return obj;
}

//////////////////////////////////////////////////
// PLAYER                                       //
//////////////////////////////////////////////////

// Player Controls
var controlsEnabled = false;

var rightClick = false;
var leftClick = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var changePlanet = false;
var sprinting = false;

var canJump = false;

// Controller Movement
var movementSpeed = 1;
var sprintSpeed = 2;
var jumpForce = 2;
var currentMoveSpeed;

//Gravity
var hoverGravity;
var orbitGravity;
var currentOrbitGravity;
var gravityLetoff;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();
var onKeyDown = function ( event ) {
	switch ( event.keyCode ) {
		case 16:// Shift
			sprinting = true;
			break;
		case 38: // up
		case 87: // w
			moveForward = true;
			break;
		case 37: // left
		case 65: // a
			moveLeft = true; break;
		case 40: // down
		case 83: // s
			moveBackward = true;
			break;
		case 39: // right
		case 68: // d
			moveRight = true;
			break;
		case 32: // space
			if ( canJump === true ) velocity.y += 350;
			canJump = false;
			// If in space it should boost
			break;
		case 69:// E
			changePlanet = true;
			break;
		case 81://Q
			// Drop Resources
			break;
	}
};

var onKeyUp = function ( event ) {
	switch( event.keyCode ) {
		case 16:// Shift
			sprinting = false;
			break;
		case 38: // up
		case 87: // w
			moveForward = false;
			break;
		case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			moveRight = false;
			break;
		case 32:
			// Stop boost in space
			break;
		case 69:// E
			changePlanet = false;
			break;
		case 81://Q
			// Drop resources
			break;
	}
};


// Raycasting is used for working out which object the mouse is pointing at
var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

// Class for Player
class Player{
	constructor(){
		// Variables
		
		// Target Planet is the planet that the character is traveling towards
		// or has landed on. If he collides with a different planet on his way to
		// the planet he wanted to go to then the new planet will be his TargetPlanet.
		this.TargetPlanet = null;
		this.LandedOnPlanet = false;
		this.Height = 5;
		this.Group = new THREE.Group();
		this.PlanetOrigin = new THREE.Group();
		
		// controls is the First Person View controls. This shouldn't be the object that
		// is moved or acts as the player. It should be added to the players THREE.Group
		// The player is the one that should be moved so that the game can also work with
		// the Third Person View controls.
		
		var geometry = new THREE.BoxGeometry(10, 10, 10);
		var material = new THREE.MeshPhongMaterial({ color: '#f96f42',
												 shading: THREE.FlatShading });
		this.mesh = new THREE.Mesh( geometry, material );
	
		// Cannon
		var shape = new CANNON.Box(new CANNON.Vec3(10,10,10));
		this.mesh.cannon = new CANNON.Body({ shape,
										mass: 35,
										material: ballMaterial });
		this.mesh.cannon.linearDamping = this.mesh.cannon.angularDamping = 0.41;
	  
		this.mesh.castShadow = true;
  this.mesh.cannon.inertia.set(0,0,0);
  this.mesh.cannon.invInertia.set(0,0,0);
		// set spawn position according to server socket message
		this.mesh.position.x = 0;
		this.mesh.position.y = 0;
		this.mesh.position.z = 700;

		this.mesh.name = "Main";
		this.mesh.nickname = "DUDEMAN";
		
		// add pivot to attach food to
		// For things you want to add to the character
		this.pivot = new THREE.Group();
  //this.pivot.add(camera);
		this.mesh.add(this.pivot);
  camera.position.z = 800;
  camera.position.y = 0;
		
		// For cannon quaternion the z and y are switched
		// add Cannon body
		this.mesh.cannon.position.x = this.mesh.position.x;
		this.mesh.cannon.position.z = this.mesh.position.y;
		this.mesh.cannon.position.y = this.mesh.position.z;
		this.mesh.cannon.quaternion.x = -this.mesh.quaternion.x;
		this.mesh.cannon.quaternion.z = -this.mesh.quaternion.y;
		this.mesh.cannon.quaternion.y = -this.mesh.quaternion.z;
		this.mesh.cannon.quaternion.w = this.mesh.quaternion.w;
		
		scene.add( this.mesh );
		world.add(this.mesh.cannon);
  this.clampMovement = false;
  
  
		// This is how gravity is applied to the player 
		// This function is in the constructor of the player class
  
		// use the Cannon preStep callback, evoked each timestep, to apply the gravity from the planet center
		//to the main player.
		this.mesh.cannon.preStep = function(){
		  var ball_to_planet = new CANNON.Vec3();
		  this.position.negate(ball_to_planet);

		  var distance = ball_to_planet.norm();

		  ball_to_planet.normalize();
		  ball_to_planet = ball_to_planet.scale(3000000 * this.mass/Math.pow(distance,2));
		  world.gravity.set(ball_to_planet.x, ball_to_planet.y, ball_to_planet.z);
		  // changing gravity seems to apply friction, whereas just applying force doesn't
		};
	
		
		this.controls = new THREE.PointerLockControls(camera, document.body, this.mesh, this.mesh.cannon);
	}
	
	setCannonPosition( mesh ){
		this.mesh.cannon.position.x = mesh.position.x;
		this.mesh.cannon.position.z = mesh.position.y;
		this.mesh.cannon.position.y = mesh.position.z;
		this.mesh.cannon.quaternion.x = -mesh.quaternion.x;
		this.mesh.cannon.quaternion.z = -mesh.quaternion.y;
		this.mesh.cannon.quaternion.y = -mesh.quaternion.z;
		this.mesh.cannon.quaternion.w = mesh.quaternion.w;
	  }
	  
	setMeshPosition( mesh ) {
		  this.mesh.position.x = mesh.cannon.position.x;
		  this.mesh.position.z = mesh.cannon.position.y;
		  this.mesh.position.y = mesh.cannon.position.z;
		  this.mesh.quaternion.x = -mesh.cannon.quaternion.x;
		  this.mesh.quaternion.z = -mesh.cannon.quaternion.y;
		  this.mesh.quaternion.y = -mesh.cannon.quaternion.z;
		  this.mesh.quaternion.w = mesh.cannon.quaternion.w;
	  }
	
	// Function in the class outside the constructor 
    get meshData() {
		return {
		  x: this.mesh.position.x,
		  y: this.mesh.position.y,
		  z: this.mesh.position.z,
		  qx: this.mesh.quaternion.x,
		  qy: this.mesh.quaternion.y,
		  qz: this.mesh.quaternion.z,
		  qw: this.mesh.quaternion.w
		};
	}	
	
	animate(){
	
		// receive and process controls and camera
		this.controls.Update();
		// sync THREE mesh with Cannon mesh
		// Cannon's y & z are swapped from THREE, and w is flipped
		this.setMeshPosition(this.mesh);
		this.setCannonPosition(this.mesh); // Not so sureabout these ones
  
  var vecPos = new THREE.Vector3(0,0,0);//center of sphere
  vecPos.add(this.mesh.position.clone().negate()).normalize().negate();
  
  var vecChar = this.mesh.position.clone().add(camera.position).normalize();
  
  this.mesh.up.copy(new THREE.Vector3().crossVectors(vecPos,vecChar));
  var quat = new THREE.Quaternion().setFromUnitVectors(vecChar,vecPos) * this.mesh.rotation;
  //this.mesh.quaternion.slerp( quat, 1 );
  //THREE.Quaternion.slerp( this.mesh.quaternion, quat, this.mesh.quaternion, 0.1 );
 //var e  = this.mesh.rotation;
 //var e2 = new THREE.Euler().setFromVector3(vecPos);
  
  //var angle = vecPos.angleTo(e.toVector3().normalize());
  //camera.rotation.x -= vecPos.x*angle;
  //this.followCam.rotation.x += vecPos.z*angle;
  //this.followCam.rotation.y += vecPos.z*angle;*/
	}
}
/* This function applies gravity between an object and a planet
 * It takes in the object and the planet it should gravitate towards.
 * The ratio is a value from zero to one. zero being the initial distance
 * from when the player was assigned to the planet and one being the player being
 * at the center of the planet.
 * 
 * @param {type} object Mesh
 * @param {type} planet PlanetClass
 * @param {type} ratio  Float
 *
 **/
function applyGravity(object,planet,ratio){
	// Move character towards planet
	var c = object.position;
	var p = planet;
	var step = ratio*(Math.PI/2);
	object.position.set( c.x + ((p.x - c.x)*step),// x
	c.y + ((p.y - c.y)*step),// y
	c.z + ((p.z - c.z)*step));// z
}

// Class for Planes
class Planet{

  /**
    * constructor
    * @param {type} radius Float
    * @param {type} widthSegments Integer
    * @param {type} heightSegments Integer
    * @param {type} planetMaterial Material

    for Position
    * @param {type} x Float
    * @param {type} y Float
    * @param {type} z Float
  */
  constructor( radius, widthSegments, heightSegments, planetMaterial, x, y, z, name){
    /*var planetGeometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
	this.radius = radius;
    this.x = x;
    this.y = y;
    this.z = z;
    this.planet = new Physijs.SphereMesh(planetGeometry, planetMaterial);
	
	// pivot is the planets group. It holds all the objects that are affected by the planet's
	// gravitational field. If you make an object and want to add it to the planet, you have to
	// add it to the planets pivot. It will move the object with regards to the planets rotation and orbit.
	this.pivot = new THREE.Group();
	this.pivot.position.set(x, y, z);
	this.pivot.add(this.planet);
	this.planet.position.set(0, 0, 0);
	this.planet.name = name;
    scene.add(this.pivot);
	WorldObjects.push(this.planet);*/
	
	// planet creation
	var planet_geometry = new THREE.TetrahedronBufferGeometry( radius, 4 );
	var planet_material = new THREE.MeshPhongMaterial( { color: '#9f8d4a', shading: THREE.FlatShading});
	var planet = new THREE.Mesh( planet_geometry, planet_material );
  
	planet.receiveShadow = true;
  
	scene.add(planet);
  
	// create Cannon planet
	var planetShape = new CANNON.Sphere(radius);
	var planetBody = new CANNON.Body({ mass: 0, material: groundMaterial, shape: planetShape });
	world.add(planetBody);
  }

	/**
		* Attaches an object to the planet. This object will then experience
		* the gravitational forces of the planets
		* @param {type} obj Three Mesh object
		* @param {type} theta Float //Coordinates of object
		* @param {type} phi Float
		* @param {type} height Float
	*/
  addObject( obj, theta, phi, height){
	var SphereCoords = new THREE.Spherical(this.radius + height , theta,phi );
	var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
	obj.quaternion.multiply(obj.quaternion.setFromUnitVectors(obj.position.normalize(),vec.normalize()));
	obj.position.set(vec);
	this.addToPivot(obj);
	
    //scene.add(obj);
	//
  }

	addToPivot(obj){
		var coords = {x:obj.position.x, y:obj.position.y, z: obj.position.z};
		var rotat = {x:obj.rotation.x, y:obj.rotation.y, z: obj.rotation.z};
		this.pivot.add(obj);
		obj.position.set(coords.x,coords.y,coords.z);
		obj.rotation.set(rotat.x,rotat.y,rotat.z);
	}

	/**
		* Function to rotate the planet
		* @param {type} xRotation Float
		* @param {type} yRotation Float
 	*/
  animate(){
	// When you change the rotation or position of a physi object
	// you need to declare the change with mesh.__dirtyPosition = true;
	// mesh.__dirtyRotation = true;
	
  }
}

//////////////////////////////////////////////////
// IN GAME OBJECT CREATION                      //
//////////////////////////////////////////////////

// Surface1
var Surface1Material = new THREE.MeshPhongMaterial({
map: loader.load("images/Bark.jpg"),
color: 0x72f2f2,
specular: 0xbbbbbb,
shininess: 2
});
//var Surface1 = new Planet( 80, 38, 38, Surface1Material, -500, -400, 0, "Surface1");
//
//var ballMaterial = new THREE.MeshPhongMaterial({
////map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
//color: 0xf2f2f2,
//specular: 0xbbbbbb,
//shininess: 2
//});
//AnimateObject.push(Surface1);
//Surface1.addObject(getSquare(ballMaterial, 2),1,1,2);
//Surface1.addObject(getSquare(ballMaterial, 2),1,2,2);
//Surface1.addObject(getSquare(ballMaterial, 2),2,1,2);
//Surface1.addObject(getSquare(ballMaterial, 2),2,2,2);


//earth.addObject(getSquare(earthMaterial, 2),23,1,2);

// Mars
var Surface2Material = new THREE.MeshPhongMaterial({
map: loader.load("images/Hazard.jpg"),
color: 0x464742,
specular: 0xbbbbbb,
shininess: 2
});
var Surface2 = new Planet( 400, 38, 38, Surface2Material, 0, 0, 0, "Surface2");
AnimateObject.push(Surface2);

//Stars
var starGeometry = new THREE.SphereGeometry(1000, 50, 500);
var starMaterial = new THREE.MeshPhongMaterial({
map: loader.load("/images/galaxy_starfield.png"),
side: THREE.DoubleSide,
shininess: 0
});
var starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

// Initialize player
var player = new Player();
AnimateObject.push(player);

// create stars
  var particleCount = 5000,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 2
    });

  for (var p = 0; p < particleCount; p++) {
    var pX = Math.random() * 1000 - 500,
        pY = Math.random() * 1000 - 500,
        pZ = Math.random() * 1000 - 500,
        particle = new THREE.Vector3(pX, pY, pZ);
        particle.normalize().multiplyScalar(Math.random() * 1000 + 600);
    // add it to the geometry
    particles.vertices.push(particle);
  }

  // create the particle system
  var particleSystem = new THREE.Points(
      particles,
      pMaterial);

  scene.add(particleSystem);


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
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
  
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth / 1,
					 window.innerHeight / 1,
					 false);
}

//////////////////////////////////////////////////
// RENDERING                                    //
//////////////////////////////////////////////////

//Create clock, set autostart to true
var clock = new THREE.Clock(true);

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

  AnimateObject.forEach(function(object){object.animate();});
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  //render();
  // New things . dont know what they do
  //renderer.clear();
  //composer.render();
};

//////////////////////////////////////////////////
// INITIALISE AND RENDER SCENE                  //
//////////////////////////////////////////////////

render();
