const width = window.innerWidth;
const height = window.innerHeight;

const near_plane = 1;
const far_plane = 200;
const camera_z = far_plane/2;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  20,
  width / height,
  near_plane,
  far_plane
);

camera.position.set(0, 0, camera_z);
camera.lookAt(new THREE.Vector3(0,0,0));
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

colors = [
0xcccccc
,0xb3e2cd
,0xfdcdac
,0xcbd5e8
,0xf4cae4
,0xe6f5c9
,0xfff2ae
,0xf1e2cc
];


var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.update();


let nodes = [];
let links = [];
let internalNodes = [];
let internalLinks = [];
let z_value_height = 0.3;
let nodeCircles = [];
let internalNodeCircles = [];
let internalLinkLines = [];
let link;
let last_transition; 

let scale = 15;

fetch('/power.json')
  .then(response => response.json())
  .then(function(data) {
    // graph 
    nodes = data.network.nodes.slice();
    links = data.network.links.map(l => [nodes[l.source], nodes[l.target]]);
    let N = nodes.length;
    nodeCircles = nodes.map(function(d,i){
      d.z = z_value_height; 
      let zoomScale = 1-d.z/camera_z; 
      d.x *= scale*zoomScale;
      d.y *= scale*zoomScale;
      d.radius *= scale*zoomScale;
      let geometry = new THREE.CircleGeometry(d.radius,20);
      let material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
      let circle = new THREE.Mesh( geometry, material );
      circle.position.x = d.x;
      circle.position.y = d.y;
      circle.position.z = d.z;
      scene.add(circle);
      return circle;
    });

    let geometry = new THREE.Geometry();
    links.forEach(function (d,i) {
      geometry.vertices.push(
                                  new THREE.Vector3(d[0].x, d[0].y, d[0].z-z_value_height/10),
                                  new THREE.Vector3(d[1].x, d[1].y, d[1].z-z_value_height/10)
                                );
    })
    let material = new THREE.LineBasicMaterial({
          color: 0x888888,
          linewidth: 1.5,
          linecap: 'round', //ignored by WebGLRenderer
          linejoin:  'round' //ignored by WebGLRenderer
    });

    link = new THREE.LineSegments(geometry, material);
    scene.add(link);

    let L = data.tree.graph.L;

    // tree
    internalNodes = data.tree.nodes.slice();
    nodeid_to_int = Object.fromEntries( data.tree.nodes.map( (n, i) => [ n.id, i ]));
    internalLinks = data.tree.links.map(l => [ internalNodes[nodeid_to_int[l.source]],
                                               internalNodes[nodeid_to_int[l.target]]
                                             ]
                                        );
    console.log(data.tree.links,nodeid_to_int);
    internalNodeCircles = internalNodes.map(function(d,i){
        let linewidth, this_color, segments;
        if (d.max_dist_to_leaf == 0)
        {
          linewidth = 1;
          d.z = 1.05*z_value_height; 
          this_color = 0x000000;
          segments = 10;
        }
        else
        {
          linewidth = 2.3;
          d.z = (L-d.level)*camera_z/(L+1)/6;           
          this_color = colorsfull[d.level];
          segments = 32;

        }
        let zoomScale = 1-d.z/camera_z; 
        d.x *= scale*zoomScale;
        d.y *= scale*zoomScale;
        d.radius *= scale*zoomScale;
        //d.z *= -1;
        let geometry = new THREE.CircleGeometry(d.radius,segments);
        geometry.vertices.shift()
        let material = new THREE.LineBasicMaterial( { color: this_color, linewidth:linewidth, transparent: true, opacity: 1 } );
        let circle = new THREE.LineLoop( geometry, material );
        circle.position.x = d.x;
        circle.position.y = d.y;
        circle.position.z = d.z;
        scene.add(circle);


       /*
        if (d.max_dist_to_leaf > 0)
        {
          let cylheight = camera_z/(L+1)/6;
          if (d.max_dist_to_leaf == 1)
          {
            cylheight *= (L-d.level);
            cylheight -= z_value_height;
          }
          let geometry2 = new THREE.CylinderGeometry(d.radius, 
                                                     d.radius,///zoomScale,
                                                     cylheight,
                                                     32,
                                                     1, //heightsegments
                                                     true // openended
                                                    )
          let material2 = new THREE.MeshBasicMaterial( { color: colors[d.level], transparent: true, opacity:0.4 } );
          let cyl = new THREE.Mesh(geometry2, material2);
          cyl.position.x = d.x;
          cyl.position.y = d.y;
          cyl.position.z = d.z-cylheight/2;
          cyl.rotation.x = Math.PI/2;
          scene.add(cyl)
        }
       
        */
        return circle;
    });

    internalLinkLines = internalLinks.map(function(l){
      let z_src = l[0].z;
      let zoomScale_src = 1-z_src/camera_z; 
      let z_trg = l[1].z;
      let zoomScale_trg = 1-z_trg/camera_z; 
      let src = new THREE.Vector3(l[0].x, l[0].y, l[0].z);
      let trg = new THREE.Vector3(l[1].x, l[1].y, l[1].z);      
      let zdiff = l[1].z - l[0].z;
      let ctrl0 = new THREE.Vector3(src.x, src.y, src.z + zdiff/3);
      let ctrl1 = new THREE.Vector3(trg.x, trg.y, trg.z - zdiff/3);
      let curve = new THREE.CubicBezierCurve3(
          src, ctrl0, ctrl1, trg
      );

      let points = curve.getPoints( 10 );
      let geometry = new THREE.BufferGeometry().setFromPoints( points );
      let material = new THREE.LineBasicMaterial( { color : colorsfull[l[0].level], transparent: true, opacity: 0 } );
      let curveObject = new THREE.Line( geometry, material );
      scene.add(curveObject);
      return curveObject;
    });

    //const nodeContainer = new THREE.Object3D();
    //nodeContainer.add(nodeCircles);
    //scene.add(nodeContainer);
    last_transition = Date.now() / 1000;
    animate();
  })

