//Camera, scene, and renderer
var scene = new THREE.Scene();
//var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
//scene.add(camera);
//camera.position.set(0,35,70);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor( 0xffffff );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener( 'resize', onWindowResize, false );

//Orbit Controls
//var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

//Lights
var ambientLight = new THREE.AmbientLight(0xf1f1f1);
scene.add(ambientLight);

var spotLight = new THREE.DirectionalLight(0xffffff);
spotLight.position.set(60,60,60);
scene.add(spotLight);

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
	var obj = new THREE.Mesh(geometry, material);
	obj.castShadow = true;
	return obj;
}

// Class for Player
class Player{

	constructor(){
		// Variables
		this.controlsEnabled = false;
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.canJump = false;
		this.prevTime = performance.now();
		this.velocity = new THREE.Vector3();
		// First Person Camera and Controls
		// init_player
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000);
		this.controls = new THREE.PointerLockControls( this.camera, document.body); // Not sure whi

		// Raycasting is used for working out which object the mouse is pointing at
		this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
		scene.add( this.controls.getObject() );

		this.onKeyDown = function ( event ) {
			switch ( event.keyCode ) {
				case 38: // up
				case 87: // w
					this.moveForward = true;
					break;
				case 37: // left
				case 65: // a
					this.moveLeft = true; break;
				case 40: // down
				case 83: // s
					this.moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					this.moveRight = true;
					break;
				case 32: // space
					//if ( canJump === true ) velocity.y += 350;
					this.canJump = false;
					break;
			}
		};
		this.onKeyUp = function ( event ) {
			switch( event.keyCode ) {
				case 38: // up
				case 87: // w
					this.moveForward = false;
					break;
				case 37: // left
				case 65: // a
					this.moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					this.moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					this.moveRight = false;
					break;
			}
		};
		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );
	}

	animate(){
		if(this.controlsEnabled){
			this.raycaster.ray.origin.copy( this.controls.getObject().position );
			this.raycaster.ray.origin.y -= 10;
		}
	}
}

// Class for planets
class Planet{

  /**
    * constructor
    * @params {type} radius Float
    * @params {type} widthSegments integer
    * @params {type}  heightSegments integer
    * @params {type} planetMaterial Material

    for Position
    * @params {type} x Float
    * @params {type} y Float
    * @params {type} z Float
  */
  constructor(radius, width, height, planetMaterial, x, y, z){
    var planetGeometry = new THREE.SphereGeometry(radius, width, height);

    this.radius = radius;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.z = z;

		this.player = null;
    this.planet = new THREE.Mesh(planetGeometry, planetMaterial);
    this.planet.position.set(x, y, z);
    scene.add(this.planet);

		// Stores all the objects added to the planet
    this.planetObjects = new Array();
  }

	/**
		* Attaches an object to the planet. This object will then experience
		* the gravitational forces of the planets
		* @param {type} obj Mesh
		* @param {type} r Float
		* @param {type} theta Float
		* @param {type} phi Float
	*/
  addObject(obj, r, theta, phi){
		var vector = new THREE.Vector3();
		var sphere = new THREE.Spherical(r,theta,phi)
		vector.setFromSpherical(sphere);
    obj.position.set(this.x + vector.x,this.y + vector.y, this.z+ vector.z);
    this.planetObjects.push({ObjectVar: obj, SphereCoordinate: sphere});
    scene.add(obj);
  }

	addPlayer(player, r, theta, phi){
		// Initialize the controls for the player. Each planet should have its own controlsEnable
		// because they all move at different speeds and in different orbits. The camera should move
		// along with the planet it is on. It should also be able to move around the given planet.
		// Each planet has its own size so the maths won't be the same.
		var vector = new THREE.Vector3();
		var sphere = new THREE.Spherical(r,theta,phi)
		vector.setFromSpherical(sphere);
    player.controls.getObject().position.set(this.x + vector.x,this.y + vector.y, this.z+ vector.z);
		this.player = {Player:player,SphereCoordinate: sphere,Radius:r};
	}

