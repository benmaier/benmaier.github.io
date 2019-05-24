
var defaultNodeCol = "white",
    highlightCol = "yellow";

var height = window.innerHeight;
var graphWidth =  window.innerWidth;

var graphCanvas = d3.select('#graphDiv').append('canvas')
.attr('width', graphWidth + 'px')
.attr('height', height + 'px')
.node();

var context = graphCanvas.getContext('2d');

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(graphWidth / 2, height / 2))
              .force("x", d3.forceX(graphWidth / 2).strength(0.01))
              .force("y", d3.forceY(height / 2).strength(0.01))
              .force("charge", d3.forceManyBody().strength(-200))
              .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }).distance(100))
              .alphaTarget(0)
              .alphaDecay(0.05)

var transform = d3.zoomIdentity;


d3.json("sample_data.json",function(error,data){
  console.log(data)

  initGraph(data)

  function initGraph(tempData){



    var graph = {};

    tempData.nodes.forEach(function(d){
        graph[d.id] = [];
    });

    tempData.edges.forEach(function(d){
        graph[d.source].push(d.target);
    });
    console.log(graph);
    var gui = new dat.GUI();

    var r1 = {r:55};
    var r2 = {r:32};
    var cr = {curvature:0.6};
    var linewidth = {width:3};
    var linkalpha = {alpha:0.8};
    var nodestrokewidth = {nodestrokewidth:3};
    var headlength = {headlength:4};
    var headwidth = {headwidth:1};
    gui.add(r1, 'r', 2, 100).onChange(render);
    gui.add(r2, 'r', 2, 100).onChange(render);
    gui.add(cr, 'curvature', 0, 2).onChange(render);
    gui.add(linewidth, 'width', 1, 5).onChange(render);
    gui.add(linkalpha, 'alpha', 0, 1).onChange(render);
    gui.add(nodestrokewidth, 'nodestrokewidth', 0, 10).onChange(render);
    gui.add(headlength, 'headlength', 0, 10).onChange(render);
    gui.add(headwidth, 'headwidth', 0, 2).onChange(render);

    function zoomed() {
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }

    d3.select(graphCanvas)
        .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end",dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

  function dragsubject() {
    var i,
    x = transform.invertX(d3.event.x),
    y = transform.invertY(d3.event.y),
    dx,
    dy;
    for (i = tempData.nodes.length - 1; i >= 0; --i) {
      node = tempData.nodes[i];
      dx = x - node.x;
      dy = y - node.y;
      let radius;
      if (i == 0)
        radius = r1.r;
      else
        radius = r2.r;


      if (dx * dx + dy * dy < radius * radius) {

        node.x = transform.applyX(node.x);
        node.y = transform.applyY(node.y);

        return node;
      }
    }
  }


  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);

  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

    simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);



    function render(){
        simulationUpdate();
    }

    function simulationUpdate(){
      context.save();

      context.clearRect(0, 0, graphWidth, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {

            if (d.target.id == 0)
              d.target.radius = r1.r;
            else
              d.target.radius = r2.r;

            if (d.source.id == 0)
              d.source.radius = r1.r;
            else
              d.source.radius = r2.r;

            let link_back_exists = (graph[d.target.id].indexOf(d.source.id) >= 0);
            let this_link = new ArrowedLink(d.source, d.target, link_back_exists);

            this_link.nodeStrokeWidth(nodestrokewidth.nodestrokewidth)
                     .linkWidth(linewidth.width)
                     .arrowHeadLengthScalar(headlength.headlength)
                     .arrowHeadWidthScalar(headwidth.headwidth)
                     .curvatureScalar(cr.curvature)
                     .linkStyle("rgba(0,0,0,"+linkalpha.alpha+")");
            this_link.draw(context);

            
        });

        // Draw the nodes
        tempData.nodes.forEach(function(d, i) {

            context.beginPath();
            let radius;
            if (d.id == 0)
              radius = r1.r;
            else
              radius = r2.r;

            context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
            context.lineWidth = nodestrokewidth.nodestrokewidth;
            //context.fillStyle = d.col ? "red":"black"
            context.fillStyle = "white";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
        });

        context.restore();
//        transform = d3.zoomIdentity;
    }
  }
})