let time = 0;
camera.rotation.x = Math.PI/2;
let rate = 0.005;
let phase = 'initial_wait';
let camera_target_height_pointer = 1;
let camera_values = [4, 5.72, 8.634, 11.16, camera_z];
let transition_time_in_iterations = [3, 3, 3, 9];
let pause_time_in_iterations = 3;


if (phase.includes('initial'))
  camera.position.set(0,0,camera_values[camera_target_height_pointer-1]);

function animate() {

	requestAnimationFrame( animate );

  //camera.position.set(0,-(0.5*Math.cos(rate*time+Math.PI)+0.5)*100,100*Math.pow(Math.cos(rate*time+Math.PI),2));
  //camera.position.set(0,-Math.pow(Math.sin(rate*time+Math.PI),2)*100,100*Math.pow(Math.cos(rate*time+Math.PI),2));
  //camera.lookAt(new THREE.Vector3(0,0,0));
  //camera.lookAt(0,0,0);
  set_camera_position(time);
  controls.update();
  internalLinkLines.forEach( function(l) {
    if (phase.includes('initial'))
    {
      l.visible = false;
    }
    if (phase == 'transition_to_tree')
    {
      l.material.opacity = 1-camera.position.z/camera_z;
      l.visible = (l.material.opacity > 0.1)
    }

    //if (l.material.opacity > 0.5)
    //  l.renderOrder = 2;
    //else
    //  l.renderOrder = 1;
  });
  if (phase.includes('initial'))
  {
    nodeCircles.forEach( function(c,i) {
      let d = nodes[i];
      let defaultScale = (1-d.z/camera_z);
      let newScale = (1-d.z/camera.position.z);

      if (c.position.z < camera.position.z) {
        c.position.x = d.x / defaultScale * newScale;
        c.position.y = d.y / defaultScale * newScale;
        c.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);
      }
    });
    let z = nodes[0].z - z_value_height/10;
    let defaultScale = (1-z/camera_z);
    let newScale = (1-z/camera.position.z);
    link.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);
  }
  internalNodeCircles.forEach( function(c,i) {
    let d = internalNodes[i];
    if (phase.includes('initial'))
    {     
      let defaultScale = (1-d.z/camera_z);
      let newScale = (1-d.z/camera.position.z);

      if (c.position.z < camera.position.z) {
        c.position.x = d.x / defaultScale * newScale;
        c.position.y = d.y / defaultScale * newScale;
        c.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);
      }
    }
    if (phase == 'transition_to_tree')
    {
      if (d.max_dist_to_leaf > 0)
      {
        let scale = camera.position.z/camera_z;
        c.material.opacity = scale ;
        c.visible = (scale > 0.1)
        c.scale.set(scale,scale,scale)
      }
    }
    //if (c.material.opacity > 0.5)
    //  c.renderOrder = 2;
    //else
    //  c.renderOrder = 1;
  });

  trigger_transition();

	renderer.render( scene, camera );
  time++;
}


