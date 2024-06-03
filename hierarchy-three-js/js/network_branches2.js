const width = window.innerWidth;
const height = window.innerHeight;

const near_plane = 2;
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

let scale = 15;

fetch('/power.json')
  .then(response => response.json())
  .then(function(data) {
    // graph 
    nodes = data.network.nodes.slice();
    links = data.network.links.map(l => [nodes[l.source], nodes[l.target]]);
    let N = nodes.length;
    nodeCircles = nodes.map(function(d,i){
      d.x *= scale;
      d.y *= scale;
      d.z = z_value_height; 
      d.radius *= scale;
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
    let link = new THREE.LineSegments(geometry, material);
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
        let linewidth, this_color;
        if (d.max_dist_to_leaf == 0)
        {
          linewidth = 1;
          d.z = 1.05*z_value_height; 
          this_color = 0x000000;
        }
        else
        {
          linewidth = 2;
          d.z = (L-d.level)*camera_z/(L+1)/6;           
          this_color = colorsfull[d.level];

        }
        let zoomScale = 1-d.z/camera_z; 
        d.x *= scale*zoomScale;
        d.y *= scale*zoomScale;
        d.radius *= scale*zoomScale;
        //d.z *= -1;
        let geometry = new THREE.CircleGeometry(d.radius,32);
        geometry.vertices.shift()
        let material = new THREE.LineBasicMaterial( { color: this_color, linewidth:linewidth } );
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
          let material2 = new THREE.MeshBasicMaterial( { color: colors[d.level-1], transparent: true, opacity:0.4 } );
          let cyl = new THREE.Mesh(geometry2, material2);
          cyl.position.x = d.x;
          cyl.position.y = d.y;
          cyl.position.z = d.z-cylheight/2;
          cyl.rotation.x = Math.PI/2;
          scene.add(cyl)
        }
       
        return circle;
        */
    });

    internalLinks.forEach(function(l){
      let z_src = l[0].z;
      let zoomScale_src = 1-z_src/camera_z; 
      let z_trg = l[1].z;
      let zoomScale_trg = 1-z_trg/camera_z; 
      let src = new THREE.Vector3(l[1].x/zoomScale_trg*zoomScale_src,
                                  l[1].y/zoomScale_trg*zoomScale_src, 
                                  l[0].z);
      let trg = new THREE.Vector3(l[1].x, l[1].y, l[1].z);      
      let zdiff = l[1].z - l[0].z;
      let ctrl0 = new THREE.Vector3(src.x, src.y, src.z + zdiff/3);
      let ctrl1 = new THREE.Vector3(trg.x, trg.y, trg.z - zdiff/3);
      let curve = new THREE.CubicBezierCurve3(
          src, ctrl0, ctrl1, trg
      );

      let points = curve.getPoints( 10 );
      let geometry = new THREE.BufferGeometry().setFromPoints( points );
      let material = new THREE.LineBasicMaterial( { color : colors[l[1].level] } );
      let curveObject = new THREE.Line( geometry, material );
      scene.add(curveObject);
    });

    //const nodeContainer = new THREE.Object3D();
    //nodeContainer.add(nodeCircles);
    //scene.add(nodeContainer);
  })

let time = 0;
//camera.rotation.x = Math.PI/2;
let rate = 0.005;

function animate() {

	requestAnimationFrame( animate );

  //camera.position.set(0,-(0.5*Math.cos(rate*time+Math.PI)+0.5)*100,100*Math.pow(Math.cos(rate*time+Math.PI),2));
  //camera.position.set(0,-Math.pow(Math.sin(rate*time+Math.PI),2)*100,100*Math.pow(Math.cos(rate*time+Math.PI),2));
  //camera.lookAt(new THREE.Vector3(0,0,0));
  //camera.lookAt(0,0,0);
  controls.update();

	renderer.render( scene, camera );
  time++;
}

animate();
