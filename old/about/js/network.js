


//======================== Network and Force Layout =========================


var width = 350,
    height = 350;
var opacity = 0.8;
var d_opac = 0.6;

var started = false;

var color;
var d_color=0.92;

var nodes = [],
    links = [];

var radius = d3.scale.sqrt()
                .domain([0,20])
                .range([1,5]);
                //.range([2,5]);
//var thickness = d3.scale.linear()
//                .

var pause_for_new_connection = 2000;    

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-15)
    .linkDistance(10)
    .size([width, height])
    .on("tick", tick);


var network_svg = d3.select("#network")//.append("network_svg")
    .attr("width", width)
    .attr("height", height);

var node = network_svg.selectAll(".node"),
    link = network_svg.selectAll(".link");

var graph = {};
var initial_nodes = [];
var initial_links = [];
//var xi = 0.55
var B = 6;
var L = 3;
var N = Math.pow(B,L);
var k = 5;
var mu = -0.8;
var xi = Math.pow(B,mu);

nodes = force.nodes();
links = force.links();

init();

function get_linkdistance(k,mu){
    if ((k>5) && (mu>-0.2)) {
        return 20;
    } else if ((k>7) && (mu>0.2)) {
        return 100;
    } else {
        return 10;
    }

}

function get_charge(k,mu){
    if ((k>5) && (mu>-0.2)) {
        return -30;
    } else if ((k>7) && (mu>0.2)) {
        return -200;
    } else {
        return -15;
    }
}

function get_link_list_mhrn(B,L,k,mu) {
    var xi = Math.pow(B,mu);
    return get_mhrn_edge_list(B,L,k,xi);
}

function get_link_list_old(mu_,k_,N_,use_hier_dist,redist_exc_prob){
    var link_list = Array();
    var p;
    if (use_hier_dist) {
        p = get_prob_dist(mu_,k_,N_,redist_exc_prob);
    } else {
        p = get_small_world_dist(mu_-1,k_,N_);
    }

    var source_count = [];
    for(var node=0; node<N_; node++){
        source_count[node] = 0;
    }


    var link_count = 0;
    for(var i=0; i<N_-1; i++){
        for(var j=i+1; j<N_; j++){
            var deltaN = j-i;            
            if (Math.random()<p[deltaN-1]) {
                var edge = {};
                edge.source = i;
                edge.target = j;
                link_count++;
                var source;
                if (deltaN<=N_/2) {
                    source = i;
                } else {
                    source = j;
                }
                source_count[source] += 1;
                edge.label = source+"-"+source_count[source];

                link_list.push(edge);
            }
        }
    }
    return link_list;
}

function get_small_world_dist(logp,k_,N_) {
    k_ = Math.floor(k_/2);
    N_ = Math.floor(N_);
    var pr = Math.pow(10,logp);

    //fill distance probability array
    var p = [];
    for(var i=0; i<N_-1; i++)
        p.push(0.0);

    p_near = (1-(N_-1-2*k_)/(N_-1)*pr);
    p_far = 2*k_*pr/(N_-1);

    //get right arm of distribution
    for(var neigh=0; neigh<k_; neigh++){
        p[neigh] = p_near;
        p[N_-2-neigh] = p_near;
    }
    for(var neigh=k_; neigh<N_-1-k_; neigh++)
        p[neigh] =  p_far;
    
    return p;
}

function get_prob_dist(mu_,k_,N_,redistribute_excess_probability) {

    //fill distance probability array
    var p = [];
    var sum_p = 0.;

    //get right arm of distribution
    for(var neigh=1; neigh<=N_/2; neigh++){
        var p_ = Math.pow(neigh,mu_-1.0);
        sum_p += p_;
        p.push(p_);
    }

    //get left arm of distribution
    var begin;
    if (N_ % 2 == 0){
        begin = Math.floor(N_/2)-1;
    } else {
        begin = Math.floor(N_/2);
    }
    for(var neigh=begin; neigh>0; neigh--){
        var p_ = Math.pow(neigh,mu_-1.0);
        sum_p += p_;
        p.push(p_);
    }

    //norm distribution
    for(var neigh=0; neigh<p.length; neigh++){
        p[neigh] *= k_/sum_p;
    }

    if (redistribute_excess_probability) {
        var neigh = 0;
        var excess_probability = 0;
        while ( (p[neigh]>=1) && (neigh<=N_/2)) {
            excess_probability += p[neigh] - 1;
            p[neigh] = 1;
            p[N_-2-neigh] = 1;
            neigh += 1;
        }
        while ((excess_probability>0) && (neigh<=N_/2)) {
            var dP = 1 - p[neigh];
            if (excess_probability>=dP) {
                p[neigh] = 1;
                p[N_-2-neigh] = 1;
                excess_probability -= dP;
            } else {
                p[neigh] += excess_probability;
                p[N_-2-neigh] += excess_probability;
                excess_probability = 0;
            }
            neigh += 1;
        }
    }

    return p;
}

