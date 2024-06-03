"use strict";

class forceLayout {
  constructor()
  {
    this.charge = -37;
    this.gravity = 1;
    this.linkDistance = 5.8;
    this.node_radius = 1;
    this.restart_alpha = 0.2;
    this.simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(this.charge))
      .force("center", d3.forceCenter(0, 0))
      .force("x", d3.forceX(0).strength(this.gravity))
      .force("y", d3.forceY(0).strength(this.gravity))
      .force("link", d3.forceLink().id(d => d.id).distance(this.linkDistance))
      .force("collide", d3.forceCollide(0).radius(this.node_radius))
    ;
  }

  setCharge(v)
  {
    this.simulation.force("charge").strength(+v);
    this.heat();
  }

  setGravity(v) {
    this.simulation.force("x").strength(+v);
    this.simulation.force("y").strength(+v);
    this.heat();
  }

  setLinkDistance(v) {
    this.simulation.force("link").distance(+v);
    this.heat();
  }

  setNodeRadius(v) {
    this.node_radius = +v;
    this.heat();
  }

  getNodes()
  {
    return this.simulation.nodes();
  }

  setNodes(nodes){
    this.simulation.nodes(nodes);
    this.heat();
  }

  setLinks(links){
    this.simulation.force("link").links(links);
    this.heat();
  }

  getLinks(links){
    return this.simulation.force("link").links();
  }

  heat(){
    this.simulation.alpha(this.restart_alpha);
    this.simulation.restart();
  }
}
