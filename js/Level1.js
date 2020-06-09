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
    /*S1 = new Planet( 400, woodenFloorMaterial, 0, 0, 0, "S2",scene);
    AnimateObject.push(S1);*/
    
    //S1.add(player.mesh);
    //S1.add(camera);
    
    S2 = new Planet(400, grassMaterial, 0, 2000, 0, "Surface2", scene);
    AnimateObject.push(S2);
    /*S3 = new Planet(400, grassMaterial, 0, -2000, 0, "Surface3", scene);
    AnimateObject.push(S3);*/
    
    /*S1.spawnTrees(30);
    S1.spawnRocks(25);*/
    S2.spawnTrees(30);
    S2.spawnRocks(25);
    /*S3.spawnTrees(30);
    S3.spawnRocks(25);*/
    
    //Stars
    var starGeometry = new THREE.SphereGeometry(8000, 50, 500);
    var starField = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starField);
    
    // create stars
    var particleCount = 5000,
      particles = new THREE.Geometry(),
      pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 2
      });
  
    for (var p = 0; p < particleCount; p++) {
      var pX = Math.random() * 1000 - 500,
          pY = Math.random() * 1000 - 500,
          pZ = Math.random() * 1000 - 500,
          particle = new THREE.Vector3(pX, pY, pZ);
          particle.normalize().multiplyScalar(Math.random() * 1000 + 600);
      // add it to the geometry
      particles.vertices.push(particle);
    }
  
    // create the particle system
    var particleSystem = new THREE.Points(
        particles,
        pMaterial);
  
    scene.add(particleSystem);
    
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
    
    var spotLight2 = new THREE.DirectionalLight(0xffffff);
    spotLight2.position.set(-60,-60,-60);
    scene.add(spotLight2);
}