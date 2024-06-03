"use strict";

function get_pawn_geometry(parameters={}) {
  let attr = {
    segments: 30,
    radial_segments: 16,
    height: 3,
    body_roundness: 3/5*2,
    body_radius: 1,
    head_radius: 3/4*0.9,
    head_distance: 1/10,
    head_segments: 16
  }
  
  Reflect.ownKeys(parameters).forEach(function(key){
    attr[key] = parameters[key];
  });

  let r0 = Math.exp(-Math.sqrt(1/attr.body_roundness));
  let r1 = Math.exp(+Math.sqrt(1/attr.body_roundness));
  let body_height = r1-r0;
  let dx = body_height/attr.segments;

  let points = [];
  points.push(new THREE.Vector2(0,0));
  for(let i = 0; i<attr.segments-1; i++)
  {
    let x = (i+1)*dx+r0;
    let point = new THREE.Vector2(
        attr.body_radius * Math.sqrt(1-attr.body_roundness*Math.pow(Math.log(x),2)),
        (i+1)/attr.segments * attr.height
      );
    points.push(point);
  }
  points.push(new THREE.Vector2(0,attr.height));

  let body = new THREE.LatheGeometry( points, attr.radial_segments);
  let sphere = new THREE.SphereGeometry(attr.head_radius, attr.head_segments, attr.head_segments);
  let singleGeometry = new THREE.Geometry();
  let bodyMesh = new THREE.Mesh(body);
  let sphereMesh = new THREE.Mesh(sphere);

  bodyMesh.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2);
  bodyMesh.updateMatrix(); // as needed
  singleGeometry.merge(bodyMesh.geometry, bodyMesh.matrix);

  sphereMesh.position.z = attr.height + attr.head_distance + attr.head_radius;
  sphereMesh.updateMatrix(); // as needed
  singleGeometry.merge(sphereMesh.geometry, sphereMesh.matrix);

  return singleGeometry;
}
