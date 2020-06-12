/////////////////////////////////////////////////////
// LOADING SCREEN                                  //
/////////////////////////////////////////////////////

var blocker = document.getElementById( 'blocker' );
blocker.style.display = 'none';

//////////////////////////////////////////////////
// Renderer                                     //
//////////////////////////////////////////////////
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor( 0x000000 );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight, false);
document.body.appendChild(renderer.domElement);
// shading
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000),
	starGeometry: new THREE.Geometry(),
	stars: null,
	//sprite: new THREE.TextureLoader().load('star.png'),
	starMaterial: null
};

var LOADING_MANAGER = null;
var RESOURCES_LOADED = false;

loadingScreen.camera.z = 1;
loadingScreen.camera.rotation.x = Math.PI/2;
for(let i = 0; i< 6000; i++){
	star = new THREE.Vector3(
		Math.random()*600-300,
		Math.random()*600-300,
		Math.random()*600-300
	);
	star.velocity = 0;
	star.acceleration = 0.2;
	loadingScreen.starGeometry.vertices.push(star);
}

loadingScreen.starMaterial = new THREE.PointsMaterial({
	color: 0xaaaaaa, size: 0.7 //,map:loadingScreen.sprite
});
loadingScreen.stars = new THREE.Points(loadingScreen.starGeometry,loadingScreen.starMaterial);
loadingScreen.scene.add(loadingScreen.stars);

loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function(){
	blocker.style.display = '-webkit-box';
	blocker.style.display = '-moz-box';
	blocker.style.display = 'box';
	RESOURCES_LOADED=true;
};

var renderLoadingScreen = function(){
	if(!RESOURCES_LOADED){
		requestAnimationFrame(renderLoadingScreen);

		// You can add scene animations here
		loadingScreen.starGeometry.vertices.forEach(p=>{
			p.velocity += p.acceleration;
			p.y -= p.velocity;
			if(p.y <-200){
				p.y = 200;
				p.velocity=0;
			}
		});
		loadingScreen.starGeometry.verticesNeedUpdate = true;
		loadingScreen.stars.rotation.y += 0.002;
		renderer.render(loadingScreen.scene ,loadingScreen.camera);
	}
};
//window.setInterval(renderLoadingScreen,0);
renderLoadingScreen();

//////////////////////////////////////////////////
//RANDOM DUMMY OBJECTS                          //
//////////////////////////////////////////////////

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

//Objects (We build a mesh using a geometry and a material)

var Trees = new Array();
var Rocks = new Array();

function getObj(oPath, oMaterial , xScale, yScale, zScale){
	return {path: oPath, materialPath: oMaterial,x:xScale,y:yScale,z:zScale};
}

function getSummerTree(){
	return getObj("models/Nature/Plants/Tree(Summer)/TreeSummer.obj",
				  "models/Nature/Plants/Tree(Summer)/TreeSummer.mtl",
				  8,
				  8,
				  8);
}
Trees.push(getSummerTree());

function getWinterTree(){
	return getObj("models/Nature/Plants/Tree(Winter)/TreeWinter.obj",
				  "models/Nature/Plants/Tree(Winter)/TreeWinter.mtl",
				  8,
				  8,
				  8);
}
Trees.push(getWinterTree());

function getFallTree(){
	return getObj("models/Nature/Plants/Tree(Fall)/TreeFall.obj",
				  "models/Nature/Plants/Tree(Fall)/TreeFall.mtl",
				  8,
				  8,
				  8);
}
Trees.push(getFallTree());

function getDeadTree(){
	return getObj("models/Nature/Plants/Tree(Dead)/TreeDead.obj",
				  "models/Nature/Plants/Tree(Dead)/TreeDead.mtl",
				  8,
				  8,
				  8);
}
Trees.push(getDeadTree());

function getCactus(){
	var scale = 6;
	return getObj("models/Nature/Plants/Cactus/Cactus.obj",
				  "models/Nature/Plants/Cactus/Cactus.mtl",
				  scale,
				  scale,
				  scale);
}
Trees.push(getCactus());

function getTent(){
	return getObj("models/Nature/Props/Tent/Tent.obj",
				  "models/Nature/Props/Tent/Tent.mtl",
				  8,
				  8,
				  8);
}
Rocks.push(getTent());

function getBoulderAndSnow(){
	return getObj("models/Nature/Rocks/Boulder&Snow/Boulders.obj",
				  "models/Nature/Rocks/Boulder&Snow/Boulders.mtl",
				  8,
				  8,
				  8);
}
Rocks.push(getBoulderAndSnow());

function getPebblesAndSnow(){
	return getObj("models/Nature/Rocks/Pebbles&Snow/Pebbles.obj",
				  "models/Nature/Rocks/Pebbles&Snow/Pebbles.mtl",
				  8,
				  8,
				  8);
}
Rocks.push(getPebblesAndSnow());

function getRocksAndSnow(){
	return getObj("models/Nature/Rocks/Rocks&Snow/Rocks.obj",
				  "models/Nature/Rocks/Rocks&Snow/Rocks.mtl",
				  8,
				  8,
				  8);
}
Rocks.push(getRocksAndSnow());

function getBucket(){
	return getObj("models/bucket/bucket.obj", "models/bucket/bucket.mtl",
				  0.15,
				  0.15,
				  0.15);
}
