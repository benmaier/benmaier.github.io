// Based on simple canvas network visualization by Mike Bostock
// source: https://bl.ocks.org/mbostock/ad70335eeef6d167bc36fd3c04378048

class forceLayout(graph,new_controls) {

  // Context //
  // ------- //
  this.controls = {
    // Physics
    'node_charge': -30,
    'node_gravity': 0.1,
    'node_size': 1.0,
    'link_distance': 10,
    'node_collision': false,
    'wiggle_nodes': false,
    'freeze_nodes': false,
  };

  // Force layout
  this.simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
      .id(d => d.id)
      .distance(controls['link_distance'])
    )
    .force("charge", d3.forceManyBody().strength(+controls['node_charge']))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(0).radius(d => controls['node_collision'] * computeNodeRadii(d)))
    .force("x", d3.forceX(width / 2)).force("y", d3.forceY(height / 2));

  simulation.force("x").strength(+controls['node_gravity']);
  simulation.force("y").strength(+controls['node_gravity']);


  function restart() {

    // Start simulation
    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

    d3.select(canvas)
      .call(d3.drag()
        .container(canvas)
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));


    if (nodePositions || controls['freeze_nodes']) {
      simulation.alpha(0).restart();
    } else {
      simulation.alpha(1).restart();
    }
  }

  function simulationSoftRestart(){
    if (!controls['freeze_nodes']){
      simulation.restart();
    } else {
      ticked();
    }
  }



  var setTitle = function(v) {
    // __li is the root dom element of each controller
    if (v) {
      this.__li.setAttribute('title', v);
    } else {
      this.__li.removeAttribute('title')
    }
    return this;
  };

  eachController(function(controller) {
    if (!controller.prototype.hasOwnProperty('title')) {
      controller.prototype.title = setTitle;
    }
  });

  // Titles
  var title1_1 = "Path to file: URL of eligible file in either JSON or CSV format"
  var title1_2 = "Upload file: Upload a network from your computer in either JSON or CSV format"
  var title1_3 = "Download figure: Download the network as a PNG image"
  var title1_4 = "Post to Python: Post all calculated node and link properties and image (optional) back to Python.";
  var title1_5 = "Zoom: Zoom in or out"
  var title2_1 = "Charge: Each node has negative charge and thus repel one another (like electrons). The more negative this charge is, the greater the repulsion"
  var title2_2 = "Gravity: Push the nodes more or less towards the center of the canvas"
  var title2_3 = "Link distance: The optimal link distance that the force layout algorithm will try to achieve for each link"
  var title2_4 = "Link distance variation: Tweak the link distance scaling function. Increase to contract strong links. Most effectful when 'Link distance' is large."
  var title2_5 = "Collision: Make it harder for nodes to overlap"
  var title2_6 = "Wiggle: Increase the force layout algorithm temperature to make the nodes wiggle. Useful for big networks that need some time for the nodes to settle in the right positions"
  var title2_7 = "Freeze: Set force layout algorithm temperature to zero, causing the nodes to freeze in their position."
  var title3_1 = 'Fill: Node color(s). If nodes have "group" attributes (unless groups are named after colors) each group is given a random color. Changing "Fill color" will continuously change the color of all groups'
  var title3_2 = "Stroke: The color of the ring around nodes"
  var title3_3 = "Label color: The color of node labels"
  var title3_4 = "Display labels: Whether to show labels or not"
  var title3_5 = "Size by strength: Rescale the size of each node relative to their strength (weighted degree)"
  var title3_6 = "Size: Change the size of all nodes"
  var title3_7 = "Stroke width: Change the width of the ring around nodes"
  var title3_8 = "Size variation: Tweak the node size scaling function. Increase to make big nodes bigger and small nodes smaller. Useful for highlighting densely connected nodes."
  var title4_1 = "Color: The color of links"
  var title4_2 = "Width: Change the width of all links"
  var title4_3 = "Alpha: How transparent links should be. Useful in large dense networks"
  var title4_4 = "Width variation: Tweak the link width scaling function. Increase to make wide links wider and narrow links narrower. Useful for highlighting strong connections"
  var title5_1 = "Singleton nodes: Whether or not to show links that have zero degree"
  var title5_2 = "Min. link percentile: Lower percentile threshold on link weight"
  var title5_3 = "Max. link percentile: Upper percentile threshold on link weight"

  // Control panel
  var gui = new dat.GUI({ autoPlace: false });
  var customContainer = document.getElementsByClassName('controls_container')[0];
  gui.width = customContainer.offsetWidth;
  gui.closed = false;
  customContainer.appendChild(gui.domElement);
  gui.remember(controls);

  // Input/Output
  var f1 = gui.addFolder('Input/output'); f1.open();
  if (isWeb) f1.add(controls, 'file_path', controls['file_path']).name('Path to file').onFinishChange(function(v) { handleURL(v) }).title(title1_1);
  if (isWeb) f1.add(controls, 'upload_file').name('Upload file').title(title1_2);
  f1.add(controls, 'download_figure').name('Download figure').title(title1_3);
  if (isLocal) f1.add(controls, 'post_to_python').name('Post to Python').title(title1_4);
  f1.add(controls, 'zoom', 0.6, 5).name('Zoom').onChange(function(v) { inputtedZoom(v) }).title(title1_5);

  // Physics
  var f2 = gui.addFolder('Physics'); f2.open();
  f2.add(controls, 'node_charge', -100, 0).name('Charge').onChange(function(v) { inputtedCharge(v) }).title(title2_1);
  f2.add(controls, 'node_gravity', 0, 1).name('Gravity').onChange(function(v) { inputtedGravity(v) }).title(title2_2);
  f2.add(controls, 'link_distance', 0.1, 50).name('Link distance').onChange(function(v) { inputtedDistance(v) }).title(title2_3);
  f2.add(controls, 'link_distance_variation', 0, 1).name('Link distance variation').step(0.01).onChange(function(v) { inputtedDistanceScaling(v) }).title(title2_4);
  f2.add(controls, 'node_collision', false).name('Collision').onChange(function(v) { inputtedCollision(v) }).title(title2_5);
  f2.add(controls, 'wiggle_nodes', false).name('Wiggle').onChange(function(v) { inputtedReheat(v) }).listen().title(title2_6);
  f2.add(controls, 'freeze_nodes', false).name('Freeze').onChange(function(v) { inputtedFreeze(v) }).listen().title(title2_7);

  // Nodes
  var f3 = gui.addFolder('Nodes'); f3.open();
  f3.addColor(controls, 'node_fill_color', controls['node_fill_color']).name('Fill').onChange(function(v) { inputtedNodeFill(v) }).title(title3_1);
  f3.addColor(controls, 'node_stroke_color', controls['node_stroke_color']).name('Stroke').onChange(function(v) { inputtedNodeStroke(v) }).title(title3_2);
  f3.addColor(controls, 'node_label_color', controls['node_label_color']).name('Label color').onChange(function(v) { inputtedTextStroke(v) }).title(title3_3);
  f3.add(controls, 'node_size', 0, 50).name('Size').onChange(function(v) { inputtedNodeSize(v) }).title(title3_6);
  f3.add(controls, 'node_stroke_width', 0, 10).name('Stroke width').onChange(function(v) { inputtedNodeStrokeSize(v) }).title(title3_7);
  f3.add(controls, 'node_size_variation', 0., 3.).name('Size variation').onChange(function(v) { inputtedNodeSizeExponent(v) }).title(title3_8);
  f3.add(controls, 'display_node_labels', false).name('Display labels').onChange(function(v) { inputtedShowLabels(v) }).title(title3_4);
  f3.add(controls, 'scale_node_size_by_strength', false).name('Size by strength').onChange(function(v) { inputtedNodeSizeByStrength(v) }).title(title3_5);

  // Links
  var f4 = gui.addFolder('Links'); f4.open();
  f4.addColor(controls, 'link_color', controls['link_color']).name('Color').onChange(function(v) { inputtedLinkStroke(v) }).title(title4_1);
  f4.add(controls, 'link_width', 0.01, 30).name('Width').onChange(function(v) { inputtedLinkWidth(v) }).title(title4_2);
  f4.add(controls, 'link_alpha', 0, 1).name('Alpha').onChange(function(v) { inputtedLinkAlpha(v) }).title(title4_3);
  f4.add(controls, 'link_width_variation', 0., 3.).name('Width variation').onChange(function(v) { inputtedLinkWidthExponent(v) }).title(title4_4);

  // Thresholding
  var f5 = gui.addFolder('Thresholding'); f5.close();
  f5.add(controls, 'display_singleton_nodes', true).name('Singleton nodes').onChange(function(v) { inputtedShowSingletonNodes(v) }).title(title5_1);
  f5.add(controls, 'min_link_weight_percentile', 0, 0.99).name('Min. link percentile').step(0.01).onChange(function(v) { inputtedMinLinkWeight(v) }).listen().title(title5_2);
  f5.add(controls, 'max_link_weight_percentile', 0.01, 1).name('Max. link percentile').step(0.01).onChange(function(v) { inputtedMaxLinkWeight(v) }).listen().title(title5_3);


  // Utility functions //
  // ----------------- //

  function computeNodeRadii(d) {
    var thisNodeSize = controls['node_size'];
    return thisNodeSize
  }

  function computeNodeColor(d) {
    if (d.color) {
      return d.color;
    } else if (d.group) {
      return activeSwatch[d.group];
    } else {
      return controls['node_fill_color'];
    }
  }

  // Handle parameter updates //
  // ------------------------ //

  // Physics
  function inputtedCharge(v) {
    simulation.force("charge").strength(+v);
    simulation.alpha(1).restart();
    if (controls['freeze_nodes']) controls['freeze_nodes'] = false;
  }

  function inputtedGravity(v) {
    simulation.force("x").strength(+v);
    simulation.force("y").strength(+v);
    simulation.alpha(1).restart();
    if (controls['freeze_nodes']) controls['freeze_nodes'] = false;
  }

  function inputtedDistance(v) {
    if (isWeighted && linkWeightOrder.length > 1 && controls['link_distance_variation'] > 0) {
      simulation.force("link").distance(d => {
        return (1 - getPercentile(d.weight, linkWeightOrder)) ** controls['link_distance_variation'] * v
      });
    } else {
      simulation.force("link").distance(v);
    }
    simulation.alpha(1).restart();
    if (controls['freeze_nodes']) controls['freeze_nodes'] = false;
  }

  function inputtedDistanceScaling(v) {
    if (isWeighted && linkWeightOrder.length > 1) {
      simulation.force("link").distance(d => {
        return (1 - getPercentile(d.weight, linkWeightOrder)) ** v * controls['link_distance']
      });
      simulation.alpha(1).restart();
      if (controls['freeze_nodes']) controls['freeze_nodes'] = false;
    }
  }

  function inputtedCollision(v) {
    simulation.force("collide").radius(function(d) { return controls['node_collision'] * computeNodeRadii(d) });
    if (!controls['freeze_nodes']) 
      simulation.alpha(1)
    
    simulationSoftRestart();
  }

  function inputtedReheat(v) {
    simulation.alpha(0.5);
    simulation.alphaTarget(v).restart();
    if (v) controls['freeze_nodes'] = !v;
  }

  function inputtedFreeze(v) {
    if (v) {
      controls['wiggle_nodes'] = !v
      simulation.alpha(0);
    } else {
      simulation.alpha(0.3).alphaTarget(0).restart();
      nodePositions = false;
    }
  }



  function inputtedNodeSize(v) {
    if (controls['node_collision']) {
      simulation.force("collide").radius(function(d) { return computeNodeRadii(d) })
      if (!controls['freeze_nodes'])
        simulation.alpha(1);
    }

    simulationSoftRestart();
  }

  function inputtedNodeStrokeSize(v) {
    simulationSoftRestart();
  }

  function inputtedNodeSizeExponent(v) {
    nodeSizeNorm = 1 / maxNodeSize ** (controls['node_size_variation'])
    if (controls['node_collision']) {
      simulation.force("collide").radius(function(d) { return computeNodeRadii(d) })
      if (!controls['freeze_nodes'])
        simulation.alpha(1);
    }

    simulationSoftRestart();
  }

  function inputtedLinkWidthExponent(v) {
    linkWidthNorm = 1 / maxLinkWeight ** (controls['link_width_variation'])
    simulationSoftRestart();
  }

  function inputtedZoom(v) {
    zoomScaler = d3.scaleLinear().domain([0, width]).range([width * (1 - controls['zoom']), controls['zoom'] * width])
    simulationSoftRestart();
  }

  var vMinPrev = 0;
  var dvMin = 0;
  function inputtedMinLinkWeight(v) {
    dvMin = v - vMinPrev
    if (shiftDown) {
      controls['max_link_weight_percentile'] = d3.min([1, controls['max_link_weight_percentile'] + dvMin])
    } else {
      controls['max_link_weight_percentile'] = d3.max([controls['max_link_weight_percentile'], v + 0.01])
    }
    dvMax = controls['max_link_weight_percentile'] - vMaxPrev
    vMinPrev = v
    vMaxPrev = controls['max_link_weight_percentile']
    shave(); restart();
  }

  var vMaxPrev = 1;
  var dvMax = 0;
  function inputtedMaxLinkWeight(v) {
    dvMax = v - vMaxPrev
    if (shiftDown) {
      controls['min_link_weight_percentile'] = d3.max([0, controls['min_link_weight_percentile'] + dvMax])
    } else {
      controls['min_link_weight_percentile'] = d3.min([controls['min_link_weight_percentile'], v - 0.01])
    }
    dvMin = controls['min_link_weight_percentile'] - vMinPrev
    vMinPrev = controls['min_link_weight_percentile']
    vMaxPrev = v
    shave(); restart();
  }


  // Handle input data //
  // ----------------- //

  function handleURL() {
    if (controls['file_path'].endsWith(".json")) {
      d3.json(controls['file_path'], function(error, _graph) {
        if (error) {
          Swal.fire({ text: "File not found", type: "error" })
          return false
        }
        restartIfValidJSON(_graph);
      })
    } else if (controls['file_path'].endsWith(".csv")) {
      try {
        fetch(controls['file_path']).then(r => r.text()).then(r => restartIfValidCSV(r));
      } catch (error) {
        throw error;
        Swal.fire({ text: "File not found", type: "error" })
      }
    }
  }


  function restartIfValidJSON(masterGraph) {

    // Check for 'nodes' and 'links' lists
    if (!masterGraph.nodes || masterGraph.nodes.length == 0) {
      Swal.fire({ text: "Dataset does not have a key 'nodes'", type: "error" })
      return false
    }
    if (!masterGraph.links) {
      Swal.fire({ text: "Dataset does not have a key 'links'", type: "warning" })
    }

    // Check that node and link objects are formatted right
    for (var d of masterGraph.links) {
      if (!d3.keys(d).includes("source") || !d3.keys(d).includes("target")) {
        Swal.fire({ text: "Found objects in 'links' without 'source' or 'target' key.", type: "error" });
        return false;
      }
    }

    // Check that 'links' and 'nodes' data are congruent
    var nodesNodes = masterGraph.nodes.map(d => { return d.id });
    var nodesNodesSet = new Set(nodesNodes)
    var linksNodesSet = new Set()
    masterGraph.links.forEach(l => {
      linksNodesSet.add(l.source); linksNodesSet.add(l.source.id)  // Either l.source or l.source.id will be null
      linksNodesSet.add(l.target); linksNodesSet.add(l.target.id)  // so just add both and remove null later (same for target)
    }); linksNodesSet.delete(undefined)

    if (nodesNodesSet.size == 0) {
      Swal.fire({ text: "No nodes found.", type: "error" })
      return false;
    }
    if (nodesNodes.includes(null)) {
      Swal.fire({ text: "Found items in node list without 'id' key.", type: "error" });
      return false;
    }
    if (nodesNodes.length != nodesNodesSet.size) {
      Swal.fire({ text: "Found multiple nodes with the same id.", type: "error" });
      return false;
    }
    if (nodesNodesSet.size < linksNodesSet.size) {
      Swal.fire({ text: "Found nodes referenced in 'links' which are not in 'nodes'.", type: "error" });
      return false;
    }

    // Check that attributes are indicated consistently in both nodes and links
    countWeight = masterGraph.links.filter(n => { return 'weight' in n }).length
    if (0 < countWeight & countWeight < masterGraph.links.length) {
      Swal.fire({ text: "Found links with and links without 'weight' attribute", type: "error" });
      return false;
    } else if (countWeight == 0) {
      masterGraph.links.forEach(l => { l.weight = 1; })
    }
    var countGroup = masterGraph.nodes.filter(n => { return 'group' in n }).length
    if (0 < countGroup & countGroup < masterGraph.nodes.length) {
      Swal.fire({ text: "Found nodes with and nodes without 'group' attribute", type: "error" });
      return false;
    }
    countSize = masterGraph.nodes.filter(n => { return 'size' in n }).length
    if (0 < countSize & countSize < masterGraph.nodes.length) {
      Swal.fire({ text: "Found nodes with and nodes without 'size' attribute", type: "error" });
      return false;
    }
    else if (countSize == 0) {
      masterGraph.nodes.forEach(n => { n.size = 1; })
    }

    // Reference graph (is never changed)
    window.masterGraph = masterGraph

    // Size and weight norms, colors and degrees
    computeMasterGraphGlobals();
    console.log("minNonzeroNodeSize = "+minNonzeroNodeSize);

    // Check for really weak links
    if (minLinkWeight < 1e-9) {
      Swal.fire({ text: "Found links with weight < 1e-9. This may cause trouble with precision.", type: "warning" });
    }

    // Active graph that d3 operates on
    window.graph = _.cloneDeep(masterGraph)

    // Container for part of the network which are not in `graph` (for faster thresholding)
    window.negativeGraph = { 'nodes': [], 'links': [] }

    // If 'display_singleton_nodes' is untoggled then the graph should be updated
    inputtedShowSingletonNodes(controls['display_singleton_nodes'])
    inputtedNodeSizeByStrength(controls['scale_node_size_by_strength'])

    // If 'scale_node_size_by_strength' is toggled, then node sizes need to follow computed degrees
    if (controls['scale_node_size_by_strength']) {
      if (controls['display_singleton_nodes']){
        graph.nodes.forEach(n => { n.size = nodeStrengths[n.id] > 0.0 ? nodeStrengths[n.id] : minNonzeroNodeSize })
      } else {
        graph.nodes.forEach(n => { n.size = nodeStrengths[n.id] })
      }
    }

    // Reset all thresholds ...
    // commented this out because it overwrites the predefined values in `config`
    // controls["min_link_weight_percentile"] = 0
    // controls["max_link_weight_percentile"] = 1

    // Run the restart if all of this was OK
    restart();
  }


  function restartIfValidCSV(rawInput) {

    // Assume hsleader is "source,target(,weight)"
    var nodes = new Set();
    var links = d3.csvParse(rawInput).map(l => {
      nodes.add(l.source); nodes.add(l.target);
      return { 'source': l.source, 'target': l.target, 'weight': +valIfValid(l.weight, 1) }
    })

    // Warn against zero links
    var zeroLinksCount = 0
    links = links.filter(l => {
      if (l.weight == 0) {
        zeroLinksCount += 1;
      } else {
        return l;
      }
    })

    if (zeroLinksCount > 0) {
      Swal.fire({ text: "Removed " + zeroLinksCount + " links with weight 0", type: "warning" })
    }

    // Reference graph (is never changed)
    window.masterGraph = {
      'nodes': Array.from(nodes).map(n => { return { 'id': n, 'size': 1 } }),
      'links': links
    }

    // Size and weight norms, colors and degrees
    computeMasterGraphGlobals();
    console.log("minNonzeroNodeSize = "+minNonzeroNodeSize);

    // Check for really weak links
    if (minLinkWeight < 1e-9) {
      Swal.fire({ text: "Found links with weight < 1e-9. This may cause trouble with precision.", type: "warning" });
    }

    // Active graph that d3 operates on
    window.graph = _.cloneDeep(masterGraph)

    // If 'display_singleton_nodes' is untoggled then the graph should be updated
    inputtedShowSingletonNodes(controls['display_singleton_nodes'])
    inputtedNodeSizeByStrength(controls['scale_node_size_by_strength'])

    // If 'scale_node_size_by_strength' is toggled, then node sizes need to follow computed degrees
    if (controls['scale_node_size_by_strength']) {
      if (controls['display_singleton_nodes']){
        graph.nodes.forEach(n => { n.size = nodeStrengths[n.id] > 0.0 ? nodeStrengths[n.id] : minNonzeroNodeSize })
      } else {
        graph.nodes.forEach(n => { n.size = nodeStrengths[n.id] })
      }
    }

    // Container for part of the network which are not in `graph` (for faster thresholding)
    window.negativeGraph = { 'nodes': [], 'links': [] }

    // Reset all thresholds ...
    // commented this out because it overwrites the predefined values in `config`
    // controls["min_link_weight_percentile"] = 0
    // controls["max_link_weight_percentile"] = 1

    restart();
  }

}
