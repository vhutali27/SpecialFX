/////////////////////////////////////////////////////////
// BULLET TYPES
/////////////////////////////////////////////////////////

class normalBullet{
    constructor( startPoint, endPoint){
        this.bullet = new THREE.Mesh(
					new THREE.SphereGeometry(2,4,4),
					new THREE.MeshBasicMaterial({color:0xffffff})
		);
        
        
        this.bullet.alive = true;
        this.endPoint = new THREE.Vector3(endPoint.x,endPoint.y,endPoint.z);
        this.startPoint = new THREE.Vector3(startPoint.x,startPoint.y,startPoint.z);
        this.bullet.position.set(startPoint.x,startPoint.y,startPoint.z);
        scene.add(this.bullet);
    }
    
    animate(){
        var distance = this.bullet.position.distanceTo(this.endPoint);
        var distanceBullet = this.bullet.position.distanceTo(this.startPoint);
        // if Bullet has reached the boundaries of a level then it
        // should be destroyed.
        if(distanceBullet>=this.endPoint.distanceTo(this.startPoint)){
            this.bullet.alive = false;
			scene.remove(this.bullet);
            var index = AnimateObject.indexOf(this);
            if( index > -1 ){
                AnimateObject.splice(index, 1);
            }
        }
        // Move Bullet towards point
		var step = 1 - (distance - 1)/distance;
		applyGravity(this.bullet,this.endPoint,step);
    }
}