"use strict";

const width = window.innerWidth;
const height = window.innerHeight;

const near_plane = 1;
const far_plane = 1000;
const camera_x = 50;
const link_height = 0;


function get_node(radius,dz=0.1,segments=32,face_color=0xffffff,line_color=0x000000,linewidth=4) {

  let d_geometry = new THREE.CircleGeometry(radius,segments);
  let d_material = new THREE.MeshBasicMaterial( { color: face_color } );
  let disk = new THREE.Mesh( d_geometry, d_material );
  disk.position.z = dz;

  let c_geometry = new THREE.CircleGeometry(radius,segments);
  c_geometry.vertices.shift()
  let c_material = new THREE.LineBasicMaterial( { color: line_color, linewidth:linewidth } );
  let circle = new THREE.LineLoop( c_geometry, c_material );
  circle.position.z = 1.1*dz;

  let node = new THREE.Group();
  node.add(disk);
  node.add(circle);

  return node;
}

class NetworkLayout {

  constructor(bg_color=0xfffffa){

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      20,
      width / height,
      near_plane,
      far_plane
    );

    let d = 300;

    this.camera.position.set(0, -camera_x, 50);
    this.camera.lookAt(new THREE.Vector3(0,0,1));
    this.camera.up = new THREE.Vector3(0,0,1);
    //this.light = new THREE.DiLight( 0xffffff, 1 );
    //this.light.shadow.mapSize.width = 1024;
		//this.light.shadow.mapSize.height = 1024;
    //this.light.target = this.scene;
    //this.light.castShadow = true;
    //this.light.position.set( 0,0,100 );
    //this.light.shadow.camera.left = - d;
    //this.light.shadow.camera.right = d;
    //this.light.shadow.camera.top = d;
    //this.light.shadow.camera.bottom = - d;
    //this.light.shadow.camera.far = 1000;
    //this.light.position.set(far_plane,far_plane,100);
    //his.scene.add( this.light );
    this.scene.background = new THREE.Color(bg_color);

    //let node_material = new THREE.MeshToonMaterial({color: 0x666666, reflectivity: 0});
    this.walker_geometry = get_pawn_geometry();
    this.walker_material = new THREE.MeshBasicMaterial({color: 0x1b9e77});
    this.walker0 = new THREE.Mesh(this.node_geometry, this.node_material);
    //this.node0.receiveShadow = true;
    //this.node0.castShadow = false;
    this.special_node_color = 0xe78ac3; // same in full: 0xe7298a; // same in pastel: #e78ac3
    this.second_special_node_color = 0x66c2a5; // same in full: 0xe7298a; // same in pastel: #e78ac3
    

    //this.scene.add(node0);
    //
    this.line_material = new THREE.LineBasicMaterial({color: 0xaaaaaa, linewidth: 5});

    //this.plane_geometry = new THREE.PlaneGeometry( 2*far_plane, 2*far_plane );
    //this.plane_material = new THREE.MeshPhongMaterial( {color: 0xfffffa, shadowSide: THREE.DoubleSide, 
    //   side:THREE.DoubleSide} );
    //this.plane = new THREE.Mesh( this.plane_geometry, this.plane_material );
    ////this.plane.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI);
    //this.plane.receiveShadow = true;
    //this.plane.castShadow = false;
    //this.scene.add( this.plane );
    


    this.nodes = [];
    this.node_objects = [];
    this.walkers = [];
    this.walker_objects = [];
    this.links = [];
    this.fc2fc = [];


    this.renderer = new THREE.WebGLRenderer({antialias:true});
    //this.renderer.shadowMap.enabled = true;
    //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( width, height );
    document.body.appendChild( this.renderer.domElement );

    // Retina canvas rendering    
    let devicePixelRatio = window.devicePixelRatio || 1;
    d3.select(this.renderer.domElement)
      .attr("width", width * devicePixelRatio)
      .attr("height", height * devicePixelRatio)
      .style("width", width + "px")
      .style("height", height + "px").node()
    let gl = this.renderer.getContext();
    gl.viewport(0, 0,
      gl.drawingBufferWidth, gl.drawingBufferHeight);

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target = new THREE.Vector3(0,0,1);

    this.camera_patient_distance = 50;
    this.camera_patient_height = 50;
    this.camera_mode = "custom control";

