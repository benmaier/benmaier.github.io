"use strict";

class eam {

  constructor(nodes,parameters)
  {
    let params = {
      rho: 0.1,
      link_decay_rate: 1.0
    };

    let self = this;

    Reflect.ownKeys(parameters).forEach(function(key){
      params[key] = parameters[key];
    });

    this.nodes = nodes;
    this.N = nodes.length;
    this.rho = params.rho;
    this.setLinkDecayRate(params.link_decay_rate);
    this.links = [];
    this.G = [];
    this.m = 0;

    for(let i=0; i<this.N; i++)
      this.G.push([]);

    for(let i=0; i<this.N-1; i++)
    {
      for (let j=i+1; j<this.N; j++)
      {
        if (Math.random() < this.rho)
        {
          this.G[i].push(j);
          this.G[j].push(i);
          this.m++;
          this.links.push(self._get_link(i,j));
        }
      }
    }
  }

  setRho(rho){
    if (rho > 1.0)
      rho = 1.0;
    else if (rho < 0.0)
      rho = 0.0;
    this.rho = rho;
    this.setLinkDecayRate(this.link_decay_rate);
  }

  setLinkDecayRate(l){
    if (l<=0)
      throw Error("The link decay rate has to be positive");

    this.link_decay_rate = l;
    this.link_change_rate = 2*this.rho*this.link_decay_rate;
    this.l_minus = this.link_decay_rate;
    this.l_plus = this.l_minus*this.rho/(1-this.rho);
  }

  setAlphaTimesN(alphaTimesN){
    let k = this.rho*(N-1);
    let P = k/(k+1);
    this.setGammaTimesN(alphaTimesN/P);
  }

  setGammaTimesN(gammaTimesN){
    this.setLinkDecayRate(2*gammaTimesN/N);
  }

  getLinks(){
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

  getTotalEventRate() {
    let N = this.N;
    let decay_rate = this.m * this.l_minus;
    let creation_rate = (N*(N-1)/2-this.m) *this.l_plus;
    let rate = decay_rate + creation_rate;
    return rate;
  }

  update(){
    let self = this;
    let N = this.N;
    let decay_rate = this.m * this.l_minus;
    let creation_rate = (N*(N-1)/2-this.m) *this.l_plus;
    let rate = decay_rate + creation_rate;
    let tau = -1/rate * Math.log(1-Math.random());

    let _in = [];
    let _out = [];

    if (Math.random()*rate < decay_rate)
    {
      //decay event
      let l = Math.floor(Math.random()*self.m);
      let link = this.links.splice(l, 1)[0];
      let u = link.source.id,
          v = link.target.id;

      this.G[v].splice(this.G[v].indexOf(u),1);
      this.G[u].splice(this.G[u].indexOf(v),1);

      _out.push(self._get_link(u,v));
      this.m--;
    }
    else
    {
      //creation event
      let u, v;
      do
      {
        u = Math.floor(Math.random() * N);
        v = Math.floor(Math.random() * (N-1));
        if (v>=u)
          v++;
      } while (this.G[u].indexOf(v) > -1);

      let link = self._get_link(u,v);
      _in.push(link);
      this.links.push(link);
      this.G[u].push(v);
      this.G[v].push(u);
      this.m++;
    }

    //this.links = this.links.filter();
    return {out: _out, in: _in, tau: tau};
  }

  updateUntil(new_time){
    let self = this;
    while (self.time < new_time)
    {
      let u = self.update();
      self.time += u.tau;
    }
  }

  updateUntilNextFrame(){
    let self = this;
    let n_events = get_poisson_rv(this.getTotalEventRate());

    let n_link_changes = {in: 0, out: 0};
    for(let event=0; event<n_events; event++)
    {
      let u = self.update();
      n_link_changes.in += u.in.length;
      n_link_changes.out += u.out.length;
    }
    return n_link_changes;
  }

  _get_link(a,b){
    if (a>b)
      return {source: this.nodes[b], target: this.nodes[a]};
    else
      return {source: this.nodes[a], target: this.nodes[b]};
  }

}
