"use strict";


let N = 1000;
let nodes = d3.range(N).map(function(n){return {id: n, x:(Math.random()-0.5)*100,y:(Math.random()-0.5)*100}});
let pawns = new PawnLayout();

let EAM = new eam(nodes,{rho:1/(N-1),link_decay_rate:1/500});
pawns.setNodes(nodes);

var sim = new forceLayout();
sim.setNodes(nodes);
sim.setLinks(EAM.get_links());

function update() {
  //pawns.setNodes(sim.simulation.nodes());
  EAM.update();
  sim.setLinks(EAM.get_links());
  pawns.setLinks(EAM.get_links());
}

setInterval(update,200);


let controls = {
  k: 1,
  linkDistance: 1,
  charge: 0,
  gravity: 0,
  nodeRadius: 0,
  linkDistance: 0,
};


var gui = new dat.GUI();
var eam_gui = gui.addFolder('Link Activity Model');
eam_gui.add(controls, 'k',0,N-1).onChange(set_degree);
//fw_gui.add(EAM, 'noiseStrength');
//
var sim_gui = gui.addFolder('Force Layout');
sim_gui.add(sim, 'charge',-100,0).onChange((v)=>sim.setCharge(+v));
sim_gui.add(sim, 'gravity',0,3).onChange((v)=>sim.setGravity(+v));
sim_gui.add(sim, 'node_radius',0,100).onChange((v)=>sim.setNodeRadius(+v));
sim_gui.add(sim, 'linkDistance',0,10).onChange((v)=>sim.setLinkDistance(+v));

function set_degree(k) {
  let rho = (+k)/(N-1);
  EAM.setRho(rho);
}

