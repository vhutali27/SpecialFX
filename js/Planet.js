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
  constructor( width, depth, planetMaterial, x, y, z, name, scene){
    var planetGeometry = new THREE.BoxGeometry( width, 2, depth );
    this.width = width;
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.z = z;
     
    // Array for movable objects
    this.movableObjects = new Array();
    
    // Planet Orbit Variables
    this.orbitAroundCenter = false;
    this.r = this.y;
    this.theta = 0;
    this.dTheta = 2 * Math.PI / 1000;
    
    this.planet = new Physijs.BoxMesh(planetGeometry, planetMaterial);
    this.scene = scene;
	// pivot is the planets group. It holds all the objects that are affected by the planet's
	// gravitational field. If you make an object and want to add it to the planet, you have to
	// add it to the planets pivot. It will move the object with regards to the planets rotation and orbit.
	this.pivot = new THREE.Group();
	this.pivot.position.set(x, y, z);
	this.pivot.add(this.planet);
	this.planet.position.set(x, 0, z);
	this.planet.name = name;
  this.pivot.name = name;
  this.scene.add(this.pivot);
	WorldObjects.push(this.planet);
  PlanetClasses.push(this);
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
  
  addFBXObject(objectPath,onTop,x,z,height,planet){
    var path = objectPath.path;
    loader.load( path, function ( object ) {

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );

					if(onTop === true){height=1 + height;}
          else {height=-1 - height; object.rotation.z+=Math.PI;}
          object.scale.set(objectPath.x,objectPath.y,objectPath.z);
          object.position.set(planet.x+x - planet.width/2, height,planet.z+z - planet.depth/2);
          planet.addToPivot(object);

				});
  }

  addObjObject(objectPath, onTop, x, z, height){
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
			function (object) {
				if(onTop === true){height=1 + height;}
				else {height=-1 - height; object.rotation.z+=Math.PI;}
				object.scale.set(objectPath.x,objectPath.y,objectPath.z);
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
  
  centerOrbit(boolVal){
    this.orbitAroundCenter = boolVal;
  }
  
  // Object that can move with the planet and be removed
  add(obj){
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