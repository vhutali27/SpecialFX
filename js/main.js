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

// Instantiate a loader
var loaderGLTF = new THREE.GLTFLoader();
//var loaderOBJ = new THREE.OBJLoader();
var loaderMTL = new THREE.MTLLoader();
var mixer;											//THREE.js animations mixer
var loaderAnim = document.getElementById('js-loader');

//Create clock, set autostart to true
var clock = new THREE.Clock(true);

var scene;

// Loader
var loader = new THREE.TextureLoader();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000);
// The objects added to this array should have an animate() function.
// This function will be called by the render function for each frame.
var AnimateObject = new Array();

// WorldObjects are the objects that the player can touch.
var WorldObjects = new Array();

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
document.addEventListener( 'mouseup', onDocumentMouseUp, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

// Raycasting is used for working out which object the mouse is pointing at
var raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

// Bullets Array
var Bullets = [];

var mouse = { x: 0, y: 0 };
function onDocumentMouseDown( event ) 
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();
	switch ( event.button ) {
		case 0:// Left Click
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
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	// find intersections
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera);

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = raycaster.intersectObjects( scene.children, true );
	
	// if there is one (or more) intersections
	if ( intersects[0] )
	{
		var object = intersects[0].object;
		console.log("Hit @ " + toString( intersects[0].name ) );
	}

}

