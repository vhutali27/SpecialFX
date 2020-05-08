var scene, camera, renderer;
var mouseControls;

init();

function init() {
    scene = new THREE.Scene();
    var fov = 70; // field of view
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(fov, width/height, 0.1,1000000);
    camera.position.set(0,0,-4500); //initial camera position

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    //TO be able to move around with the mouse
    mouseControls = new THREE.OrbitControls(camera, renderer.domElement);
    mouseControls.addEventListener('change', renderer);
    mouseControls.enableDamping = true; // Used to give a false sense of weight
    // TODO you still need to add the update function in your animation loop
    mouseControls.dampingFactor = 1; // The damping factor
    mouseControls.maxDistance = 4500; // Max zoomout distance
    mouseControls.update();


    var materialArray = [];    
    //Pictures to be on each side of the cube
    var texture_front = new THREE.TextureLoader().load('images/sky-with-stars-illustration-957061.jpg');
    var texture_back = new THREE.TextureLoader().load( 'images/sky-with-stars-illustration-957061.jpg');
    var texture_up = new THREE.TextureLoader().load( 'images/sky-with-stars-illustration-957061.jpg');
    var texture_down = new THREE.TextureLoader().load( 'images/sky-with-stars-illustration-957061.jpg');
    var texture_right = new THREE.TextureLoader().load( 'images/sky-with-stars-illustration-957061.jpg');
    var texture_left = new THREE.TextureLoader().load( 'images/sky-with-stars-illustration-957061.jpg');

    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_front }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_back }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_down }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_right }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_left }));

    for (var i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
    var skyboxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000); // Creating the cube
    // Adding the textures to the Box
    skybox = new THREE.Mesh( skyboxGeometry, materialArray ); // Putting the textures (pictures) on the cube
    scene.add(skybox);

    animate();
}

function animate(){
    // render new frame
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}


function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


///////////////////////////////
// Lighting                  //
///////////////////////////////

function initLighting(){
    var directionalLight = new THREE.DirectionalLight(0Xffffff, 0.5); // parameters, color and intensity
    scene.add(directionalLight);
}