	// We are going to need to use polar coordinates
	/**
		* Function to rotate the planet
		* @param {type} theta Float
		* @param {type} phi Float
 	*/
  rotatePlanet(theta, phi){
    this.planet.rotation.x += theta;
    this.planet.rotation.y += phi;

    for(var i = 0; i<this.planetObjects.length; i++){
			var obj = this.planetObjects[i];
			obj.SphereCoordinate.theta += theta;
			obj.SphereCoordinate.phi += phi;

			var vector = new THREE.Vector3();
			vector.setFromSpherical(obj.SphereCoordinate);

      obj.ObjectVar.position.x = this.x + vector.x;
			obj.ObjectVar.position.y = this.y + vector.y;
      obj.ObjectVar.position.z = this.z + vector.z;
    }

		// Player Controls and Camera
		if(this.player!==null){
			var curPlayer = this.player.Player;

			if ( curPlayer.controlsEnabled ){
				//var intersections = raycaster.intersectObjects( objects );
				//var isOnObject = intersections.length > 0;


				this.player.SphereCoordinate.theta += theta;
				this.player.SphereCoordinate.phi += phi;

				var time = performance.now();
				var delta = ( time - curPlayer.prevTime ) / 1000;
				if ( curPlayer.moveForward ){
						this.player.SphereCoordinate.phi -= 400.0 * delta;
						console.log("You moved up");
				}
				else if ( curPlayer.moveBackward ) this.player.SphereCoordinate.phi += 400.0 * delta;
				if ( curPlayer.moveLeft ) this.player.SphereCoordinate.theta -= 0.1;
				else if ( curPlayer.moveRight ) this.player.SphereCoordinate.theta += 0.3;
				// if ( isOnObject === true ) {
				// 	velocity.y = Math.max( 0, velocity.y );
				// 	canJump = true;
				// }

				if ( this.player.SphereCoordinate.radius < this.player.Radius ) {
					//this.player.SphereCoordinate.radius = this.player.Radius;
					//curPlayer.canJump = true;
				}

				var vector = new THREE.Vector3();
				vector.setFromSpherical(this.player.SphereCoordinate);

				curPlayer.controls.getObject().position.x = this.x + vector.x;
				curPlayer.controls.getObject().position.y = this.y + vector.y;
				curPlayer.controls.getObject().position.z = this.z + vector.z;

				curPlayer.prevTime = time;
			}
		}
  }
}

// Mars
var earthMaterial = new THREE.MeshPhongMaterial({
//map: new THREE.ImageUtils.loadTexture("images/texture2.jpg"),
color: 0x72f2f2,
specular: 0xbbbbbb,
shininess: 2
});
var earth = new Planet(20, 50, 50, earthMaterial, 0, 0, 0);

var ballMaterial = new THREE.MeshPhongMaterial({
//map: new THREE.ImageUtils.loadTexture("images/texture6.jpg"),
color: 0xf2f2f2,
specular: 0xbbbbbb,
shininess: 2
});
earth.addObject(getSphere(ballMaterial, 2, 48),23,3,3);
earth.addObject(getSphere(earthMaterial, 2, 48),23,1,2);


// Mars
var marsMaterial = new THREE.MeshPhongMaterial({
//map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
color: 0x464742,
specular: 0xbbbbbb,
shininess: 2
});
var mars = new Planet(20, 50, 50, marsMaterial, 40, 40, 40);
mars.addObject(getSphere(earthMaterial, 2, 48),22,0,0);
mars.addObject(getSphere(ballMaterial, 2, 48),22,2,0);

//Stars
var starGeometry = new THREE.SphereGeometry(1000, 50, 500);
var starMaterial = new THREE.MeshPhongMaterial({
map: new THREE.ImageUtils.loadTexture("/images/galaxy_starfield.png"),
side: THREE.DoubleSide,
shininess: 0
});
var starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

//Moon
var moonGeometry = new THREE.SphereGeometry(3.5, 50,50);
var moonMaterial = new THREE.MeshPhongMaterial({
map: THREE.ImageUtils.loadTexture("/images/texture7.jpg")
});
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(45,20,0);
scene.add(moon);

// Initialize player
var player = new Player();

// Menu and Game Screen. FullScreenChange
var blocker = document.getElementById('blocker');
var instructions = document.getElementById( 'instructions' );
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {
		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			player.controlsEnabled = true;
			player.controls.enabled = true;
			blocker.style.display = 'none';
		} else {
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
	// instructions.addEventListener( 'click', function ( event ) {
	// 	instructions.style.display = 'none';
	// 	// Ask the browser to lock the pointer
	// 	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	// 	if ( /Firefox/i.test( navigator.userAgent ) ) {
	// 		var fullscreenchange = function ( event ) {
	// 			if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
	// 				document.removeEventListener( 'fullscreenchange', fullscreenchange );
	// 				document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
	// 				element.requestPointerLock();
	// 			}
	// 		};
	// 		document.addEventListener( 'fullscreenchange', fullscreenchange, false );
	// 		document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
	// 		element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
	// 		element.requestFullscreen();
	// 	} else {
	// 		element.requestPointerLock();
	// 	}
	// }, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
function onWindowResize() {
	player.camera.aspect = window.innerWidth / window.innerHeight;
	player.camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


earth.addPlayer(player,23,0,0);

// Planet Orbit Variables
var r = 35;
var theta = 0;
var dTheta = 2 * Math.PI / 1000;

//Render loop
var render = function() {
          earth.rotatePlanet(0.01,0);
          mars.rotatePlanet(0,0.01);
          //Moon orbit
          theta += dTheta;
          moon.position.x = r * Math.cos(theta);
          moon.position.z = r * Math.sin(theta);

					player.animate();

          renderer.render(scene, player.camera);
          requestAnimationFrame(render);
};
render();
