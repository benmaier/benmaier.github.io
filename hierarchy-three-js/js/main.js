var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 ); geometry.verticesNeedUpdate = true; 
var material = new THREE.MeshPhongMaterial( { color: 0x00ff55, /*transparent: true, opacity: 1 */} );
var cube = new THREE.Mesh( geometry, material );

scene.add( cube );

camera.position.z = 5;

var path = new THREE.Path();

	path.lineTo( 0, 0.8 );
	path.quadraticCurveTo( 0, 0.5, -0.2, 1 );
	path.lineTo( 1, 1 );

	var points = path.getPoints();

	var geometry = new THREE.BufferGeometry().setFromPoints( points );
	var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

	var line = new THREE.Line( geometry, material );
	scene.add( line );

var time = 0;

function animate() {

	requestAnimationFrame( animate );

  cube.geometry.verticesNeedUpdate = true;
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;
  cube.geometry.vertices[0].x = Math.sin(time*0.01);

	renderer.render( scene, camera );
  time++;
}
animate();
