var scene, camera, renderer;
var up, down, left, right, mouse, raycaster, mouseControls; // Variables used to control character
var player;

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


    // Initialise player
    initPlayer();
    // Initialise Keyboard and Mouse Controls
    initControls();
    
    var materialArray = [];    
    //Pictures to be on each side of the SkyBox
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
    var skyboxGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000); // Creating the cube that'll be used for the skybox
    // Adding the textures to the Box
    skybox = new THREE.Mesh( skyboxGeometry, materialArray ); // Putting the textures (pictures) on the cube
    scene.add(skybox);

    animate();
}

function animate(){
    // render new frame
    renderer.render(scene,camera);
    requestAnimationFrame(animate);

    // Update player and camera position
    onAnimateControls();
    
}


function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

////////////////////////////////////////////////////
// PLAYER CHARACTER                               //
////////////////////////////////////////////////////
// TODO add character code here
// Using a cube to test Controls and Camera section

function initPlayer(){
    // Creating the cube that will be used in place of the character for testing
    var playerGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    var playerMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00});
    player = new THREE.Mesh( playerGeometry, playerMaterial);
    player.position.z = -4499;
    player.position.y = 1;
    player.position.x = 1;
    camera.position.z = player.position.z - 4000;
    camera.position.x = player.position.x - 400;
    camera.position.y = player.position.y;
    camera.lookAt(player.position);
    scene.add(player)
}


////////////////////////////////////////////////////
// COTNROLS AND CAMERA                            //
////////////////////////////////////////////////////
// initialiase controls
function initControls(){
    //TO be able to move around with the mouse
    mouseControls = new THREE.OrbitControls(camera, renderer.domElement);
    mouseControls.addEventListener('change', renderer);
    mouseControls.enableDamping = true; // Used to give a false sense of weight
    // TODO you still need to add the update function in your animation loop
    mouseControls.dampingFactor = 1; // The damping factor
    mouseControls.maxDistance = 4500; // Max zoomout distance

    document.addEventListener('mousemove', onMouseMove, false);

    // Initial Control Scheme
    up = 'W'.charCodeAt(0);
    down = 'S'.charCodeAt(0);
    left = 'A'.charCodeAt(0);
    right = 'D'.charCodeAt(0);
}

function onAnimateControls(){
    document.body.addEventListener('keydown', function(event){
        if (event.keyCode === down) onDown();
        if (event.keyCode === up) onUp();
        if (event.keyCode === left) onLeft();
        if (event.keyCode === right) onRight();
        // mouseControls.update();
    });

    // update the camera's position to follow the cube
    // values will need to be recalculated once map is included
    camera.position.z = player.position.z - 4000;
    camera.position.x = player.position.x - 400;
    camera.position.y = player.position.y;
}

// Keyboard control handlers
function onMouseMove(){
    // TODO
    // mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    // raycaster.setFromCamera( mouse, camera );
}

function onDown(){
    // Check that we are still within the limit
    if (player.position.z > -1000000) // Value will need to be recalculated for final skybox
        player.position.z -= 1;
}

function onUp(){
    // Check that we are still within the limit
    if (player.position.z < 1000000) // Value will need to be recalculated for final skybox
        player.position.z += 1;
}

function onLeft(){
    // Check that we are still within the limits
    if (player.position.x < 1000000) // Value will need to be recalculated for final skybox
        player.position.x += 1;
}

function onRight(){
    // Check we are still within the limits
    if (player.position.x > -1000000) // Value will need to be recalculated for final skybox
        player.position.x -= 1;
}