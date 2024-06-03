"use strict";

class randomWalk {

  constructor(nodes,links,walkers,parameters={},time=0)
  {
    let params = {
      mark_visited: false
    };

    let self = this;

    Reflect.ownKeys(parameters).forEach(function(key){
      params[key] = parameters[key];
    });


    this.time = time;
    this.nodes = nodes
    this.N = this.nodes.length;
    this.mark_visited = params.mark_visited;
    this.walkers = walkers;
    this.G = [];
    for(let i=0; i<this.N; i++)
      this.G.push([]);

    this.setLinks(links);
    this.walkers.forEach((w,i) => {
      w.x = w.node.x;
      w.y = w.node.y;
      if (self.mark_visited)
        w.node.status = 'visited';
      w.status = 'resting';
    });

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

  update(dt=0){
    let self = this;

    self.walkers.forEach(function(w){
        let src = w.node.id;
        if (self.G[src].length == 0)
          w.target = w.node;
        else
          w.target = self.nodes[self.G[src][Math.floor(Math.random()*self.G[src].length)]];
    });

    let coords = { t: 0 };

    const tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
        .to({ t: 1}, dt) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
            // Move 'box' to the position described by 'coords' with a CSS translation.
            self.walkers.forEach(function(w,i){
              w.t = coords.t;
            });
        })
        .onStart(()=>{
            self.walkers.forEach(function(w){
              w.t = coords.t;
              w.status = 'tweening';
            });
        })
        .onComplete(() => {
            self.walkers.forEach(function(w,i){
              w.node = w.target;
              if (self.mark_visited)
                w.node.status = 'visited';
              w.status = 'resting';
            });
        })
        .start(); // Start the tween immediately.
  }

  _get_link(a,b){
    if (a>b)
      return {source: this.nodes[b], target: this.nodes[a]};
    else
      return {source: this.nodes[a], target: this.nodes[b]};
  }

}
