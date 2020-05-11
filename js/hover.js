
	var canvas = document.getElementById("glcanvas");
	
	var renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor("purple"); 
    document.body.appendChild( renderer.domElement ); 
	
	var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 1, 1000 );
    camera.position.z = 5;
      
	var light = new THREE.DirectionalLight();
    light.position.set(0, 0, 1);
    scene.add(light);
	
	var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var boxMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var cube = new THREE.Mesh( boxGeometry, boxMaterial );
    scene.add( cube );
	cube.position.set(0, 1, 0);
    cube.rotation.set(-1, 0, 0);

    var planeGeometry = new THREE.PlaneGeometry( 6, 6 );
    var planeMaterial = new THREE.MeshPhongMaterial( {color: 0xff0000, side: THREE.DoubleSide} );  
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    scene.add( plane );
	plane.rotation.set(-1, 0, 0);

    var bool = false;
	
	var btn = document.getElementById("clickbait"); 
	btn.onclick = function() {
		bool = true;
	}
	
	function hover() {
		if(bool == true) {
			animated();
		}
		
	}
	
    function animated() {	
		cube.rotation.x += 0.025;
		cube.rotation.y += 0.025;
		cube.translateY(0.025);
	}

    function animate() {
	    requestAnimationFrame( animate );
		hover();
	    renderer.render( scene, camera );
    }
    animate();

