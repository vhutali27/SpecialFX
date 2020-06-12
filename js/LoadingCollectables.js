//////////////////////////////////////////////////
// LOADING MODELS                               //
//////////////////////////////////////////////////

var maxHealth = 100; // cap on resources allowed in scene
var maxAmmo = 100;		//cap on ammo allowed in scene
var planetNum = Math.round(Math.random()*PlanetClasses.length);
function randomPlace(){

	// //substitute shapes in switch with ammo/collectable models
	if (maxHealth > 0 && maxAmmo > 0){
			var resource = new Canister(id,PlanetClasses[planetNum],Math.round(Math.random()));
		}
		else if ( maxHealth > 0){
			var resource = new Canister(id,PlanetClasses[planetNum],true);
		}else if (maxAmmo > 0){
			var resource = new Canister(id,PlanetClasses[planetNum],false);
		}else{
			//a hold function
		}
}



// Health Pack
function getHealthPack(){
	var health_geometry = new THREE.TetrahedronBufferGeometry( 10, 4 );
	var health_material = new THREE.MeshPhongMaterial( { color: '#FF0000', shading: THREE.FlatShading});
	var health_mesh = new THREE.Mesh( health_geometry, health_material );

	health_mesh.receiveShadow = true;
	scene.add(health_mesh);

	// create Cannon mesh
	var heathShape = new CANNON.Sphere(10);
	health_mesh.cannon = new CANNON.Body({ mass: 20, material: groundMaterial, shape: heathShape });
	health_mesh.cannon.collisionResponse = 10;
	world.add(health_mesh.cannon);

	return health_mesh;
}

class Canister {
  constructor(id, planet, isHealth) {
    this.id = id;
	this.isHealth = isHealth;
    this.mesh;
		this.box;
		this.planet = planet;
    this.init();
  }

  init() {
    // Create THREE object based on initial data parameters
		var geometry;
		var material;
		var shape;
    if(this.isHealth){
			// Health
			maxHealth -= 5;
			geometry = new THREE.BoxBufferGeometry( 5, 5, 10 );
			material = new THREE.MeshPhongMaterial( {color: '#ff0000', shading: THREE.FlatShading} );
			shape = new CANNON.Box(new CANNON.Vec3(5 / 2, 5 / 2, 10 / 2));
		}
		else{
			// Energy
			maxAmmo -= 5;
			geometry = new THREE.TetrahedronBufferGeometry( 5, 1 );
			material = new THREE.MeshPhongMaterial( {color: '#00ff00', shading: THREE.FlatShading} );
			shape = new CANNON.Sphere(5);
		}

    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.name = this.id;

    this.mesh.castShadow = true;

    this.planet.addObject(this.mesh,Math.random()*2*Math.PI,Math.random()*2*Math.PI,15);
		this.mesh.lookAt(new THREE.Vector3(0,0,0));
		this.box = new THREE.Box3().setFromObject(this.mesh);
  }
}
