var fov = 75;
var width = window.innerWidth;
var height = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement);
camera.position.z = 5; // For Testing
var up = 'W'.charCodeAt(0);
var down = 'S'.charCodeAt(0);
var left = 'A'.charCodeAt(0);
var right = 'D'.charCodeAt(0);


document.body.addEventListener('keydown', function(event){
    if (event.keyCode === down) onDown();
    if (event.keyCode === up) onUp();
    if (event.keyCode === left) onLeft();
    if (event.keyCode === right) onRight();
});

function onDown(){
    // TODO update the camera and the character position
    camera.position.z += 0.1;
    console.log(down);
}
function onUp(){
    // TODO update the camera and the character position
    camera.position.z -= 0.1;
    console.log(up);
}
function onLeft(){
        // TODO update the camera and the character position
    camera.position.x -= 0.1;
    console.log(left);
}
function onRight(){
        // TODO update the camera and the character position
    camera.position.x += 0.1;
    console.log(right);
}

function upDateControls(){
        // TODO update the camera and the character position
    // For now you can use a prompt, however later you will need to move this to the in-game menu
    var key = prompt("Enter Key To Update");
    /* 
        Once A key has been entered, you want to search for it's eqiuvalent
        Then take in the new key to replace it with
        And check that the new is not registered to something else
    */
}


// All javascript code that follows is solely for testing purposes
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( {color: 0X00ff00});
var cube = new THREE.Mesh( geometry, material);
scene.background = new THREE.Color(0xf0f0f0);
scene.add(cube);
var animate =  function(){
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera)
};


animate();
