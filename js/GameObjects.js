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
