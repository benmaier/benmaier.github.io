"use strict";

const width = window.innerWidth;
const height = window.innerHeight;

const near_plane = 1;
const far_plane = 1000;
const camera_x = 50;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  20,
  width / height,
  near_plane,
  far_plane
);

camera.position.set(0, -camera_x, 50);
camera.lookAt(new THREE.Vector3(0,0,1));
camera.up = new THREE.Vector3(0,0,1);
var light = new THREE.PointLight( 0xffffff, 1, 1000 );
light.position.set( 0,0,100 );
scene.add( light );
scene.background = new THREE.Color(0xfffffa);

let colorsfull = [
0x666666
,0x1b9e77
,0xd95f02
,0x7570b3
,0xe7298a
,0x66a61e
,0xe6ab02
,0xa6761d
];

let colors = [
0xcccccc
,0xb3e2cd
,0xfdcdac
,0xcbd5e8
,0xf4cae4
,0xe6f5c9
,0xfff2ae
,0xf1e2cc
];

let pawn_geometry = get_pawn_geometry();
//let pawn_material = new THREE.MeshToonMaterial({color: 0x666666, reflectivity: 0});
let pawn_material = new THREE.MeshBasicMaterial({color: 0x666666, reflectivity: 0});
let pawn_infected_material = new THREE.MeshBasicMaterial({color: 0xFF8888});
let pawn_wuwu_material = new THREE.MeshBasicMaterial({color: 0x8888FF});
let pawn0 = new THREE.Mesh(pawn_geometry, pawn_wuwu_material);
let pawn1 = new THREE.Mesh(pawn_geometry, pawn_infected_material);
let pawn2 = new THREE.Mesh(pawn_geometry, pawn_infected_material);
pawn0.scale.set(0.3,0.3,0.3);
pawn1.position.set(1,-1,0);
pawn2.position.set(-1,1,0);
scene.add(pawn0);
scene.add(pawn1);
scene.add(pawn2);

let N = 1000;
let pawns = [pawn0,pawn1,pawn2];
let spaceWidth = 100;
for(let i=0; i<N; i++){
  let pawn = new THREE.Mesh(pawn_geometry, pawn_material);
  pawn.position.x = spaceWidth*(Math.random()-0.5);
  pawn.position.y = spaceWidth*(Math.random()-0.5);
  pawns.push(pawn);
  scene.add(pawn);
}


var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3(0,0,1);
//controls.update();


let nodes = [];
let links = [];

let frame = 0;
//camera.rotation.x = Math.PI/2;
let rate = 0.005;
let phase = 'initial_wait';
let camera_target_height_pointer = 1;
let transition_time_in_iterations = [3, 3, 3, 9];
let pause_time_in_iterations = 3;
let dx = 0.2;
let dy = 0.2;

function animate() {

	requestAnimationFrame( animate );

  pawns.forEach(function(p){
    p.position.x += dx*Math.random();
    p.position.y += dy*Math.random();
    if (p.position.x <= -spaceWidth/2){
      p.position.x += spaceWidth;
    }
    if (p.position.x > spaceWidth/2){
      p.position.x -= spaceWidth;
    }
    if (p.position.y <= -spaceWidth/2){
      p.position.y += spaceWidth;
    }
    if (p.position.y > spaceWidth/2){
      p.position.y -= spaceWidth;
    }
  });

	renderer.render( scene, camera );
  frame++;
}
animate()
