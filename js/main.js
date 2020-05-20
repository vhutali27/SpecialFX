//////////////////////////////////////////////////
// USEFUL INFORMATION							//
//////////////////////////////////////////////////
/*
	Types of meshes
	
    Physijs.PlaneMesh - infinite zero-thickness plane
    Physijs.BoxMesh - matches THREE.CubeGeometry
    Physijs.SphereMesh - matches THREE.SphereGeometry
    Physijs.CylinderMesh - matches THREE.CylinderGeometry
    Physijs.ConeMesh - matches THREE.CylinderGeometry (tapered)
    Physijs.CapsuleMesh - matches THREE.CylinderGeometry, except has two half spheres at ends
    Physijs.ConvexMesh - matches any convex geometry you have
    Physijs.ConcaveMesh - matches any concave geometry you have, i.e. arbitrary mesh
    Physijs.HeightfieldMesh - matches a regular grid of height values given in the z-coordinates
    
    Objects that are always going to be static, simply need to have their mass set to 0.
    set the third parameter (mass) to zero if you don't want it to be affected by gravity
    
    Objects that will sometimes be static, and other times be dynamic, need to have the following applied:
	//Completely freeze an object
	object.setAngularFactor = THREE.Vector3(0,0,0);
	object.setLinearFactor = THREE.Vector3( 0, 0, 0 );
	
	//You can also clear any velocities the same way (setting them to a 0 vector3)
	object.setAngularVelocity
	object.setLinearVelocity
	
	//To reset, simply change the factors back to Vector3(1,1,1);
	
	
	//Collisions
	
	mesh.addEventListener( 'collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
    // `this` has collided with `other_object` 
    // with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` 
    //and at normal `contact_normal`
	});
	
	// Materials
	
	Physijs can give some extra properties to a material, and thus to an object.
	These attributes are�friction�and�restitution (bounciness). These need to be set in a special Physijs material:
	
	//Values between 0.0 and 1.0
	var friction = .8;
	var restitution = .3;
	
	//Physijs Material - a three material/shader, friction, restitution
	var material = Physijs.createMaterial(
		new THREE.MeshBasicMaterial({ color: 0x888888 }),
		friction,
		restitution
	);
	
	//Just apply it to the mesh like you always do
	var mesh = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 5, 5, 5 ),
		material
	);
	
	// Because Physijs runs on a different thread than your main application,
	there is no guarantee that it will be able to iterate the scene every time
	you call�scene.simulate. Because of this, you may want to attach an event
	listener to the scene that is triggered whenever the physics simulation has run.
	
	scene.addEventListener( 'update', function() {
    // the scene's physics have finished updating
	});
	
	// Additionally, if your scene is complex or has a lot of objects, the physics
	simulation can slow down to the point where adding new objects can become a lot
	of work for the application. To help alleviate some of the pain this may cause,
	objects have a�ready�event which is triggered after the object has been added to
	the physics simulation.�
	
	var readyHandler = function() {
    // object has been added to the scene
	};
	var mesh = new Physijs.SphereMesh( geometry, material );
	mesh.addEventListener( 'ready', readyHandler );
	scene.add( mesh );
	
	// Compound Shapes
	
	parent.add( child );
	scene.add( parent );
	
	//Remember, add all childs before adding the parent!
	//And, child's positions are local/relative to the parent
	
	// for object constraints visit https://github.com/chandlerprall/Physijs/wiki/Constraints
	
	// To move a cube 100 units depending on the rendering speed use
	theCube.position.x += 100 * timeElapsed;
	
	�Create basic tween

	//Set position and target coordinates
	var position = { x : 0, y: 300 };
	var target = { x : 400, y: 50 };
	
	//Tell it to tween the 'position' parameter
	//Make the tween last 2 seconds (=2000 milliseconds)
	var tween = new TWEEN.Tween(position).to(target, 2000);
	
	//Now update the 3D mesh accordingly
	tween.onUpdate(function(){
		mesh.position.x = position.x;
		mesh.position.y = position.y;
	});
	
	//But don't forget, to start the tween
	tween.start();
	
	//And also don't forget, to put this into your looping render function
	tween.update();
	
	//Delay the start of the tween
	tween.delay(500);
	
	//Set a different tweening (easing) function
	tween.easing(TWEEN.Easing.Elastic.InOut);
	
	//Create a chain of tweens
	//For example: this one loops between firstTween and secondTween
	firstTween.chain(secondTween);
	secondTween.chain(firstTween);
	
	// Easing function can be found here https://sole.github.io/tween.js/examples/03_graphs.html
*/

//////////////////////////////////////////////////
// GLOBAL vARIABLES                             //
//////////////////////////////////////////////////
// Physics libraries that will be used.
Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

var scene = new Physijs.Scene();
scene.addEventListener(
			'update',
			function() {
				scene.simulate( undefined, 1 );
				physics_stats.update();
			}
		);

// Loader
loader = new THREE.TextureLoader();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000);
// The objects added to this array should have an animate() function.
// This function will be called by the render function for each frame.
var AnimateObject = new Array();

