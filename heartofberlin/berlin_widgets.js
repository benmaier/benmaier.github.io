var controlbox_width = 600,
    controlbox_height = 600,
    n_grid_x = 24, // these two variables
    n_grid_y = 24; // are used for putting a grid on the controls panels


// this is the svg for the controls

var controls = d3.selectAll("body").append("svg")
    .attr("width",controlbox_width)
    .attr("height",controlbox_height)
    .attr("class","explorable_widgets")
    .style("border","1px solid black")


// this defines a grid, only used for making it easier to place widgets
// kind of a simple integer internal coordinate system

var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);

var anchors = g.lattice(); // g has a method that returns a lattice with x,y coordinates

// here we draw the lattice (usually not done in production)

controls.selectAll(".grid").data(anchors).enter().append("circle")
    .attr("class","grid")
    .attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
    .attr("r",1)
    .style("fill","black")
    .style("stroke","none")

///////////////////
// buttons
///////////////////

// we first define the button parameters

var b1 = { id:"b1", name:"shoe", actions: ["play"], value: 0};
var b2 = { id:"b2", name:"shoe", actions: ["stop"], value: 0};
var b3 = { id:"b3", name:"", actions: ["pause"], value: 0};
var b4 = { id:"b4", name:"bucket", actions: ["reload"], value: 0};
var b5 = { id:"b5", name:"insect killer", actions: ["rewind"], value: 0};
var b6 = { id:"b6", name:"ape house", actions: ["play","pause","stop","rewind"], value: 0};

// values of these parameters are changed when the widget is activated

// now we generate the button objects and put them into an array, the last button is modified a bit from its default values

var buttons = [
    widget.button(b1),
    widget.button(b2),
    widget.button(b3),
    widget.button(b4),
    widget.button(b5),
    widget.button(b6).shape("rect").size(80).symbolSize(50).label("top").update(function(d){console.log(d.value)}).fontSize(20)
]
// now we define a block in the control panel where the buttons should be placed

var buttonbox = g.block({x0:2,y0:21,width:20,height:0}).Nx(buttons.length);

// now we draw the buttons into their block

controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
    .attr("transform",function(d,i){return "translate("+buttonbox.x(i)+","+buttonbox.y(0)+")"});	


///////////////////
// toggles
///////////////////

// we first define the toggle parameters

var t1 = {id:"t1", name: "nail",  value: false};
var t2 = {id:"t2", name: "explosion",  value: true};
var t3 = {id:"t3", name: "gonk",  value: true };
var t4 = {id:"t4", name: "slob",  value: false };

// now the array of toggle objets

var toggles = [
    widget.toggle(t1),
    widget.toggle(t2),
    widget.toggle(t3).update(function(d){console.log(d)}),
    widget.toggle(t4).label("bottom").fontSize("20").label("right").size(20).border(3).update(function(d){console.log(d.value ? "wurst" : "eimer")})
]

// here comes the block for the toggles

var togglebox = g.block({x0:2,y0:2,width:4,height:6}).Ny(toggles.length);

// and here we att them to the panel

controls.selectAll(".toggle").data(toggles).enter().append(widget.toggleElement)
    .attr("transform",function(d,i){return "translate("+togglebox.x(i)+","+togglebox.y(i)+")"});	


    ///////////////////
    // sliders
    ///////////////////	

    var x1 = {id:"onk", name: "domishness", range: [0,2], value: 0.5};
    var x2 = {id:"tantor", name: "brunk", range: [0,0.1], value: 0};
    var x3 = {id:"ghult", name: "swutch", range: [0,1], value: 0.2};


    var sliders = [
        widget.slider(x1),
        widget.slider(x2),
        widget.slider(x3).handleSize(20).trackSize(10).trackBorder(2).update(function(){console.log(x3.value)})
    ]

    var sliderbox = g.block({x0:2,y0:12,width:20,height:4}).Ny(3);

    sliders.forEach(function(d){
        d.width(sliderbox.w())
    })


    controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
        .attr("transform",function(d,i){return "translate("+sliderbox.x(0)+","+sliderbox.y(i)+")"});	


    ///////////////////
    // sliders
    ///////////////////	


    var r1 = {id:"r1", name:"Systems", choices: ["Wand","Stuhl","Birne","Zahn","Biomüll"], value:3 };
    var r2 = {id:"r2", name:"Gozze", choices: ["a","r","s","c","h"], value:1 };

    var radios = [
        widget.radio(r2).label("left").shape("round"),
        widget.radio(r1)
    ]


    var radiobox  = g.block({x0:18,y0:0,width:3,height:6}).Nx(2);


    radios.forEach(function(d){
        d.size(radiobox.h())
    })

    controls.selectAll(".radio").data(radios).enter().append(widget.radioElement)
        .attr("transform",function(d,i){return "translate("+radiobox.x(i)+","+radiobox.y(0)+")"});	






    