function onDocumentMouseUp( event ){
	switch ( event.button ) {
		case 0:// Left Click
			// Shoot bullets
			leftClick = false;
			break;
		case 1: // middle
			break;
		case 2: // right
			// Change ammo type
			rightClick = false;
			break;
	}
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
		this.Upright = true;
		this.Group = new THREE.Group();
		
		// controls is the First Person View controls. This shouldn't be the object that
		// is moved or acts as the player. It should be added to the players THREE.Group
		// The player is the one that should be moved so that the game can also work with
		// the Third Person View controls.
		this.controls = new THREE.PointerLockControls(camera,document.body,this.Group);
		var g = this.controls.getObject();
		var group= this.Group;
		
		// Loads the character's gun
		loaderMTL.load("models/Gun/gun.mtl", function ( materials ) {
			materials.preload();
			var loaderOBJ = new THREE.OBJLoader();
			loaderOBJ.setMaterials(materials);
			loaderOBJ.load(
				"models/Gun/gun.obj",
				function (object) {
					//object.rotation.x += Math.PI/4;
					object.rotation.y += Math.PI/2;
					//object.rotation.z += Math.PI/4;
					object.scale.set(5,5,5);
					object.position.set(3, -3,-6);
					g.add(object);
					},
					undefined, // We don't need this function
					function (error) {
					  console.error(error);
			});
		});
		
		// Loads the Characters model
		// Load a glTF resource
			loaderGLTF.load(
				// resource URL
				'models/character.glb',
				// called when the resource is loaded
				function ( gltf ) {
					//Characters model
					var model = gltf.scene;								//Our character
					var neck;											//Reference to the neck bone
					var waist;											//Reference to waist bone
					var possibleAnims;									//Animations found in file
					var idle;											//Idle, the default state
					var currentlyAnimating = false;						//Used to check if neck is in use
					var loaderAnim = document.getElementById('js-loader');
					//Character's animations
					let fileAnimations = gltf.animations;
					model.traverse(o => {
		      
		              if (o.isMesh) {
		                o.castShadow = true;
		                o.receiveShadow = true;
		                //o.material = stacy_mtl;
		              }
		              // Reference the neck and waist bones
		              if (o.isBone && o.name === 'mixamorigNeck') {
		                neck = o;
		              }
		              if (o.isBone && o.name === 'mixamorigSpine') {
		                waist = o;
		              }
		            });
					model.scale.set(7,7,7);
					model.rotation.y += Math.PI;
					model.position.set( 0, -5, -20);
					group.add(model);
					
					loaderAnim.remove();
					mixer = new THREE.AnimationMixer(model);
					let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
					idle = mixer.clipAction(idleAnim);
					idle.play();
			
				},
				undefined, // We don't need this function
				  function (error) {
					console.error(error);
				}
			);

		this.footRaycaster = new THREE.Raycaster(new THREE.Vector3(0,-5,0), new THREE.Vector3(0,-1,0));
		this.headRaycaster = new THREE.Raycaster(new THREE.Vector3(0,5,0), new THREE.Vector3(0,1,0));
		this.Group.add(this.controls.getObject());
		scene.add(this.Group);
		this.Group.position.set(0,0,-110);
		
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
			this.TargetPlanet.pivot.remove(this.Group);
		}
		this.TargetPlanet = planet;
		this.LandedOnPlanet = false;
	}
	
	upright(bool){
		if(bool){
			if(!this.Upright){
				//this.Group.rotation.z += Math.PI;
				//controls.getObject().rotation.z += Math.PI;
				this.Upright = true;
				this.controls.facingUp(true);
			}
		}
		else{
			if(this.Upright){
				//this.Group.rotation.z += Math.PI;
				//controls.getObject().rotation.z += Math.PI;
				this.Upright = false;
				this.controls.facingUp(false);
			}
		}
	}

	// Returns the distance between the TargetPlanet and the player.
	getDistance(){
		if(this.TargetPlanet!== null){
			return Math.abs(this.Group.position.y - this.TargetPlanet.y);
		}
		else return 0;
	}
	
	switchPlanet(){
		if(this.TargetPlanet === Surface1){
			player.upright(false);
			player.setTargetPlanet(Surface2);
		}
		else{
			player.upright(true);
			player.setTargetPlanet(Surface1);
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
				if(this.Upright) intersections = this.footRaycaster.intersectObjects( WorldObjects );
				else intersections = this.headRaycaster.intersectObjects( WorldObjects );
				
				var isOnObject = false;
				if (intersections.length > 0) {
					var dis = this.getDistance();
					if(dis<10){
						//var firstObjectIntersected = intersections[0];
						isOnObject= true;
					}
				}
				
				if( this.getDistance()> 5+this.Height ) canJump = false;
				
				
				
				var leftBound = this.TargetPlanet.x-this.TargetPlanet.width/2;
				var rightBound = this.TargetPlanet.x+this.TargetPlanet.width/2;
				var bottomBound = this.TargetPlanet.z-this.TargetPlanet.depth/2;
				var topBound = this.TargetPlanet.z+this.TargetPlanet.depth/2;
				var withinBoundary = leftBound<conPos.x && rightBound>conPos.x && bottomBound<conPos.z && topBound>conPos.z;
				
				// Change Planet Button
				// Add a timer after you find that it is true. So that it doesn't change a million times in a second.
				if(changePlanet && ( !canJump || !withinBoundary )){
					if(this.TargetPlanet!==null) this.TargetPlanet.pivot.remove(this.Group);
					this.switchPlanet();
					isOnObject = false;
					this.LandedOnPlanet = false;
					canJump = false;
				}
				
				var delta = ( time - prevTime ) / 1000;
				
				velocity.x -= velocity.x * 10.0 * delta;
				velocity.z -= velocity.z * 10.0 * delta;
				velocity.y -= 9.8 * 100.0 * delta;
				
				direction.z = Number( moveForward ) - Number( moveBackward );
				direction.x = Number( moveRight ) - Number( moveLeft );
				direction.normalize(); // this ensures consistent movements in all directions
				
				if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
				if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

				// A check should be added here to see if what the player is touching is actually a planet.
				if ( isOnObject === true ) {
					if (this.LandedOnPlanet === false) {
						var playx = -this.TargetPlanet.x+ this.Group.position.x + this.TargetPlanet.width/2;
						var playz = -this.TargetPlanet.z+ this.Group.position.z + this.TargetPlanet.depth/2;
						//this.TargetPlanet.addObject( this.Group, this.Upright, playx, playz, this.Height);
					}
					this.LandedOnPlanet = true;
					canJump = true;
					velocity.y = Math.max(0, velocity.y);
				}
				
				// After you land the SphereCoords are still centered at (0,0,0) instead
				// of the new planet. We need to find a way to center SphereCoords on the new planet
				if( this.LandedOnPlanet === true){
					this.controls.moveRight(- velocity.x * delta );
					this.controls.moveForward(- velocity.z * delta );
					this.controls.moveUp( velocity.y * delta );
					
					if(!withinBoundary){
						this.LandedOnPlanet = false;
						if(this.TargetPlanet!==null) this.TargetPlanet.pivot.remove(this.Group);
						isOnObject = false;
						canJump = false;
						this.TargetPlanet = null;
					}
					
					// get distance can never be less than one.
					if (withinBoundary) {
						if(this.Upright){
							if(this.Group.position.y<this.TargetPlanet.y+1){
								this.Group.position.y = this.TargetPlanet.y+1+ this.Height;
								velocity.y = 0;
								canJump = true;
							}
						}
						else{
							if(this.Group.position.y>this.TargetPlanet.y-1){
								this.Group.position.y = this.TargetPlanet.y-1 - this.Height;
								velocity.y = 0;
								canJump = true;
							}
						}
					}
				}
				else{
					// Controls for when you are floating in space
					// This is where the animation for flying should be put.
					// Rotate the character
					// Move character towards planet
					var distance = this.getDistance();
					var step = 1 - (distance - 1)/distance;
					applyGravity(this.Group,{x:this.Group.position.x,y:this.TargetPlanet.y,z:this.Group.position.z},step);
				}
				
				// Change click after click events have been processed.
				rightClick = false;
				prevTime = time;
			}
			
			// Shooting Bullets
			if(leftClick){
				var bullet = new THREE.Mesh(
					new THREE.SphereGeometry(0.2,4,4),
					new THREE.MeshBasicMaterial({color:0xffffff})
				);
				
				bullet.rotation.set(0,this.Group.rotation.y,0);
				bullet.position.set(this.Group.position.x-1,
									this.Group.position.y,
									this.Group.position.z+3
				);
				console.log(this.Group.rotation.y);
				bullet.velocity = new THREE.Vector3(
						-Math.sin(this.Group.rotation.y),
						0,
						Math.cos(this.Group.rotation.y));
				Bullets.push(bullet);
				
				bullet.alive = true;
				setTimeout(function(){
					bullet.alive = false;
					scene.remove(bullet);
				},5000);
				scene.add(bullet);
			}
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
	var step = ratio*(Math.PI/2)+0.05;
	object.position.set( c.x + ((p.x - c.x)*step),// x
	c.y + ((p.y - c.y)*step),// y
	c.z + ((p.z - c.z)*step));// z
}

