"use strict";

let N = 1000;
let nodes = d3.range(N).map(function(){return {x:(Math.random()-0.5)*100,y:(Math.random()-0.5)*100}});
let pawns = new PawnLayout();
pawns.set_nodes(nodes);

function walk()
{
  nodes.forEach(function(n){
    n.x += 0.1*Math.random();
    n.y += 0.1*Math.random();
  });
  console.log("hi")
}


setInterval(walk,10);


