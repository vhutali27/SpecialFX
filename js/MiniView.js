//////////////////////////////////////////////////
// MiniView		                                //
//////////////////////////////////////////////////

// Global Variables
var miniVeiwRenderTarget;

function miniScene(){
    miniVeiwRenderTarget = new THREE.WebGLRenderer({canvas:miniViewCanvas})
}

function renderMiniView(){

    requestAnimationFrame( renderMiniView );
    miniVeiwRenderTarget.render( scene, orthoCamera );

}
