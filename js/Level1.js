//////////////////////////////////////////////////
// IN GAME OBJECT CREATION                      //
//////////////////////////////////////////////////

function LoadLevel1(scene){
    ////////////////////////////////////////////
    // MATERIALS
    ////////////////////////////////////////////
    var grassMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("images/grass.jpg"),
    color: 0x464742,
    specular: 0xbbbbbb,
    shininess: 2
    });
    var woodenFloorMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("images/woodenFloor.jpg"),
    color: 0x72f2f2,
    specular: 0xbbbbbb,
    shininess: 2
    });
    var ballMaterial = new THREE.MeshPhongMaterial({
    //map: new THREE.ImageUtils.loadTexture("images/texture1.jpg"),
    color: 0xf2f2f2,
    specular: 0xbbbbbb,
    shininess: 2
    });
    var starMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("/images/galaxy_starfield.png"),
    side: THREE.DoubleSide,
    shininess: 0
    });
    
    //////////////////////////////////////////////////
    // SURFACES
    //////////////////////////////////////////////////
    S1 = new BlockPlanet(1000, 1000, woodenFloorMaterial, 1000, 0, 0, "Surface1", scene);
    AnimateObject.push(S1);
    S2 = new BlockPlanet(1000, 1000, grassMaterial, 0, 1000, 0, "Surface2", scene);
    AnimateObject.push(S2);
    S3 = new BlockPlanet(1000, 1000, grassMaterial, 0, -1000, 0, "Surface3", scene);
    AnimateObject.push(S3);
    S2.centerOrbit(true);
    S3.centerOrbit(true);
    
    for(var i  = 0; i<6 ; i+=1){
        S1.addObjObject(getCactus(), true, i*900/6, i*900/6, 0);
    }
    
    S2.addObjObject(getBoulderAndSnow(), false, 20 ,20, 0);
    
    //Stars
    var starGeometry = new THREE.SphereGeometry(4000, 50, 500);
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