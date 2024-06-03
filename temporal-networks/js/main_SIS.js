"use strict";


let N = 1000;
let nodes = d3.range(N).map(function(n){return {id: n, x:(Math.random()-0.5)*100,y:(Math.random()-0.5)*100, status: 'recovered'}});
let pawns = new PawnLayout(0xffffff);
//nodes[1].status = 'infected';


let frame_dt = 200; // ms
let time = 0;
let frame = 0;
let FW = new flockwork(nodes,{P:0.5,gamma:1/N},time);
let EAM = new eam(nodes,{rho:1/(N-1),link_decay_rate:2/N},time);

let temporal_network = FW;
let recovery_rate_times_N = 1;
let c0 = 1;
let k0 = 1;
let R0 = 2;
let infection_rate = (recovery_rate_times_N / N) / k0 * R0;
let SIS = new gillespieSIS(temporal_network)
                      .recoveryRate(recovery_rate_times_N / N)
                      .infectionRate(infection_rate)
             ;
pawns.setNodes(nodes);

var sim = new forceLayout();
sim.setNodes(nodes);
sim.setLinks(temporal_network.getLinks());

let link_changes = [];

let readyToReceiveUpdate = true;

function updateSystem() {
  if (!readyToReceiveUpdate)
    return;
  //pawns.setNodes(sim.simulation.nodes());
  let n_changes = SIS.updateUntilNextFrame();
  //temporal_network.updateUntil(time+frame_dt);
  if (n_changes.in + n_changes.out > 0)
  {
    sim.setLinks(temporal_network.getLinks());
    pawns.setLinks(sim.getLinks());
  }
  //time += frame_dt;
  //
  link_changes.push(n_changes.in);
  let k = (2*pawns.links.length/N);
  //console.log("k =", k)
  //console.log("links created per frame/(k+1) =", d3.mean(link_changes)/(k+1),"k =", k);
  //
  console.log(SIS.number_of_I_S_links, SIS.I_S_graph.reduce((acc,entry) => entry.length + acc,0));

  readyToReceiveUpdate = true;
}

let timer = setInterval(updateSystem,frame_dt);

let controls = {
  'log10(k0)': Math.log(k0)/Math.log(10),
  'log10(c0)': Math.log(c0)/Math.log(10),
  'log10(R0)': Math.log(R0)/Math.log(10),
  'log10(recovery_events_per_frame)': Math.log(recovery_rate_times_N)/Math.log(10),
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

    frame = 0;
    readyToReceiveUpdate = true;
    timer = setInterval(updateSystem,frame_dt);
  },
  'initially infected': N,
  temporal_network: "flockwork",
  'initiate SIS': function () {
    controls.stop();
    SIS.infectN(controls['initially infected']);
    controls.restart();
  }
};

set_contact_renewal(controls['log10(c0)']);
set_degree(controls['log10(k0)']);


var gui = new dat.GUI();
var tn_gui = gui.addFolder('Temporal Network');
tn_gui.add(controls, 'temporal_network',['flockwork','link_activity_model']).onChange(set_temporal_network_model);
tn_gui.add(controls, 'log10(k0)',-1.0,2.0,.1).onChange(set_degree);
tn_gui.add(controls, 'log10(c0)',-1.0,2.0,.1).onChange(set_contact_renewal);
//tn_gui.add(controls, 'log10(c0)',-1.0,2.0,.1).onChange(set_contact_renewal);
tn_gui.add(controls, 'frameRate',1/10000,1/20,1e-4).onChange(set_frame_rate);
tn_gui.add(controls, 'restart');
tn_gui.add(controls, 'stop');
//fw_gui.add(EAM, 'noiseStrength');
//
var SIS_gui = gui.addFolder('SIS');
SIS_gui.add(controls, 'initially infected', 1, N);
SIS_gui.add(controls, 'initiate SIS');
SIS_gui.add(controls, 'log10(R0)', -1,2,.1).onChange(set_R0);
SIS_gui.add(controls, 'log10(recovery_events_per_frame)', -1,2).onChange(set_recovery_events_per_frame);

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
  k0 = Math.pow(10,+l10k);
  infection_rate = (recovery_rate_times_N / N) / k0 * R0;
  SIS.infectionRate(infection_rate);
  
  let P = (+k0)/(1+k0);
  let rho = k0/(N-1);
  FW.setP(P);
  EAM.setRho(rho);
  link_changes = [];
}

function set_recovery_events_per_frame(l10r) {
  recovery_rate_times_N = Math.pow(10,+l10r);
  infection_rate = (recovery_rate_times_N / N) / k0 * R0;
  SIS.recoveryRate((recovery_rate_times_N / N))
     .infectionRate(infection_rate);

  let alphaTimesN = (c0 * recovery_rate_times_N);
  FW.setAlphaTimesN(alphaTimesN);
  EAM.setAlphaTimesN(alphaTimesN);
  link_changes = [];
}

function set_R0(l10R) {
  R0 = Math.pow(10,+l10R);
  infection_rate = (recovery_rate_times_N / N) / k0 * R0;
  SIS.infectionRate(infection_rate);
}

function set_contact_renewal(l10c){
  c0 = Math.pow(10,+l10c);
  let alphaTimesN = (c0 * recovery_rate_times_N);
  FW.setAlphaTimesN(alphaTimesN);
  EAM.setAlphaTimesN(alphaTimesN);
  link_changes = [];
}

function set_temporal_network_model(v){
  if (v == 'flockwork')  
  {
    FW.setLinks(temporal_network.getLinks());
    temporal_network = FW;
    SIS.temporalNetwork(FW);
  }
  else
  {
    EAM.setLinks(temporal_network.getLinks());
    temporal_network = EAM;
    SIS.temporalNetwork(EAM);
  }
  link_changes = [];
}

function set_frame_rate(v){
  controls.stop();
  frame_dt = 1/(+v);
  controls.restart();
}

