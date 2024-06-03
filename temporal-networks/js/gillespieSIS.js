"use strict";

let _S = 0;
let _I = 1;

function _rm_elm(list, element) {
  let pos = list.indexOf(element);
  if (pos == -1)
    return;
  list.splice(pos,1);
}

class gillespieSIS {

  constructor(temporal_network) {
    let self = this;
    self.tn = temporal_network;
    self.N = self.tn.N;
    self.node_status = [];
    self.I_S_graph = [];
    self.number_of_I_S_links = 0;
    self.infected = [];
    for(let i=0; i<self.N; i++) {
      self.node_status.push(_S); 
      self.I_S_graph.push([]);
    }
    self.recoveryRate(1);
    self.infectionRate(1);
    //self.infectN(0);

    self.time = 0;
  }

  temporalNetwork(tn) {
    let self = this;
    self.tn = tn;
    return self.nodeStatusChanged();
  }

  nodeStatus(value) {
    let self = this;
    if (!arguments.length)
      return self.node_status;
    else if (value.length == self.N)
    {
      self.node_status = value;
      self.infected = [];
      self.node_status.forEach( function(d,i){ 
        if (d==_I){
          self.infected.push(i);
          self.tn.nodes[i].status = 'infected';
        }
        else
        {
          self.tn.nodes[i].status = 'recovered';
        }
      });
      self.nodeStatusChanged();
    }
    else
      throw "invalid list length of node status";

    return self;
  }

  infectedNodes(value) {
    let self = this;
    if (!arguments.length)
      return self.infected;
    else if (value.length <= self.N)
    {
      self.infected = value;
      self.node_status = [];
      for(let i=0; i<self.N; i++) {
        self.node_status.push(_S); 
        self.tn.nodes[i].status = 'recovered';
      }
      self.infected.forEach( function (i) {
        self.node_status[i] = _I;
        self.tn.nodes[i].status = 'infected';
      });
      self.nodeStatusChanged();
    }
    else
      throw "invalid list length of infected status";
    return self;
  }

  infectN(n) {
    let self = this;

    let all_nodes = [];
    for(let i=0; i<self.N; i++) {
      all_nodes.push(i); 
    }

    let infected = []; 
    for(let i=0; i<n; i++) {
      let u = Math.floor(Math.random() * all_nodes.length);
      let v = all_nodes.splice(u,1)[0];      
      infected.push(v); 
    }

    return self.infectedNodes(infected);
  }

  nodeStatusChanged() {
    // evaluate new event lists
    let self = this;
    for(let i=0; i<self.N; i++) {
      self.I_S_graph[i].length = 0;
    }

    self.number_of_I_S_links = 0;

    self.infected.forEach(function(i) {
      self.tn.G[i].forEach(function(neigh) {
        if (self.node_status[neigh] == _S)
        {
          self.I_S_graph[i].push(neigh);
          self.number_of_I_S_links++;
        }
      });
    });
    return self;
  }

  infectionRate(value) {
    let self = this;
    if (!arguments.length)
      return self.infection_rate;

    self.infection_rate = +value;
    return self;
  }

  recoveryRate(value) {
    let self = this;
    if (!arguments.length)
      return self.recovery_rate;

    self.recovery_rate = +value;
    return self;
  }

  getRates() {
    let self = this;
    return {
      recovery: self.infected.length * self.recoveryRate(),
      infection: self.number_of_I_S_links * self.infectionRate(),
      temporal_network: self.tn.getTotalEventRate()
    }
  }

  getTotalEventRate() {
    let rates = this.getRates();
    return rates.recovery + rates.infection + rates.temporal_network;
  }

  recoveryEvent() {
    let self = this;

    if (self.infected.length == 0)
      return;
    
    let u = Math.floor(self.infected.length * Math.random());
    let new_S = self.infected.splice(u,1)[0];

    self.node_status[new_S] = _S;
    self.tn.nodes[new_S].status = 'recovered';

    self.number_of_I_S_links -= self.I_S_graph[new_S].length;
    self.I_S_graph[new_S].length = 0;

    self.tn.G[new_S].forEach(function(neigh){
      if (self.node_status[neigh] == _I) {
        self.I_S_graph[neigh].push(new_S);
        self.number_of_I_S_links++; 
      }
    });

    return {
      type: "recovery",
      node: new_S,
      link: null
    }
  }

  infectionEvent() {
    let self = this;

    if (self.infected.length == self.N)
      return;
    let infecting_link = Math.floor(self.number_of_I_S_links * Math.random());
    //console.log(infecting_link)

    let infecting_node = 0;
    let I_S_links = self.I_S_graph[0].length;
    while (   (infecting_node<self.N) 
           && (infecting_link >= self.I_S_graph[infecting_node].length)
          )
    {
      infecting_link -= self.I_S_graph[infecting_node].length;
      infecting_node++;
    }

    let infected_neighbor_position = infecting_link;
    //console.log(infecting_node, infected_neighbor_position);
    let new_I = self.I_S_graph[infecting_node][infected_neighbor_position];
    
    self.infected.push(new_I);
    self.node_status[new_I] = _I;
    self.tn.nodes[new_I].status = 'infected';
    
    self.tn.G[new_I].forEach(function(neigh){
      if (self.node_status[neigh] == _S) {
        self.I_S_graph[new_I].push(neigh);
        self.number_of_I_S_links++; 
      }
      else
      {
        _rm_elm(self.I_S_graph[neigh], new_I);
        self.number_of_I_S_links--; 
      }
    });

    return {
      type: "infection",
      node: new_I,
      link: [infecting_node, new_I]
    }
  }

  update() {
    let self = this;
    let N = self.N;
    let rates = self.getRates();
    let total_rate = rates.recovery + rates.infection + rates.temporal_network;
    let event = Math.random() * total_rate;
    let changes;
    
    if (event < rates.recovery)
      changes = self.recoveryEvent();
    else if (event < rates.recovery+rates.infection)
      changes = self.infectionEvent();
    else
    {
      changes = self.tn.update();
      changes.out.forEach(function (l){
        let i = l.source.id,
            s = l.target.id;

        if (self.node_status[i] == self.node_status[s])
          return;

        if (self.node_status[i] == _S)
        {
          i = l.target.id;
          s = l.source.id;        
        }
        _rm_elm(self.I_S_graph[i],s);
        self.number_of_I_S_links--;
      });
      changes.in.forEach(function (l){
        let i = l.source.id,
            s = l.target.id;
        if (self.node_status[i] == self.node_status[s])
          return;

        if (self.node_status[i] == _S)
        {
          i = l.target.id;
          s = l.source.id;
        }
        self.I_S_graph[i].push(s);
        self.number_of_I_S_links++;
      });
    }

    let tau = -1/total_rate*Math.log(1-Math.random());
    self.time += tau;

    return changes;
  }

  updateUntilNextFrame(){
    let self = this;
    let n_events = get_poisson_rv(this.getTotalEventRate());

    let n_changes = {in:0, out:0, recovery: 0, infection: 0};
    for(let event=0; event<n_events; event++)
    {
      let u = self.update();

      if (u.type == "recovery")
        n_changes.recovery++;
      else if (u.type == "infection")
        n_changes.infection++;
      else
      {
        n_changes.in += u.in.length;
        n_changes.out += u.out.length;
      }
    }
    return n_changes;
  }

}
