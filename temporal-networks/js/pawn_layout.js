"use strict";

const width = window.innerWidth;
const height = window.innerHeight;

const near_plane = 1;
const far_plane = 1000;
const camera_x = 50;
const link_height = 2;

class PawnLayout {

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

    //let pawn_material = new THREE.MeshToonMaterial({color: 0x666666, reflectivity: 0});
    this.pawn_geometry = get_pawn_geometry();
    this.pawn_material = new THREE.MeshBasicMaterial({color: 0x666666});
    this.pawn_infected_material = new THREE.MeshBasicMaterial({color: 0xFF8888});
    this.pawn0 = new THREE.Mesh(this.pawn_geometry, this.pawn_material);
    //this.pawn0.receiveShadow = true;
    //this.pawn0.castShadow = false;

    //this.scene.add(pawn0);
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
    this.links = [];
    this.pawns = [];
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
    let self = this;
    requestAnimationFrame(function(time){self.animate(time,self)});
  }

  setNodes(nodes){
    this.nodes = nodes;
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

  shave_pawns()
  {
    let self = this;
    if (self.pawns.length == 0 && self.nodes.length > 0)
    {
      self.scene.add(self.pawn0);
      self.pawns.push(self.pawn0);
    }
    if (self.pawns.length < self.nodes.length)
    {
      for(let i = self.pawns.length; i<self.nodes.length; i++)
      {
        let pawn_material = new THREE.MeshBasicMaterial({color: 0x666666});
        let pawn = new THREE.Mesh(this.pawn_geometry, pawn_material);
        //pawn.castShadow = true;
        //pawn.receiveShadow = false;
        self.scene.add(pawn);
        self.pawns.push(pawn);
      }
    }
    else if(self.pawns.length > self.nodes.length)
    {
      for(let i = self.nodes.length; i<self.pawns.length; i++)
      {
        self.scene.remove(self.pawns[i]);
      }
      self.pawns.length = self.nodes.length;
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

    self.shave_pawns();

    if(self.link_line)
      self.link_line.geometry.verticesNeedUpdate = true;

    let r0 = new THREE.Vector2(0,0);
    let r1 = new THREE.Vector2(0,0);
    let k0 = 0;

    if (self.pawns.length > 0)
    {
      r0.add(new THREE.Vector2(self.nodes[0].x,self.nodes[0].y));
    }
    self.pawns.forEach(function(p,i){
      if (self.nodes[i].status == 'infected')
      {
        p.material.color.setHex(0xFF8888);
      }
      else 
      {
        p.material.color.setHex(0x666666);
      }
    });




    self.links.forEach(function(l,i){
      self.link_line.geometry.vertices[2*i] = new THREE.Vector3(l.source.x, l.source.y,link_height);
      self.link_line.geometry.vertices[2*i+1] = new THREE.Vector3(l.target.x, l.target.y,link_height);
      if (l.source.id == 0)
      {
        r1.add(new THREE.Vector2(l.target.x, l.target.y));
        k0++;
      }
      else if (l.target.id == 0)
      {
        r1.add(new THREE.Vector2(l.source.x, l.source.y));
        k0++;
      }
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
      let cam_r = Math.sqrt( Math.pow(self.camera.position.x,2)
                            +Math.pow(self.camera.position.y,2))
      if (cam_r >= 1e-3)
      {
        self.camera.position.x = 0;
        self.camera.position.y = 0;
      }
      self.camera.position.z = far_plane/2;
      self.camera.lookAt(new THREE.Vector3(0,0,3));
    }
 
    self.pawns.forEach(function(p,i){
      p.position.x = self.nodes[i].x;
      p.position.y = self.nodes[i].y;
    });
 
    self.renderer.render( self.scene, self.camera );
    self.frame++;
 }

 triggerCameraTransitionToTop(duration=2500,callback=()=>{}){
   let self = this;
   self.camera.position.t = 0;
   const tween = new TWEEN.Tween(self.camera.position)
        .to({x:0, y:0, z:far_plane/2, t:1},duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(()=>self.camera_mode = 'tweening')
        .onComplete(function(){
          //self.camera_mode = 'top view'
          callback();
        })
        .onUpdate(function(){
          let r = new THREE.Vector2(self.nodes[0].x,self.nodes[0].y);
          r.multiplyScalar(1-self.camera.position.t);
          //console.log(r);
          //console.log(self.camera.position)
          if (r.length()>=1e-3)
          {
            //r = new THREE.Vector2(0,0);
          self.camera.lookAt(new THREE.Vector3(r.x, r.y, 3));
          }
        })
        .start()
        
   ;
 }
}
