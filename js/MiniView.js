//////////////////////////////////////////////////
// MiniView		                                //
//////////////////////////////////////////////////

// Global Variables
var miniViewBox;
var miniViewCamera;
var miniVeiwRenderTarget;

// Initialise variables for the render to texture
function initMiniView() {
    // Dimensions of the box we'll be rendering to
    var miniViewWidth = 512;
    var miniViewHeight = 512;

    // The view we'll be rendering to
    miniVeiwRenderTarget = new THREE.WebGLRenderTarget(miniViewWidth, miniViewHeight);

    // variables for the camera
    var miniViewFov = 75;
    var miniViewAspectRatio = miniViewWidth / miniViewHeight;
    var miniViewNear = 0.1;
    var miniViewFar = 1000;
    miniViewCamera = new THREE.PerspectiveCamera(miniViewFov, miniViewAspectRatio, miniViewNear, miniViewFar);
    miniViewCamera.position.z = camera.position.z;

    // creating the mini view scene
    const miniViewScene = new THREE.Scene(); // use this if you want to create a specific scene separate from the main Scene
    miniViewScene.background = new THREE.Color("aqua");

    // creating the texture we'll be rendering to
    const miniViewBoxWidth = 1;
    const miniViewBoxHeight = 1;
    const miniViewBoxGeometry = new THREE.BoxGeometry(miniViewBoxWidth, miniViewBoxHeight);

    // maping the texture to the material to the texture
    const miniViewMaterial = new THREE.MeshPhongMaterial({
        map: miniVeiwRenderTarget,
    });

    miniViewBox = new THREE.Mesh(miniViewBoxGeometry, miniViewMaterial);
    scene.add(miniViewBox);
}

function renderMiniView(playerPos){
    console.log(playerPos)
    miniViewBox.position.set(playerPos['x'], playerPos['y'], playerPos['z']);
    miniViewBox.position.z;
    console.log("miniview position", miniViewBox.position)
    // render to target, then render to scene
    renderer.setRenderTarget(miniVeiwRenderTarget);
    renderer.render(scene, miniViewCamera);
    renderer.setRenderTarget(null);
}
