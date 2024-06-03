"use strict";


let N = 200;
let nodes = d3.range(N).map(function(n){return {id: n, x:(Math.random()-0.5)*100,y:(Math.random()-0.5)*100}});
let pawns = new PawnLayout(0xffffff);
nodes[0].status = 'infected';
//nodes[1].status = 'infected';


let frame_dt = 500; // ms
let time = 0;
let frame = 0;
let recover_after_frames = 10;
let FW = new flockwork(nodes,{P:0.5,gamma:1/N},time);
let EAM = new eam(nodes,{rho:1/(N-1),link_decay_rate:2/N},time);

let temporal_network = FW;
pawns.setNodes(nodes);

let tau_recover = 10*frame_dt;
let recovery_rate = 1/tau_recover;

var sim = new forceLayout();
sim.setNodes(nodes);
sim.setLinks(temporal_network.getLinks());

let link_changes = []

function updateAdjacency() {
  //pawns.setNodes(sim.simulation.nodes());
  let n_link_changes = temporal_network.updateUntilNextFrame();
  //temporal_network.updateUntil(time+frame_dt);
  if (n_link_changes.in + n_link_changes.out > 0)
  {
    sim.setLinks(temporal_network.getLinks());
    pawns.setLinks(sim.getLinks());
  }
  //time += frame_dt;
  //
  link_changes.push(n_link_changes.in);
  let k = (2*pawns.links.length/N);
  //console.log("links created per frame/(k+1) =", d3.mean(link_changes)/(k+1),"k =", k);
  frame++;
  if (frame == recover_after_frames)
    nodes[0].status = 'recovered';

}

let timer = setInterval(updateAdjacency,frame_dt);

let controls = {
  'log10(k0)': 0.0,
  'log10(c0*N)': 0.0,
  'frameRate': 1/frame_dt,
  linkDistance: 1,
  charge: 0,
  gravity: 0,
  nodeRadius: 0,
  linkDistance: 0,
  stop: function() {
    clearInterval(timer);
  },
  restart: function(){
    controls.stop();
    nodes[0].status = 'infected';
    frame = 0;
    timer = setInterval(updateAdjacency,frame_dt);
  },
  temporal_network: "flockwork",
};

set_contact_renewal(controls['log10(c0*N)']);
set_degree(controls['log10(k0)']);


var gui = new dat.GUI();
var tn_gui = gui.addFolder('Temporal Network');
tn_gui.add(controls, 'temporal_network',['flockwork','link_activity_model']).onChange(set_temporal_network_model);
tn_gui.add(controls, 'log10(k0)',-1.0,2.0,.1).onChange(set_degree);
tn_gui.add(controls, 'log10(c0*N)',-1.0,2.0,.1).onChange(set_contact_renewal);
//tn_gui.add(controls, 'log10(c0)',-1.0,2.0,.1).onChange(set_contact_renewal);
tn_gui.add(controls, 'frameRate',1/10000,1/20,1e-4).onChange(set_frame_rate);
tn_gui.add(controls, 'restart');
tn_gui.add(controls, 'stop');
//fw_gui.add(EAM, 'noiseStrength');
//
var sim_gui = gui.addFolder('Force Layout');
sim_gui.add(sim, 'charge',-100,0).onChange((v)=>sim.setCharge(+v));
sim_gui.add(sim, 'gravity',0,3).onChange((v)=>sim.setGravity(+v));
sim_gui.add(sim, 'node_radius',0,100).onChange((v)=>sim.setNodeRadius(+v));
sim_gui.add(sim, 'linkDistance',0,10).onChange((v)=>sim.setLinkDistance(+v));

var pawn_gui = gui.addFolder('3D Layout');
pawn_gui.add(pawns, 'camera_mode',['custom control', 'top view', 'focus on patient zero']);
pawn_gui.add(pawns, 'triggerCameraTransitionToTop');
pawn_gui.add(pawns, 'camera_patient_distance',50,170,.01);
pawn_gui.add(pawns, 'camera_patient_height',0,1000);

function set_degree(l10k) {
  let k = Math.pow(10,+l10k);
  let P = (+k)/(1+k);
  let rho = k/(N-1);
  FW.setP(P);
  EAM.setRho(rho);
  link_changes = [];
}

function set_contact_renewal(l10c){
  let c0N = Math.pow(10,+l10c);
  let alphaTimesN = (+c0N);
  FW.setAlphaTimesN(alphaTimesN);
  EAM.setAlphaTimesN(alphaTimesN);
  link_changes = [];
}

function set_temporal_network_model(v){
  if (v == 'flockwork')  
  {
    FW.setLinks(temporal_network.getLinks());
    temporal_network = FW;
  }
  else
  {
    EAM.setLinks(temporal_network.getLinks());
    temporal_network = EAM;
  }
  link_changes = [];
}

function set_frame_rate(v){
  controls.stop();
  frame_dt = 1/(+v);
  controls.restart();
}