    this.frame = 0;
    requestAnimationFrame((time) => this.animate(time,this));
  }

  setNodes(nodes){
    this.nodes = nodes;
  }

  setWalkers(walkers){
    this.walkers = walkers;
  }

  setLinks(links){
    if (this.link_line)
      this.scene.remove(this.link_line);
    let geometry = new THREE.Geometry();
    geometry.verticesNeedUpdate = true;
    links.forEach(function(l){
      geometry.vertices.push(
        new THREE.Vector3(l.source.x, l.source.y,link_height),
        new THREE.Vector3(l.target.x, l.target.y,link_height)
      );
    });
    this.link_line = new THREE.LineSegments(geometry, this.line_material);
    this.scene.add(this.link_line);
    this.links = links;
  }

  add_links()
  {
  }

  remove_links()
  {
  }

  shave_nodes()
  {
    let self = this;
    if (self.node_objects.length < self.nodes.length)
    {
      for(let i = self.node_objects.length; i<self.nodes.length; i++)
      {
        let node = get_node(2);
        //node.castShadow = true;
        //node.receiveShadow = false;
        self.scene.add(node);
        self.node_objects.push(node);
      }
    }
    else if(self.node_objects.length > self.nodes.length)
    {
      for(let i = self.node_objects.length; i<self.nodes.length; i++)
      {
        self.scene.remove(self.node_objects[i]);
      }
      self.node_objects.length = self.nodes.length;
    }
  }

  shave_walkers()
  {
    let self = this;
    if (self.walker_objects.length < self.walkers.length)
    {
      for(let i = self.walker_objects.length; i<self.walkers.length; i++)
      {
        let walker = new THREE.Mesh(self.walker_geometry, self.walker_material);
        //node.castShadow = true;
        //node.receiveShadow = false;
        self.scene.add(walker);
        self.walker_objects.push(walker);
      }
    }
    else if(self.walker_objects.length > self.walkers.length)
    {
      for(let i = self.walker_objects.length; i<self.walkers.length; i++)
      {
        self.scene.remove(self.walker_objects[i]);
      }
      self.walker_objects.length = self.walkers.length;
    }
  }

  animate(time,sender) {
    let self;
    if (arguments.length == 0)
      self = this;
    else
      self = sender;
 
    requestAnimationFrame( function(time) {self.animate(time,self)} );
    TWEEN.update(time);

    self.shave_nodes();
    self.shave_walkers();

    
    if(self.link_line)
      self.link_line.geometry.verticesNeedUpdate = true;

    let r0 = new THREE.Vector2(0,0);
    let r1 = new THREE.Vector2(0,0);
    let k0 = 0;

    if (self.walkers.length > 0)
    {
      r0.add(new THREE.Vector2(self.walkers[0].x,self.walkers[0].x));
    }



    self.links.forEach(function(l,i){
      self.link_line.geometry.vertices[2*i] = new THREE.Vector3(l.source.x, l.source.y,link_height);
      self.link_line.geometry.vertices[2*i+1] = new THREE.Vector3(l.target.x, l.target.y,link_height);
      
    });

    if (self.camera_mode == 'focus on patient zero')
    {
      let r = new THREE.Vector2(r0.x, r0.y); 
      //r.add(r1);
      //r.sub(r0);
      //r.multiplyScalar(1);
      //console.log(r1, r0, r);
      r.normalize();

      //self.camera.position.x = r0.x - self.camera_patient_distance * r.x;
      //self.camera.position.y = r0.y - self.camera_patient_distance * r.y;
      //self.camera.position.z = self.camera_patient_height;
      self.camera.position.x = r0.x + self.camera_patient_distance * r.x;
      self.camera.position.y = r0.y + self.camera_patient_distance * r.y;
      self.camera.position.z = self.camera_patient_height;
      self.camera.lookAt(r0.x, r0.y, 3);
      
    }
    else if (self.camera_mode == 'top view')
    {
      self.camera.position.x = 0;
      self.camera.position.y = 0;
      self.camera.position.z = far_plane/2;
      self.camera.lookAt(new THREE.Vector3(0,0,0));
    }
 
    self.node_objects.forEach(function(n,i){
      let node = self.nodes[i];
      if (node.status && 
          node.status == 'visited')
      {
        n.children[0].material.color.setHex(self.special_node_color);
      }
      else if(node.status && node.status == 'target'){
        n.children[0].material.color.setHex(self.second_special_node_color);
      }
      else if(node.status && node.status == 'source'){
        n.children[0].material.color.setHex(self.special_node_color);
      }
      else {
        n.children[0].material.color.setHex(0xffffff);
      }
      n.position.x = self.nodes[i].x;
      n.position.y = self.nodes[i].y;
    });
 
    self.walker_objects.forEach(function(p,i){
      let w = self.walkers[i];
      if (w.status == 'resting')
      {
        p.position.x = w.node.x;
        p.position.y = w.node.y;
      }
      else if (w.status == 'tweening')
      {
        let src = w.node;
        let trg = w.target;
        if (src.id == trg.id){
          p.position.x = w.node.x;
          p.position.y = w.node.y;
        }
        else
        {
          let r0 = new THREE.Vector2(src.x, src.y);
          let r1 = new THREE.Vector2(trg.x, trg.y);
          r1.sub(r0);
          r1.multiplyScalar(w.t);
          r1.add(r0);
          w.x = r1.x;
          w.y = r1.y;
          
          p.position.x = r1.x;
          p.position.y = r1.y;
        }
      }
    });
 
    self.renderer.render( self.scene, self.camera );
    self.frame++;
 }
}