// Class for Planes
class BlockPlanet{

  /**
    * constructor
    * @param {type} width Float
    * @param {type}  depth Float
    * @param {type} planetMaterial Material

    for Position
    * @param {type} x Float
    * @param {type} y Float
    * @param {type} z Float
  */
  constructor( width, depth, planetMaterial, x, y, z, name){
    var planetGeometry = new THREE.BoxGeometry( width, 2, depth );
    this.width = width;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
    this.planet = new Physijs.BoxMesh(planetGeometry, planetMaterial);
	
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
		* @param {type} onTop boolean
		* @param {type} x Float //Coordinates of object
		* @param {type} y Float
		* @param {type} height Float
	*/
  addObject( obj, onTop, x, z, height){
	if(onTop === true){height=1 + height;}
	else {height=-1 - height;}
	obj.position.set(this.x+x - this.width/2, height,this.z+z - this.depth/2);
	this.addToPivot(obj);
  }
  
  addObjObject(path, materialPath, onTop, x, z, height, scale, planet){
	// Loads the material
	loaderMTL.load(materialPath, function ( materials ) {
		materials.preload();
		var loaderOBJ = new THREE.OBJLoader();
		loaderOBJ.setMaterials(materials);
		loaderOBJ.load(
			path,
			function (object) {
				if(onTop === true){height=1 + height;}
				else {height=-1 - height; object.rotation.z+=Math.PI;}
				object.scale.set(scale.x,scale.y,scale.z);
				object.position.set(planet.x+x - planet.width/2, height,planet.z+z - planet.depth/2);
				planet.addToPivot(object);
				},
				undefined, // We don't need this function
				function (error) {
				  console.error(error);
			});
	});
  }
  
  addCanister(onTop,x,z,height,planet){
	// Load a glTF resource
	loaderGLTF.load(
		// resource URL
		'models/character.glb',
		// called when the resource is loaded
		function ( gltf ) {
			//scene.add( gltf.scene );
			var canister = gltf.scene;
			if(onTop === true){height=1 + height;}
			else {height=-1 - height; canister.rotation.z+=Math.PI;}
//			canister.traverse(o => {
//      
//              if (o.isMesh) {
//                o.castShadow = true;
//                o.receiveShadow = true;
//                //o.material = stacy_mtl;
//              }
//              // Reference the neck and waist bones
//              if (o.isBone && o.name === 'mixamorigNeck') {
//                neck = o;
//              }
//              if (o.isBone && o.name === 'mixamorigSpine') {
//                waist = o;
//              }
//            });
			canister.scale.set(10,10,10);
			canister.position.set(planet.x+x - planet.width/2, height,planet.z+z - planet.depth/2);
			planet.addToPivot(canister);
			/*gltf.animations; // Array<THREE.AnimationClip>
			gltf.scene; // THREE.Group
			gltf.scenes; // Array<THREE.Group>
			gltf.cameras; // Array<THREE.Camera>
			gltf.asset; // Object*/
			
			//loaderAnim.remove();
	
		},
		undefined, // We don't need this function
          function (error) {
            console.error(error);
          });
  }

	addToPivot(obj){
		var coords = {x:obj.position.x, y:obj.position.y, z: obj.position.z};
		this.pivot.add(obj);
		obj.position.set(coords.x,coords.y,coords.z);
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
// LOADING MODELS                               //
//////////////////////////////////////////////////



//////////////////////////////////////////////////
//RANDOM DUMMY OBJECTS                          //
//////////////////////////////////////////////////
var maxCollectable = 100; // cap on resources allowed in scene
var maxAmmo = 100;		//cap on ammo allowed in scene
var objectnum = 1; 			//total number of distinct items that can be generated

//adding a torus
// var torusGeometry = new THREE.TorusGeometry(20, 1, 3, 3);
// var phongMaterial = new THREE.MeshPhongMaterial({color: 0xDAA520, emmission: 0.25});
// var torus = new THREE.Mesh(torusGeometry, phongMaterial);
// torus.castShadow =true;
// torus.position.set(45,20,0);
// scene.add(torus);
// WorldObjects.push(torus);

//torus light
// var dLight = new THREE.DirectionalLight(0xFF00FF,1);
// dLight.castShadow = true;
// dLight.shadow.bias = -0.04;
// dLight.shadow.mapSize.width = 1;
// dLight.shadow.mapSize.height = 1;
// var lx = torus.position.x +2;
// var ly = torus.position.y;
// var lz = torus.position.z -2;
// dLight.position.set(lx,ly,lz).normalize();
// dLight.target = torus;
// //scene.add(dLight);

// //light flare function
// function flare()
//         {
//             if (lx < torus.position.x + 50){
//                 lx -=-0.5;
//                 dLight.position.set(lx,ly,lz).normalize();
//                 scene.add(dLight);
//             }else{
//                 lx = torus.position.x -50;
//                 dLight.position.set(lx,ly,lz).normalize();
//                 scene.add(dLight);  
//             }
//         }

function torus(x,y,z){
	var torusGeometry = new THREE.TorusGeometry(4, 1, 60, 60);
	var phongMaterial = new THREE.MeshPhongMaterial({color: 0xDAA520});
	var torus = new THREE.Mesh(torusGeometry, phongMaterial);
	torus.castShadow =true;
	torus.position.set(x+1,y,z+1);
	scene.add(torus);
	WorldObjects.push(torus);
	}

//randomise function
var maxX = 80;
var maxY = 87;
var maxZ = 500;
function randomPlace(){
	 var num = Math.round(Math.random()* (3-1)+1);
	 var posx = Math.round(Math.random()* (maxX-(-maxX))+(-maxX)); 
	 var posy = maxY;//Math.round(Math.random()* (20+20)-20); 
	 var posz = Math.round(Math.random()* (maxZ-(-maxZ))+(-maxZ)); 

	// //substitute shapes in switch with ammo/collectable models
	if (maxCollectable > 0){
		switch (num){
			case 1:{ 
				var torusGeometry = new THREE.TorusGeometry(0.25, 1, 60, 60);
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0xDAA520});
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);
				torus.castShadow =true;
				torus.position.set(posx,posy,posz);
				scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;

			
				break;
			}
			case 2:{
				var torusGeometry = new THREE.TorusGeometry(0.25, 1, 60, 60);
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0x0088dd});
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);
				torus.castShadow =true;
				torus.position.set(posx,posy,posz);
				scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;
				break;
			}
			default:{
				var torusGeometry = new THREE.TorusGeometry(0.25, 1, 60, 60);
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);
				torus.castShadow =true;
				torus.position.set(posx,posy,posz);
				scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;
				break;
			}
		}
	}
}

	




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
	
