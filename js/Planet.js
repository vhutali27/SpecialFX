// Class for Planes
class Planet{
  constructor( radius, planetMaterial, x, y, z, name, scene){
    /*
    // to create the world add this to your main script
    // initialize Cannon world
    this.world = new CANNON.World();
    this.world.gravity.set(x, y, z);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    */
    // Each world should have its own world.
    
    var planet_geometry = new THREE.TetrahedronBufferGeometry( radius, 4 );
    var planet_material = new THREE.MeshPhongMaterial( { color: '#9f8d4a', shading: THREE.FlatShading});
    this.planet = new THREE.Mesh( planet_geometry, planet_material );
    
    this.planet.receiveShadow = true;
    
    scene.add(this.planet);
    
    // create Cannon planet
    var planetShape = new CANNON.Sphere(radius);
    this.planet.cannon = new CANNON.Body({ mass: 0, material: groundMaterial, shape: planetShape });
    world.add(this.planet.cannon);
    // Should be this.world.add()
     
    // Array for movable objects
    this.movableObjects = new Array();
    
    this.radius = radius;
    
    // Planet Orbit Variables
    this.orbitAroundCenter = false;
    this.r = this.y;
    this.theta = 0;
    this.dTheta = 2 * Math.PI / 1000;
    this.scene = scene;
    
    // pivot is the planets group. It holds all the objects that are affected by the planet's
    // gravitational field. If you make an object and want to add it to the planet, you have to
    // add it to the planets pivot. It will move the object with regards to the planets rotation and orbit.
    this.pivot = new THREE.Group();
    this.pivot.position.copy(this.planet.position);
    this.planet.add(this.pivot);
    this.planet.name = name;
    this.pivot.name = name;
    WorldObjects.push(this.planet);
    PlanetClasses.push(this);
  }

  addObject( obj, theta, phi, height){
   var SphereCoords = new THREE.Spherical(this.radius + height , theta,phi );
   var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
   obj.quaternion.multiply(obj.quaternion.setFromUnitVectors(obj.position.normalize(),vec.normalize()));
   obj.position.set(vec);
   this.addToPivot(obj);
  }
  
  addToPivot(obj){
		var coords = {x:obj.position.x, y:obj.position.y, z: obj.position.z};
		var rotat = {x:obj.rotation.x, y:obj.rotation.y, z: obj.rotation.z};
		this.pivot.add(obj);
		obj.position.set(coords.x,coords.y,coords.z);
		obj.rotation.set(rotat.x,rotat.y,rotat.z);
	}
  
  addFBXObject(objectPath,theta, phi, height){
    var SphereCoords = new THREE.Spherical(this.radius + height , theta,phi );
    var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
    var path = objectPath.path;
    var planet = this;
    loader.load( path, function ( obj ) {

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );
          obj.scale.set(objectPath.x,objectPath.y,objectPath.z);
          obj.quaternion.multiply(obj.quaternion.setFromUnitVectors(obj.position.normalize(),vec.normalize()));
          obj.position.set(vec);
          planet.addToPivot(obj);
				});
  }

  addObjObject(objectPath, theta, phi, height){
    var SphereCoords = new THREE.Spherical(this.radius + height , theta,phi );
    var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
    var path = objectPath.path;
    var materialPath = objectPath.materialPath;
    var planet = this;
    // Loads the material
    loaderMTL.load(materialPath, function ( materials ) {
      materials.preload();
      var loaderOBJ = new THREE.OBJLoader();
      loaderOBJ.setMaterials(materials);
      loaderOBJ.load(
        path,
        function (obj) {
          obj.scale.set(objectPath.x,objectPath.y,objectPath.z);
          obj.quaternion.multiply(obj.quaternion.setFromUnitVectors(obj.position.normalize(),vec.normalize()));
          obj.position.set(vec);
          planet.addToPivot(obj);
          },
          undefined, // We don't need this function
          function (error) {
            console.error(error);
        });
    });
  }

  addCanister(theta, phi, height){
    var SphereCoords = new THREE.Spherical(this.radius + height , theta,phi );
    var vec = new THREE.Vector3().setFromSpherical(SphereCoords);
    var planet = this;
    
    // Load a glTF resource
    loaderGLTF.load(
      // resource URL
      'models/character.glb',
      // called when the resource is loaded
      function ( gltf ) {
        //scene.add( gltf.scene );
        var obj = gltf.scene;
        //obj.scale.set(objectPath.x,objectPath.y,objectPath.z);
        obj.quaternion.multiply(obj.quaternion.setFromUnitVectors(obj.position.normalize(),vec.normalize()));
        obj.position.set(vec);
        planet.addToPivot(obj);
      },
      undefined, // We don't need this function
      function (error) {
        console.error(error);
      }
    );
  }
  
  centerOrbit(boolVal){
    this.orbitAroundCenter = boolVal;
  }
  
  // Object that can move with the planet and be removed
  add(obj){ // Needs further thought
    this.movableObjects.push(obj);
  }
  
  remove(obj){
    var index = this.movableObjects.indexOf(obj);
    if( index > -1 ){
        this.movableObjects.splice(index, 1);
    }
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
    
    if(this.orbitAroundCenter){
      //Moon orbit
      this.theta += this.dTheta;
      var xTrans = this.r * Math.cos(this.theta) - this.pivot.position.x;
      var yTrans = this.r * Math.sin(this.theta) - this.pivot.position.y;

      this.movableObjects.forEach(function(object){object.position.x += xTrans;object.position.y += yTrans;});
      
      this.pivot.position.x += xTrans;
      this.pivot.position.y += yTrans;
    }
  }
}