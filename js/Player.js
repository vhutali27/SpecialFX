//////////////////////////////////////////////////
// PLAYER                                       //
//////////////////////////////////////////////////

// Player Controls
var controlsEnabled = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

// when the mouse moves, call the given function
document.addEventListener( 'mouseup', onDocumentMouseUp, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );

// Raycasting is used for working out which object the mouse is pointing at
var MouseRaycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
// Bullets Array
var Bullets = [];
var leftClick = false;
var rightClick = false;
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
	constructor(initPlanet){
		// Target Planet is the planet that the character is traveling towards
		// or has landed on. If he collides with a different planet on his way to
		// the planet he wanted to go to then the new planet will be his planet.
		this.planet = initPlanet;
		this.Height = 5;
		this.Group = new THREE.Group();
		this.canChangePlanet = true;

		// Initial Health Value of the player
		this.health = 100;


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
					camera.add(object);
					},
					undefined, // We don't need this function
					function (error) {
					  console.error(error);
			});
		});

		// Loads the Characters model
		// Load a glTF resource
			/*loaderGLTF.load(
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
*/
		var geometry = new THREE.BoxGeometry(10,20,10);
		var material = new THREE.MeshPhongMaterial({ color: '#f96f42',
												 shading: THREE.FlatShading });
		this.mesh = new THREE.Mesh( geometry, material );

		// Cannon
		//var shape = new CANNON.Box(new CANNON.Vec3(20,20,20));
		var shape = new CANNON.Sphere(20);
		this.mesh.cannon = new CANNON.Body({ shape,
										mass: 1,
										material: ballMaterial });
		this.mesh.cannon.linearDamping = this.mesh.cannon.angularDamping = 0.41;

		this.mesh.castShadow = true;
		this.mesh.cannon.inertia.set(0,0,0);
		this.mesh.cannon.invInertia.set(0,0,0);

		// For things you want to add to the character
		this.mesh.add(this.Group);
		// set spawn position according to server socket message
		this.mesh.position.copy(this.planet.planet.position);
		this.mesh.position.x += 0;
		this.mesh.position.y += 0;
		this.mesh.position.z += 600;

		this.mesh.name = "Main";
		this.mesh.nickname = "DUDEMAN";



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
		this.clampMovement = false;////////////////////////////////////////should be applied to mesh

		// set no collisions with other players (mitigate latency issues)
		this.mesh.cannon.collisionResponse = 100;
		// collision handler
		this.mesh.cannon.addEventListener('collide', e => {
			var planet = null;
			PlanetClasses.forEach(function(p){
				if(p.cannon === e.body) planet = p;
			}
			);
			if(planet!=null){
				// Change this.planet if planet is not the target one
			}
		});
		// Player position variable
		this.position = this.mesh.position.clone();

		this.controls = new THREE.PointerLockControls(camera, document.body, this);
	}

	applyGravity(){
			var norm = this.planet.planet.position.clone().negate().add(this.mesh.position).normalize();
			var gravity = 9.8;
			// get unit (directional) vector for position
			this.mesh.cannon.applyImpulse(new CANNON.Vec3(norm.x*gravity ,
														 norm.z*gravity,
														 norm.y*gravity).negate(),
										 this.mesh.cannon.position);
	}

	updateCamera(){
		var up = this.planet.planet.position.clone().negate().add(this.mesh.position).normalize();
		// Position
		var position = this.mesh.position.clone().add(up.clone().multiplyScalar(35));

		camera.matrixAutoUpdate = false;
		camera.matrixWorld.setPosition(position);

		// Update player's position variable
		this.position = position;
	}

	alignObject(object, center){
				var localUp = center.clone().negate().add(object.position.clone()).normalize();
				var x= new THREE.Vector3(),y= new THREE.Vector3(),z = new THREE.Vector3();
				// Update the cameras z and y basis to that of the object.
				object.matrix.extractBasis(x,y,z);
				camera.matrixWorld.makeBasis(x,
					y.applyAxisAngle(x,this.controls.yAngle),
					z.applyAxisAngle(x,this.controls.yAngle)).setPosition(camera.position);
				object.matrixAutoUpdate = false;
				camera.matrixAutoUpdate = false;

				var poleDir = x.clone();

				var cross = new THREE.Vector3();
	      cross.crossVectors(poleDir,localUp);
	      var dot = localUp.dot(poleDir);
	      poleDir.subVectors(poleDir,localUp.clone().multiplyScalar(dot));

				object.matrix.makeBasis(poleDir.normalize(),localUp.normalize(),cross.normalize()).setPosition(object.position);
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
	getmeshData() {
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

	// Only takes in the planet class. This is called when the player clicks on
	// a different planet to travel to it.
	setPlanet(setPlanet){
		// Check if is already attached to another planet
		if(this.planet!==null) this.planet.remove(this.Group);
		this.planet = setPlanet;
		this.LandingPoint.set(setPlanet.x,setPlanet.y,setPlanet.z);
		this.LandedOnPlanet = false;
	}

	getIntersects(objects){
		// update the mouse variable
		var mouse = new THREE.Vector2();
		mouse.x = camera.position.x;
		mouse.y = camera.position.y;
		var x= new THREE.Vector3(),y= new THREE.Vector3(),z = new THREE.Vector3();
		// Update the cameras z and y basis to that of the object.
		camera.matrixWorld.extractBasis(x,y,z);

		// find intersections
		MouseRaycaster.setFromCamera( mouse, camera);
		return MouseRaycaster.intersectObjects( objects );
	}

	changePlanet(){
		var intersects = this.getIntersects( WorldObjects );

		// if there is one (or more) intersections
		if ( intersects.length > 0 && this.canChangePlanet)
		{
			console.log("We hit something");
			var PlanetName = intersects[0].object.name;
			var PlanetClass = null;
			PlanetClasses.forEach(function(planetObject){
				if(PlanetName === planetObject.planet.name){
					PlanetClass = planetObject;
				}
			});
			if(PlanetClass!=null && PlanetClass!=this.planet){
				console.log("We his a planet");
				this.switchPlanet(PlanetClass);
			}
		}
	}

	switchPlanet(PlanetClass){
		// Check if is already attached to another planet
		if(this.planet!==null) this.planet.remove(this.mesh);
		this.planet = PlanetClass;

		//this.planet.add(this.mesh);

		this.canChangePlanet = false;
		setTimeout(function(){this.canChangePlanet = true;},1000);
	}

	updateHealth(health){
		this.health = health;
	}

	animate(){
		this.applyGravity();
		this.alignObject(this.mesh,this.planet.planet.position);
		// receive and process controls and camera
		this.controls.Update();
		// sync THREE mesh with Cannon mesh
		// Cannon's y & z are swapped from THREE, and w is flipped
		this.setMeshPosition(this.mesh);
		this.setCannonPosition(this.mesh); // Not so sureabout these ones
		this.updateCamera();

		/*
		// Shooting Bullets
		if(leftClick){
			var endposition = new THREE.Vector3();
			var bulletIntersects = this.getIntersects(scene.children);

			if( bulletIntersects.length >0 ){
				endposition = bulletIntersects[0].point;
			}
			AnimateObject.push(new normalBullet(
										  {x:this.Group.position.x-1,
										  y:this.Group.position.y,
										  z:this.Group.position.z+3},
										  endposition));// GetFromCameraRaycast
		}*/

		// Update The Player's Health Value
		healthBar.updateHealth(this.health);


	}

	// getter function for the position variable
	getPosition(){
		return this.position;
	}
}