scene = new Physijs.Scene();
scene.addEventListener(
			'update',
			function() {
				scene.simulate( undefined, 1 );
				physics_stats.update();
			}
		);

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
// IN GAME OBJECT CREATION                      //
//////////////////////////////////////////////////

// Surface1
var woodenFloorMaterial = new THREE.MeshPhongMaterial({
//map: loader.load("images/woodenFloor.jpg"),
color: 0x72f2f2,
specular: 0xbbbbbb,
shininess: 2
});
var Surface1 = new BlockPlanet(150, 1500, woodenFloorMaterial, 0, -50, 0, "Surface1");

var ballMaterial = new THREE.MeshPhongMaterial({
//map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
color: 0xf2f2f2,
specular: 0xbbbbbb,
shininess: 2
});
AnimateObject.push(Surface1);
/*Surface1.addCanister(true,0,0,2,Surface1);
Surface1.addCanister(true,0,150,2,Surface1);
Surface1.addCanister(true,150,0,2,Surface1);
Surface1.addCanister(true,150,150,2,Surface1);*/
Surface1.addObjObject("models/bucket/bucket.obj","models/bucket/bucket.mtl", true, 75, 75, 2, {x:0.15,y:0.15,z:0.15}, Surface1);

//earth.addObject(getSquare(earthMaterial, 2),23,1,2);