// WorldObjects are the objects that the player can touch.
var WorldObjects = new Array();

//////////////////////////////////////////////////
// Renderer                                     //
//////////////////////////////////////////////////

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor( 0xffffff );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener( 'resize', onWindowResize, false );


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
// when the mouse moves, call the given function
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

// Raycasting is used for working out which object the mouse is pointing at
var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

var mouse = { x: 0, y: 0 };
function onDocumentMouseDown( event ) 
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	switch ( event.button ) {
		case 0: // left
			// Shoot bullets
			console.log("Left Click.");
			leftClick = true;
			break;
		case 1: // middle
			console.log("Middle Click.");
			break;
		case 2: // right
			// Change ammo type
			console.log("Right Click.");
			rightClick = true;
			break;
	}
	
    event.preventDefault();
	
	// update the mouse variable
	//mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	//mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	mouse.x = event.clientX - window.innerWidth/2;
    mouse.y = event.clientY - window.innerHeight/2;
	
	// find intersections
	// update the picking ray with the camera and mouse position
	//raycaster.setFromCamera( mouse, controls.getObject());

	// create an array containing all objects in the scene with which the ray intersects
	//var intersects = raycaster.intersectObjects( WorldObjects );
	
	// if there is one (or more) intersections
	//if ( intersects.length > 0 )
	//{
	//	console.log("Hit @ " + toString( intersects[0].point ) );
		// change the color of the closest face.
		//intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 ); 
		//intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
	//}

}

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
		this.controls = new THREE.PointerLockControls(camera,document.body, this.Group, this.PlanetOrigin);
		
		var geometry = new THREE.CylinderGeometry( 2.5, 2.5, 10, 32 );
		var material = new Physijs.createMaterial(new THREE.MeshPhongMaterial({color: 0xff00E3, specular: 0xffffff, shininess: 60}),0,0);
		this.body = new Physijs.CapsuleMesh( geometry, material, 40);
		this.footRaycaster = new THREE.Raycaster(new THREE.Vector3(0,-5,0), new THREE.Vector3(0,-1,0));
		this.headRaycaster = new THREE.Raycaster(new THREE.Vector3(0,5,0), new THREE.Vector3(0,1,0));
		this.Group.add(this.body);
		this.Group.add(this.controls.getObject());
		scene.add(this.Group);
		this.Group.position.set(0,0,0);
		this.PlanetOrigin.position.set(0,0,0);
		
		// Position the components of the character here
	}

	// Returns the Vector3 component of an object with x,y and z variables.
	getVector3(xyz){
		return new THREE.Vector3(xyz.x,xyz.y,xyz.z);
	}

	// Only takes in the planet class. This is called when the player clicks on
	// a different planet to travel to it.
	setTargetPlanet(planet){
		// Check if is already attached to another planet
		if(this.TargetPlanet!== null){
			// Character from that planets pivot
			this.TargetPlanet.pivot.remove(this.PlanetOrigin);
		}
		this.TargetPlanet = planet;
		this.LandedOnPlanet = false;
	}

	// Returns the distance between the TargetPlanet and the player.
	getDistance(){
		if(this.TargetPlanet!== null){
			return this.Group.position.distanceTo(this.TargetPlanet);
		}
		else return 0;
	}
	
	switchPlanet(){
		if(this.TargetPlanet === Surface1){
			player.setTargetPlanet(Surface2);
			this.controls.radius = (Surface2.radius);
			this.controls.setOrbitPoint(new THREE.Vector3(Surface2.x,Surface2.y,Surface2.z));
		}
		else{
			player.setTargetPlanet(Surface1);
			this.controls.radius = (Surface1.radius);
			this.controls.setOrbitPoint(new THREE.Vector3(Surface1.x,Surface1.y,Surface1.z));

		}
	}

	animate(){
		if ( controlsEnabled ) {
			var time = performance.now();
			if(this.TargetPlanet !== null){
				var conPos = this.Group.position;
				raycaster.ray.origin.copy( conPos );
				this.footRaycaster.ray.origin.copy( conPos );
				this.headRaycaster.ray.origin.copy( conPos );
				this.footRaycaster.ray.origin.copy(new THREE.Vector3(conPos.x,conPos.y-5,conPos.z));
				this.headRaycaster.ray.origin.copy(new THREE.Vector3(conPos.x,conPos.y+5,conPos.z));

				// This is collision detection. It checks if the player is currently touching anything.
				var intersections;
				// The raycasters don't rotate with the player. So we need to switch based on the orientation.
				intersections = this.footRaycaster.intersectObjects( WorldObjects );
				
				var isOnObject = false;
				var dis = this.getDistance();
				if (intersections.length > 0) {
					if(dis<10){
						//var firstObjectIntersected = intersections[0];
						isOnObject= true;
						//this.controls.isGrounded = true;
					}
				}
				
				if( this.getDistance()> 5+this.Height ) canJump = false;
				
				// Change Planet Button
				// Add a timer after you find that it is true. So that it doesn't change a million times in a second.
				if(leftClick && !canJump){
					this.switchPlanet();
					isOnObject = false;
					//this.controls.isGrounded = false;
					this.LandedOnPlanet = false;
					canJump = false;
				}
				/*
				var delta = ( time - prevTime ) / 1000;
				
				direction.z = Number( moveForward ) - Number( moveBackward );
				direction.x = Number( moveRight ) - Number( moveLeft );
				direction.normalize(); // this ensures consistent movements in all directions

				// A check should be added here to see if what the player is touching is actually a planet.
				if ( isOnObject === true ) {
					if (this.LandedOnPlanet === false) {
						//this.TargetPlanet.addToPivot(this.Group);
					}
					this.LandedOnPlanet = true;
					canJump = true;
					velocity.y = Math.max(0, velocity.y);
				}
				*/
				// After you land the SphereCoords are still centered at (0,0,0) instead
				// of the new planet. We need to find a way to center SphereCoords on the new planet
				if( this.LandedOnPlanet === true){
					
					//this.controls.moveRight(- velocity.x * delta , dis);
					//this.controls.moveForward(- velocity.z * delta );
					//this.controls.moveUp( velocity.y * delta );
					var temp = new THREE.Vector3(this.TargetPlanet.pivot.x ,this.TargetPlanet.pivot.y, this.TargetPlanet.pivot.z);
					//this.Group.quaternion.multiply(this.Group.quaternion.setFromUnitVectors(temp.normalize(),this.Group.position.normalize()));
					//// get distance can never be less than one.
					if(this.getDistance()< this.TargetPlanet.radius + this.Height){
						/*var SphereCoords = new THREE.Spherical().setFromVector3(this.Group.position);
						SphereCoords.radius = this.TargetPlanet.radius + this.Height;
						var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
						this.Group.quaternion.multiply(this.Group.quaternion.setFromUnitVectors(temp.normalize(),vec.normalize()));
						//this.Group.position.set(vec);
						velocity.y = 0;
						canJump = true;*/
					}
				}
				else{
					// Controls for when you are floating in space
					// This is where the animation for flying should be put.
					// Rotate the character
					// Move character towards planet
					/*var distance = this.getDistance();
					var step = 1 - (distance - 1)/distance;
					//applyGravity(this.Group,this.TargetPlanet,step);
					if(distance < this.TargetPlanet.radius + this.Height){
						//this.LandedOnPlanet = true;
						//this.controls.isGrounded = true;
					}*/
				}
				direction.z = Number( moveForward ) - Number( moveBackward );
				direction.x = Number( moveRight ) - Number( moveLeft );
				direction.normalize(); // this ensures consistent movements in all directions
				this.controls.UpdateDirection(direction.x,direction.z);
				this.controls.Sprinting = sprinting;
				this.controls.Jumping = canJump;
				// Change click after click events have been processed.
				leftClick = false;
				rightClick = false;
				prevTime = time;
			}
			this.controls.Update();
		}
		
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
    var planetGeometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
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
	this.planet.position.set(x, 0, z);
	this.planet.name = name;
    scene.add(this.pivot);
	WorldObjects.push(this.planet);
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
var Surface1 = new Planet( 80, 38, 38, Surface1Material, -300, -200, 0, "Surface1");

var ballMaterial = new THREE.MeshPhongMaterial({
//map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
color: 0xf2f2f2,
specular: 0xbbbbbb,
shininess: 2
});
AnimateObject.push(Surface1);
Surface1.addObject(getSquare(ballMaterial, 2),1,1,2);
Surface1.addObject(getSquare(ballMaterial, 2),1,2,2);
Surface1.addObject(getSquare(ballMaterial, 2),2,1,2);
Surface1.addObject(getSquare(ballMaterial, 2),2,2,2);


//earth.addObject(getSquare(earthMaterial, 2),23,1,2);

// Mars
var Surface2Material = new THREE.MeshPhongMaterial({
map: loader.load("images/Hazard.jpg"),
color: 0x464742,
specular: 0xbbbbbb,
shininess: 2
});
var Surface2 = new Planet( 80, 38, 38, Surface2Material, 0, 200, 300, "Surface2");
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
player.setTargetPlanet(Surface2);
player.controls.setRadius(Surface2.radius);


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
	renderer.setSize( window.innerWidth, window.innerHeight );
}

//////////////////////////////////////////////////
// RENDERING                                    //
//////////////////////////////////////////////////

//Create clock, set autostart to true
var clock = new THREE.Clock(true);

var render = function() {
	//Get the seconds elapsed since last getDelta call
	//var timeElapsed = clock.getDelta();
	//Or get the amount of time elapsed since start of the clock/program
	//var timeElapsed = clock.getTimeElapsed();

  AnimateObject.forEach(function(object){object.animate();});
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  
};

//////////////////////////////////////////////////
// INITIALISE AND RENDER SCENE                  //
//////////////////////////////////////////////////

render();