function init() {
   
  N = Math.pow(B,L);
  
  for(var i=0; i<N; i++){
      nodes.push({"id": i});
  }

  //var new_links = get_link_list(mu,k,N,true,true);
  var new_links = get_link_list_mhrn(6,3,k,mu);
  links.push.apply(links,new_links);

  //link = link.data(force.links(), function(d) { return d.source+"-"+d.target;});
  link = link.data(force.links(), function(d) { return d.label;});
  link.enter()
        .insert("line", ".node")
        .attr("class", "link");
  link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  link.exit()
        .remove();

  node = node.data(force.nodes(), function(d) { return d.id; });
  node.enter().append("circle")
       .attr("class","node")
       .attr("fill", "#000000")
        .attr("r", 5);
  node.call(force.drag);

  updateNetwork();
  //start_dist_and_cluster(true,true);
  //force.start();

}

function updateNetwork() {
   
  var oldN = N;
  N = Math.pow(B,L);

  console.log(N-oldN);
  
  if (oldN > N) {
      nodes.splice(N,oldN-N);
  } else if (oldN < N) {
      for(var i=oldN; i<N; i++)
          nodes.push({id:i});
  }

  //update the force drawing parameters
  force.linkDistance(get_linkdistance(k,mu));
  force.charge(get_charge(k,mu));
  
  //stop calculating node positions
  force.stop();

  //document.getElementById('showxi').innerHTML = xi;

  var redist_exc_prob = true;
  var use_hierarchical_dist = true;
  //var new_links = get_link_list(mu,k,N,use_hierarchical_dist,redist_exc_prob);
  console.log(B,L,k,mu);
  var new_links = get_link_list_mhrn(B,L,k,mu);

  var get_new_nodes = {};
  var degree = new Array(nodes.length)

  var new_nodes = [];
  for(i=0;i<N;i++){
     new_nodes.push(i); 
  }

  for(i=0;i<nodes.length;i++){
      degree[i]=0;
  }

  for (var i=0; i<new_links.length; i++){
      get_new_nodes[i] = { source: nodes[new_links[i].source],
                           target: nodes[new_links[i].target],
                           label: new_links[i].label,
                         };
      degree[new_links[i].source]++;
      degree[new_links[i].target]++;
  }

  links.length = 0;

  for (var i=0; i<new_links.length; i++){
      force.alpha(0.);
      //if (!(links[i].label in get_new_nodes))
      links.push({});
      links[i].source = get_new_nodes[i].source;
      links[i].target = get_new_nodes[i].target;
      links[i].label = get_new_nodes[i].label;
      //links.push(get_new_nodes[i]);
  }

  var show_redist = true;
  var pause = (started && show_redist )? pause_for_new_connection : 0;

  link = link.data(force.links(), function(d) { return d.label; });
  //link = link.data(force.links(), function(d) { return d.source.id+"-"+d.target.id;});
  link.enter()
        .insert("line",".node")
        .attr("class", "link")
        .style("stroke-opacity", 0);
  link.transition().duration(pause)
        .each("start",function(){/*force.stop();*/})
        //.style("stroke-opacity",function(d){ return opacity*Math.pow(d_opac,d.L-1); })
        //.style("stroke-width",function(d){ return 1.5*d.L; })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke-opacity", 0.99)
        .each("end",function(){force.start(); started=true;}); //Callback: after the end of the transition, the force module starts again.
  link.exit()
        .transition().duration(pause)
        .style("stroke-opacity", 0)
        .remove();

  var community = jLouvain().nodes(new_nodes).edges(new_links);
  var community_assignment_result = community();
  var node_ids = Object.keys(community_assignment_result);

    var max_community_number = 0;
    node_ids.forEach(function(d){
      nodes[d].community = community_assignment_result[d];
      max_community_number = max_community_number < community_assignment_result[d] ? community_assignment_result[d]: max_community_number;
    });


  color = d3.scale.category20().domain(d3.range([0, max_community_number]));

  node = node.data(nodes, function(d) { return d.id; } );
  node.enter().append("circle")
       .attr("class","node")
       .attr("fill", function(d) { 
                //group_sub_level = Math.floor((d.id) / B) % B - Math.floor(B/2-1);
                //var c = d3.rgb(color(d.group));
                //c.r = Math.floor(c.r*Math.pow(d_color,group_sub_level));
                //c.g = Math.floor(c.g*Math.pow(d_color,group_sub_level));
                //c.b = Math.floor(c.b*Math.pow(d_color,group_sub_level));
                //group_sub_level = Math.floor((d.id) / B) % B;
                //var c = d3.hsl(color(0));
                //c.l = c.l*Math.pow(d_color,-group_sub_level);
                //return c.toString(); 
           console.log(d.community);
           return color(d.community);
       });
  node.transition().duration(pause)
        .attr("r", function(d,i) { return radius(degree[i]); })
       .attr("fill", function(d) { 
           return color(d.community);
       });
  node.exit().remove().transition();
  node.call(force.drag());


}

function tick() {
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
}




