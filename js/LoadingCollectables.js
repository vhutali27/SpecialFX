//////////////////////////////////////////////////
// LOADING MODELS                               //
//////////////////////////////////////////////////

var maxCollectable = 100; // cap on resources allowed in scene
var maxAmmo = 100;		//cap on ammo allowed in scene
var objectnum = 1; 			//total number of distinct items that can be generated



//randomise function
var maxX = 80;
var maxY = 50;
var maxZ = 500;
function randomPlace(){
	 var num = Math.round(Math.random()* (3-1)+1);
	 var posx = Math.round(Math.random()* (maxX-(-maxX))+(-maxX));
	 var posy = Math.round(Math.random()* (87-50)+50);
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
		this.planet = planet;
    this.eaten = false;
    this.init();
  }

  init() {
    // Create THREE object based on initial data parameters
		var geometry;
		var material;
		var shape;
    if(this.isHealth){
			// Health
			geometry = new THREE.BoxBufferGeometry( 5, 5, 10 );
			material = new THREE.MeshPhongMaterial( {color: '#ff0000', shading: THREE.FlatShading} );
			shape = new CANNON.Box(new CANNON.Vec3(5 / 2, 5 / 2, 10 / 2));
		}
		else{
			// Energy
			geometry = new THREE.TetrahedronBufferGeometry( 5, 1 );
			material = new THREE.MeshPhongMaterial( {color: '#00ff00', shading: THREE.FlatShading} );
			shape = new CANNON.Sphere(5);
		}

    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.name = this.id;

    this.mesh.castShadow = true;

		// Create Cannon object based on initial data parameters
    this.mesh.cannon = new CANNON.Body({ shape, mass: 0, material: groundMaterial });
		world.add(this.mesh.cannon);
    this.planet.addObject(this.mesh,Math.random()*2*Math.PI,Math.random()*2*Math.PI,15,true);

    this.mesh.cannon.collisionResponse = 0;


    this.mesh.cannon.addEventListener('collide', e => {

			this.box = new THREE.Box3().setFromObject(this.mesh);
      // ensure food has not already been eaten and that collision was between own player and food
			console.log("Touched");
      if (!this.eaten) {
          for (let contact of world.contacts) {
            let foodHits = contact.bi === this.mesh.cannon;
            let playerIsHit = contact.bj === player.cannon;
            let playerHits = contact.bi === player.cannon;
            let foodIsHit = contact.bj === this.mesh.cannon;
            if (foodHits && playerIsHit || playerHits && foodIsHit) {
                this.eaten = true;
                scene.remove(this.mesh);
								world.remove(this.mesh.cannon);
								var index = this.planet.collectables.indexOf(this);
						    if( index > -1 ){
						        this.planet.collectables.splice(index, 1);
						    }
            }
          }
      }
    });
  }
}