function set_camera_position(time) {
  if (phase == 'transition_to_tree')
  {
    // slowly move from from top view to side view
    camera.position.set(0,
                        -camera_z*Math.pow(Math.sin(rate*time+Math.PI),2),
                        camera_z*Math.pow(Math.cos(rate*time+Math.PI),2)
                       );
    camera.lookAt(0,0,0);
  }
  else if (phase == 'turn_around_tree')
  {
    // rotate around tree 
    camera.position.x = 100*Math.cos(-rate*time+Math.PI/2)
    camera.position.y = -100*Math.sin(-rate*time+Math.PI/2)

    //camera.lookAt(scene.position);
  }
  else if (phase == 'initial_transition')
  {
    let dt = Date.now()/1000 - last_transition;
    if (dt < transition_time_in_iterations[camera_target_height_pointer-1])
    {
      let z0 = camera_values[camera_target_height_pointer-1];
      let z1 = camera_values[camera_target_height_pointer];
      let h = z1 - z0;
      let angle = dt/transition_time_in_iterations[camera_target_height_pointer-1] * Math.PI/2;
      camera.position.z = z0 + h * Math.pow(Math.sin(angle),2);
    }
    else
    {
      camera.position.z = camera_values[camera_target_height_pointer];
    }
  }
  else if (phase == 'initial_wait')
  {
    camera.position.z = camera_values[camera_target_height_pointer-1];
  }
}


// This function prepares the scaling of all objects to be optimal
// for the transition to the treeview
function transition_to_tree() {
  phase = 'transition_to_tree';
  camera.position.z = camera_z;
  camera.lookAt(0,0,0);
  time = 0;
  // set scale for all network nodes
  nodeCircles.forEach( function(c,i) {
    let d = nodes[i];
    let defaultScale = (1-d.z/camera_z);
    let newScale = (1-d.z/camera.position.z);

    if (c.position.z < camera.position.z) {
      c.position.x = d.x / defaultScale * newScale;
      c.position.y = d.y / defaultScale * newScale;
      c.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);
    }
  });

  // set scale for all network links
  let z = nodes[0].z - z_value_height/10;
  let defaultScale = (1-z/camera_z);
  let newScale = (1-z/camera.position.z);
  link.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);

  // set scale for all internal (tree) nodes
    internalNodeCircles.forEach( function(c,i) {
      let d = internalNodes[i];
      let defaultScale = (1-d.z/camera_z);
      let newScale = (1-d.z/camera.position.z);

      if (c.position.z < camera.position.z) {
        c.position.x = d.x / defaultScale * newScale;
        c.position.y = d.y / defaultScale * newScale;
        c.scale.set(newScale/ defaultScale, newScale/ defaultScale, newScale/ defaultScale);
      }
    }
    );
}


// this function controls the transitions between visualization phases
function trigger_transition() {
  let now = Date.now()/1000;

  if (phase == 'initial_wait')
  {
    console.log(now - last_transition, pause_time_in_iterations);
    if (now - last_transition > pause_time_in_iterations)
    {
      // camera_target_height_pointer points to the value in
      // camera_values which will next be approached (z-coordinate of camera).
      // it also points to the correct transition time.
      // if there's no camera values left, transition 
      if (camera_target_height_pointer == camera_values.length)
      {
        last_transition = now;
        transition_to_tree();
      }
      else
      {
        phase = "initial_transition";
        last_transition = now;
        time = 0;
      }
    }
    return;
  }
  if (phase == 'initial_transition')
  {
    if (now - last_transition > transition_time_in_iterations[camera_target_height_pointer-1])
    {
      phase = 'initial_wait';
      camera_target_height_pointer++;
      last_transition = now;
      time = 0;
    }
    return;
  }
  if (phase == 'transition_to_tree')
  {
    if (camera.position.z < 1e-2){
      return; // COMMENT THIS OUT IF YOU WANT THE CAMERA TO ROTATE AROUND THE TREE
      phase = 'turn_around_tree';
      camera.up = new THREE.Vector3(0,0,1);
      time = 0;
      last_transition = now;
    }
    return;
  }
}
