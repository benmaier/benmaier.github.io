"use strict";

class flockwork {

  constructor(nodes,parameters,time)
  {
    let params = {
      P: 0.1,
      reconnection_rate_times_N: 1.0
    };

    let self = this;

    Reflect.ownKeys(parameters).forEach(function(key){
      params[key] = parameters[key];
    });


    this.time = time;
    this.nodes = nodes
    this.N = this.nodes.length;
    this.P = params.P;
    this.setAlphaTimesN(params.reconnection_rate_times_N);
    this.links = [];
    this.G = [];
    for(let i=0; i<this.N; i++)
      this.G.push([]);

  }

  setP(P){
    if (P > 1.0)
      P = 1.0;
    else if (P<0.0)
      P = 0.0;
    this.P = P;
    this.setAlphaTimesN(this.alphaTimesN);
  }
  
  setGammaTimesN(gammaTimesN){
    if (gammaTimesN <= 0.0)
      throw Error("gamma needs to be a positive rate.")
    this.gammaTimesN = gammaTimesN;
  }

  setAlphaTimesN(alphaTimesN){
    this.alphaTimesN = alphaTimesN;
    this.setGammaTimesN(alphaTimesN/this.P);
  }

  getLinks(){
    this.links = [];
    let self = this;

    for(let u=0; u<this.N; u++)
    {
      this.G[u].forEach(function(v){
        if (u<v)
          self.links.push(self._get_link(u,v));
      });
    }

    return this.links;
  }

  setLinks(links){
    let self = this;
    for(let i=0; i<this.N; i++)
      this.G[i].length = 0;
    links.forEach(function(l){
      let u = l.source.id;
      let v = l.target.id;
      self.G[u].push(v);
      self.G[v].push(u);
    });

    self.links = links;
    self.m = self.links.length;

  }

  update(){
    let self = this;
    let N = this.N;
    let P = this.P;
    let rate = this.gammaTimesN;
    let tau = -1/rate*Math.log(1-Math.random());

    let u = Math.floor(Math.random()*N);
    let v = Math.floor(Math.random()*(N-1));
    let reconnect = (Math.random() < P);
    if (v>=u)
      v++;

    if((this.G[u].indexOf(v) > -1) && (reconnect))
    {
      return {in: [], out: [], tau: tau};
      //return {tau:tau}
    }
    
    // delete reference to this node in old neighbors
    let _out = this.G[u].map(function(neigh) {
      let i = self.G[neigh].indexOf(u);
      self.G[neigh].splice(i,1);
      return self._get_link(u,neigh);
    });

    // delete neighbors from this node
    this.G[u].length = 0;

    let _in = [];
    if (reconnect)
    {
      // add new neighbors
      _in = this.G[v].map(function(neigh){
        self.G[neigh].push(u);
        self.G[u].push(neigh);
        return self._get_link(u,neigh);
      });
      _in.push(self._get_link(u,v));
      self.G[v].push(u);
      self.G[u].push(v);
    }

    return {out: _out, in: _in, tau: tau};
    //return {tau:tau};
  }

  updateUntil(new_time){
    let self = this;
    while (self.time < new_time)
    {
      let u = self.update();
      self.time += u.tau;
    }
  }

  getTotalEventRate() {
    return this.gammaTimesN;
  }

  updateUntilNextFrame(){
    let self = this;
    let n_events = get_poisson_rv(this.getTotalEventRate());

    let n_link_changes = {in:0, out:0};
    for(let event=0; event<n_events; event++)
    {
      let u = self.update();
      n_link_changes.in += u.in.length;
      n_link_changes.out += u.out.length;
    }
    //console.log(n_events,n_link_changes.in);
    return n_link_changes;
  }

  _get_link(a,b){
    if (a>b)
      return {source: this.nodes[b], target: this.nodes[a]};
    else
      return {source: this.nodes[a], target: this.nodes[b]};
  }

}