// Mars
var grassMaterial = new THREE.MeshPhongMaterial({
//map: loader.load("images/grass.jpg"),
color: 0x464742,
specular: 0xbbbbbb,
shininess: 2
});
var Surface2 = new BlockPlanet(150, 1500, grassMaterial, 0, 100, 0, "Surface2");
AnimateObject.push(Surface2);
Surface2.addObjObject("models/steel_fence/fance.obj","models/steel_fence/fance.mtl",false,0,0,0, {x:5,y:5,z:5},Surface2);
Surface2.addObjObject("models/birch/birch.obj","models/birch/birch.mtl", false, 75, 75, 0, {x:0.15,y:0.15,z:0.15},Surface2);

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
player.setTargetPlanet(Surface1);

//////////////////////////////////////////////////
// RENDERING                                    //
//////////////////////////////////////////////////
var interval = 0;
var render = function() {
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

  AnimateObject.forEach(function(object){object.animate();});
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  
  for(var index = 0; index<Bullets.length; index++){
	if(Bullets[index] === undefined) continue;
	if(Bullets[index].alive == false ){
		Bullets.splice( index, 1);
		continue;
	}
	Bullets[index].position.add(Bullets[index].velocity);
  }
  
};

//////////////////////////////////////////////////
// INITIALISE AND RENDER SCENE                  //
//////////////////////////////////////////////////

render();
	
}
