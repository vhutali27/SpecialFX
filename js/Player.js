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
	mouse.x = ( event.clientX / mainWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / mainHeight ) * 2 + 1;

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
			this.upright(false);
			this.setTargetPlanet(Surface2);
		}
		else{
			this.upright(true);
			this.setTargetPlanet(Surface1);
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

	getPosition(){
		return(this.Group.position); // Return the players position
	}
}