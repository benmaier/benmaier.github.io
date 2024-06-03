"use strict";

let large_sample = false;
let mark_visited = true;

let N, _k;
if (large_sample)
{
  N = 300;
  _k = 2;
}
else
  N = 10;

let nodes = d3.range(N).map(function(n){
  return {
    id: n, 
    x:(Math.random()-0.5)*100,
    y:(Math.random()-0.5)*100,
    status: 'normal'
}});

let nw_layout = new NetworkLayout(0xffffff);


let links, walkers;
if (!large_sample)
{
  links = [
    {source: nodes[0], target: nodes[1]},
    {source: nodes[1], target: nodes[2]},
    {source: nodes[2], target: nodes[3]},
    {source: nodes[2], target: nodes[4]},
    {source: nodes[2], target: nodes[5]},
    {source: nodes[5], target: nodes[6]},
    {source: nodes[5], target: nodes[7]},
    {source: nodes[7], target: nodes[2]},
    {source: nodes[7], target: nodes[8]},
    {source: nodes[8], target: nodes[9]},
  ];
  walkers = [
    {node: nodes[0], x: 0, y: 0}
  ];
}
else
{
  links = [];
  for(let i=0; i<N-1; i++)
    for(let j=0; j<N; j++)
      if (Math.random() < _k/(N-1))
        links.push({source: nodes[i], target: nodes[j]})
  walkers = nodes.map(n=>{return {node: nodes[0], x:0, y:0}});
}

let frame_dt = 500; // ms
let time = 0;

var sim = new forceLayout();
sim.setNodes(nodes);
sim.setLinks(links);

nw_layout.setNodes(nodes);
nw_layout.setWalkers(walkers);
nw_layout.setLinks(sim.getLinks());

var RW = new randomWalk(nodes,links,walkers,{mark_visited:mark_visited});

function update() {

 // if (controls.stop_condition == 'visited_target')
 //   nodes[controls.target].status = 'target';

  if ((controls.stop_condition == 'visited_target') &&
      ((nodes[controls.target].status=='visited') || 
       (walkers.some(w=>w.node.id==controls.target)))
     )
  {
    controls.stop();
  }
  else if ((controls.stop_condition == 'visited_all') &&
        (nodes.every((n)=>n.status=='visited'))
      )
      
  {
    controls.stop();
  }
  else{

    RW.update(frame_dt*0.8);
  }
}


let controls = {
  'frameRate': 1/frame_dt,
  linkDistance: 1,
  charge: 0,
  gravity: 0,
  nodeRadius: 0,
  linkDistance: 0,
  start: function() {
    clearInterval(timer);
    timer = setInterval(update,frame_dt);
  },
  stop: function() {
    clearInterval(timer);
  },
  target : 5,
  stop_condition: 'none',
  reset: function(){
    nodes.forEach((n)=>{n.status = 'normal'});
    walkers.forEach((w)=>{w.node.status = 'visited'})
    if (controls.stop_condition=='visited_target')
      nodes[controls.target].statusi = 'target';
  }
};


var gui = new dat.GUI();
var tn_gui = gui.addFolder('Random Walk');
//tn_gui.add(controls, 'log10(c0)',-1.0,2.0,.1).onChange(set_contact_renewal);
tn_gui.add(controls, 'stop_condition',['none','visited_target','visited_all']).onChange(change_rw_behavior);
tn_gui.add(controls, 'target',0,N-1,1);
tn_gui.add(controls, 'frameRate',1/10000,1/20,1e-4).onChange(set_frame_rate);
tn_gui.add(controls, 'stop');
tn_gui.add(controls, 'start');
tn_gui.add(controls, 'reset');
tn_gui.open();
//fw_gui.add(EAM, 'noiseStrength');
//
var sim_gui = gui.addFolder('Force Layout');
sim_gui.add(sim, 'charge',-100,0).onChange((v)=>sim.setCharge(+v));
sim_gui.add(sim, 'gravity',0,3).onChange((v)=>sim.setGravity(+v));
sim_gui.add(sim, 'node_radius',0,100).onChange((v)=>sim.setNodeRadius(+v));
sim_gui.add(sim, 'linkDistance',0,10).onChange((v)=>sim.setLinkDistance(+v));

var pawn_gui = gui.addFolder('3D Layout');
pawn_gui.add(nw_layout, 'camera_mode',['custom control', 'top view', 'focus on patient zero']);
pawn_gui.add(nw_layout, 'camera_patient_distance',0,1000);
pawn_gui.add(nw_layout, 'camera_patient_height',0,1000);

function set_frame_rate(v){
  frame_dt = 1/(+v);
  controls.stop();
  controls.start();
}

let timer;// = setInterval(update,frame_dt);

function change_rw_behavior(){
  nodes.forEach((n)=>n.status='normal');
  if (controls.stop_condition == 'visited_target')
    nodes[controls.target].status = 'target';
  walkers.forEach((w)=>w.node.status = 'source');
}
