//////////////////////////////////////////////////
// IN GAME OBJECT CREATION                      //
//////////////////////////////////////////////////

function LoadLevel1(scene){
    // Surface1
    var woodenFloorMaterial = new THREE.MeshPhongMaterial({
    //map: loader.load("images/woodenFloor.jpg"),
    color: 0x72f2f2,
    specular: 0xbbbbbb,
    shininess: 2
    });
    Surface1 = new BlockPlanet(150, 1500, woodenFloorMaterial, 0, -50, 0, "Surface1", scene);
    
    var ballMaterial = new THREE.MeshPhongMaterial({
    //map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
    color: 0xf2f2f2,
    specular: 0xbbbbbb,
    shininess: 2
    });
    AnimateObject.push(Surface1);
    /*Surface1.addCanister(true,0,0,2,Surface1);
    Surface1.addCanister(true,0,150,2,Surface1);
    Surface1.addCanister(true,150,0,2,Surface1);
    Surface1.addCanister(true,150,150,2,Surface1);*/
    Surface1.addObjObject("models/bucket/bucket.obj","models/bucket/bucket.mtl", true, 75, 75, 2, {x:0.15,y:0.15,z:0.15}, Surface1);
    
    //earth.addObject(getSquare(earthMaterial, 2),23,1,2);
    
    // Mars
    var grassMaterial = new THREE.MeshPhongMaterial({
    //map: loader.load("images/grass.jpg"),
    color: 0x464742,
    specular: 0xbbbbbb,
    shininess: 2
    });
    Surface2 = new BlockPlanet(150, 1500, grassMaterial, 0, 100, 0, "Surface2", scene);
    AnimateObject.push(Surface2);
    Surface2.addObjObject("models/steel_fence/fance.obj","models/steel_fence/fance.mtl",false,0,0,0, {x:5,y:5,z:5},Surface2);
    Surface2.addObjObject("models/birch/birch.obj","models/birch/birch.mtl", false, 75, 75, 0, {x:0.15,y:0.15,z:0.15},Surface2);
    
    //Stars
    var starGeometry = new THREE.SphereGeometry(1000, 50, 500);
    var starMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("/images/galaxy_starfield.png"),
    side: THREE.DoubleSide,
    shininess: 0
    });
    var starField = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starField);
    
    //////////////////////////////////////////////////
    // LIGHTING                                     //
    //////////////////////////////////////////////////
    
    // This was just lighting so we could test the game.
    // It is subject to change as we add more features.
    var ambientLight = new THREE.AmbientLight(0xf1f1f1);
    scene.add(ambientLight);
    
    var spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(60,60,60);
    scene.add(spotLight);
}