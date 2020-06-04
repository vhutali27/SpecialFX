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