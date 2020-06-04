//////////////////////////////////////////////////
// MiniView		                                //
//////////////////////////////////////////////////
// Dimensions of the box we'll be rendering to
//var miniViewWidth = 512;
//var miniViewHeight = 512;
//
//// The view we'll be rendering to
//const miniVeiwRenderTarget = new THREE.WebGLRenderTarget(miniViewWidth, miniViewHeight);
//
//// variables for the camera
//var miniViewFov = 75;
//var miniViewAspectRatio = miniViewWidth/miniViewHeight;
//var miniViewNear = 0.1;
//var miniViewFar = 1000;
//const miniViewCamera = new THREE.PerspectiveCamera(miniViewFov, miniViewAspectRatio, miniViewNear, miniViewFar);
//miniViewCamera.position.z = camera.position.z;
//
//// creating the mini view scene
//const miniViewScene = new THREE.Scene(); // use this if you want to create a specific scene separate from the main Scene
//miniViewScene.background = new THREE.Color("aqua");
//
//// creating the texture we'll be rendering to
//const miniViewBoxWidth = 1;
//const miniViewBoxHeight = 1;
//const miniViewBoxGeometry = new THREE.BoxGeometry(miniViewBoxWidth, miniViewBoxHeight);
//
//// maping the texture to the material to the texture
//const miniViewMaterial = new THREE.MeshPhongMaterial({
//    map: miniVeiwRenderTarget,
//});
//
//var miniViewBox = new THREE.Mesh(miniViewBoxGeometry, miniViewMaterial);
//scene.add(miniViewBox);


// Please add these in an animate function inside a miniView class so it can flow with the main program code
// The playerPos variable should also be changed in the animate function in the class of the player class where the map is
// initialized (or an instance of a class is created)

// Keep track of the players positon
//var playerPos;
// Update the position of the texture we are going to render to
		// TODO: orientate the texture so that it's always facing the camera
		//playerPos = player.getPosition();


//miniViewBox.position.set(playerPos['x'], playerPos['y'], playerPos['z']);
//miniViewBox.position.z += 3;
//
//// render to target, then render to scene
//renderer.setRenderTarget(miniVeiwRenderTarget);
//renderer.render(scene, miniViewCamera);
//renderer.setRenderTarget(null);