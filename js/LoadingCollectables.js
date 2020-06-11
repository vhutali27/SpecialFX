//////////////////////////////////////////////////
// LOADING MODELS                               //
//////////////////////////////////////////////////

var maxCollectable = 100; // cap on resources allowed in scene
var maxAmmo = 100;		//cap on ammo allowed in scene
var objectnum = 1; 			//total number of distinct items that can be generated



//randomise function
var resourceGroup = new THREE.Group();
var maxTheta = 0;
var maxPhi = 0;
var maxHeight = 1000;
var planetNum = 0;
function randomPlace(){
	 var num = 2;//Math.round(Math.random()* (3-1)+1);
	 var posTheta = Math.round(Math.random()* (maxTheta-(-maxTheta))+(-maxTheta));
	 var posPhi = Math.round(Math.random()* (87-maxPhi)+maxPhi);
	 var posHeight = Math.round(Math.random()* (maxHeight-(0))+(0));

	// //substitute shapes in switch with ammo/collectable models
	if (maxCollectable > 0){
		switch (num){
			case 1:{
				var torusGeometry = new THREE.TorusGeometry(0.25, 1, 60, 60);
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0xDAA520});
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);
				torus.castShadow =true;
				//torus.position.set(posTheta,posPhi,posHeight);
				scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;
				PlanetClasses[planetNum].addObject(torus,0,0,0);
				console.log("placed obj 1");
				break;
			}
			case 2:{
				//adding new cannon bodies
				var resource = new collectable
				resourceGroup.add(resource);
				maxCollectable -= resource.collectableScore;
				

				//torus.addEventListener('onCollide',Collision,false);
				break;
			}
			default:{
				var torusGeometry = new THREE.TorusGeometry(0.25, 1, 60, 60);
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);
				torus.castShadow =true;
				//torus.position.set(posTheta,posPhi,posHeight);
				//scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;
				PlanetClasses[planetNum].addObject(torus,0,0,0);
				console.log("placed obj 3");
				break;
			}
		}
	}
}

function Collision(){
	//remove torus
	scene.remove(torus);
	//add collectable to player
	player.playerCollectable -=-1;
	console.log("player has ", player.playerCollectable, " collectables");
	//add collectable back to max collectable
	maxCollectable -=- 5;
}

/*
				
				torus.castShadow =true;
				//torus.position.set(posTheta,posPhi,posHeight);
				scene.add(torus);
				WorldObjects.push(torus);
				maxCollectable -= 5;
				PlanetClasses[planetNum].addObject(torus,0,0,0);*/


class collectable{
	constructor(){
		var collectableScore = 5;
		var mass = 0;
				//var physicsMaterial = new CANNON.Material("orbMaterial");
				//var physicsContactMaterial = new CANNON.ContactMaterial(groundMaterial,groundMaterial,{friction:0.4,restitution:0.0});
				//world.addContactMaterial(physicsContactMaterial);
				//var otherMaterial = new CANNON.Material("playerMaterial");
				//var secondContactMaterial = new CANNON.ContactMaterial(groundMaterial,ballMaterial,0.0,0.9);
				//world.addContactMaterial(secondContactMaterial);
				var halfExtents = new CANNON.Vec3(5,5,5);
				var boxShape = new CANNON.Box(halfExtents);
				var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
				var boxBody = new CANNON.Body({boxShape,mass,material: ballMaterial});
				var phongMaterial = new THREE.MeshPhongMaterial({color: 0x0088dd});
				var torusGeometry = new THREE.TorusGeometry(1, 1, 60, 60);
				var torus = new THREE.Mesh(torusGeometry, phongMaterial);

				//creating cannon body
				this.torus.cannon = new CANNON.Body({boxShape,mass,material: ballMaterial});
				this.torus.cannon.linearDamping = this.torus.cannon.angularDamping = 0.41;
				this.torus.castShadow = true;
				this.torus.position.set(posTheta,posPhi,posHeight);
				this.torus.name = "collectable";
				this.torus.nickname = "resource";

				//adding cannon body
				this.torus.cannon.position.set(posTheta,posHeight,posPhi);
				this.torus.cannon.quaternion.x = -this.torus.quaternion.x;
				this.torus.cannon.quaternion.z = -this.torus.quaternion.y;
				this.torus.cannon.quaternion.y = -this.torus.quaternion.z;
				this.torus.cannon.quaternion.w = this.torus.quaternion.w;

				scene.add(torus);
				world.add(torus.cannon);

				PlanetClasses[planetNum].addObject(torus,posTheta,posPhi,posHeight);
				//PlanetClasses[planetNum].addCanister(posTheta,posPhi,posHeight);
				torus.position.set(PlanetClasses[planetNum].radius+posTheta,posPhi,posHeight);
				scene.add(torus);
				console.log("placed obj 2");
	}

}