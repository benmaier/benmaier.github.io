"use strict";

class graph {
  constructor(nodes,links){
    for(let i=0; i<this.N; i++)
      this.G.push([]);

    links.forEach(){

    }

  }

  _get_link(a,b){
    if (a>b)
      return {source: this.nodes[b], target: this.nodes[a]};
    else
      return {source: this.nodes[a], target: this.nodes[b]};
  }

}
