//Camera, scene, and renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 2000);
scene.add(camera);
camera.position.set(0,35,70);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Orbit Controls
var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

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
earth.addObject(getSphere(ballMaterial, 2, 48),23,0,0);
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
var starGeometry = new THREE.SphereGeometry(1000, 50, 50);
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

//Camera vector
var earthVec = new THREE.Vector3(0,0,0);

var r = 35;
var theta = 0;
var dTheta = 2 * Math.PI / 1000;

var dx = .01;
var dy = -.01;
var dz = -.05;



//Render loop
var render = function() {
          earth.rotatePlanet(0.01,0);
          mars.rotatePlanet(0,0.01);
          //Moon orbit
          theta += dTheta;
          moon.position.x = r * Math.cos(theta);
          moon.position.z = r * Math.sin(theta);

          //Flyby
          if (camera.position.z < 0) {
            dx *= -1;
          }
          camera.position.x += dx;
          camera.position.y += dy;
          camera.position.z += dz;

          camera.lookAt(earthVec);

          //Flyby reset
          if (camera.position.z < -100) {
            camera.position.set(0,35,70);
          }

          camera.lookAt(earthVec);
          renderer.render(scene, camera);
          requestAnimationFrame(render);
};
render();
