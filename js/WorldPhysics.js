/* This function applies gravity between an object and a planet
 * It takes in the object and the planet it should gravitate towards.
 * The ratio is a value from zero to one. zero being the initial distance
 * from when the player was assigned to the planet and one being the player being
 * at the center of the planet.
 *
 * @param {type} object Mesh
 * @param {type} planet PlanetClass
 * @param {type} ratio  Float
 *
 **/
function applyGravity(object,planet,ratio){
	// Move character towards planet
	var c = object.position;
	var p = planet;
	var step = ratio*(Math.PI/2)+0.05;
	object.position.set( c.x + ((p.x - c.x)*step),// x
	c.y + ((p.y - c.y)*step),// y
	c.z + ((p.z - c.z)*step));// z
}