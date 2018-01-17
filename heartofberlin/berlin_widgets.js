function start_widgets() {
    var controlbox_width = width,
        controlbox_height = 200,
        n_grid_x = 24, // these two variables
        n_grid_y = 8; // are used for putting a grid on the controls panels


    // this is the svg for the controls

    var controls = d3.selectAll("svg")
        .attr("width",controlbox_width)
        .attr("height",controlbox_height)
        .attr("class","explorable_widgets")
        .style("border","1px solid black")


    // this defines a grid, only used for making it easier to place widgets
    // kind of a simple integer internal coordinate system

    var g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);

    var anchors = g.lattice(); // g has a method that returns a lattice with x,y coordinates

    // here we draw the lattice (usually not done in production)

    ///////////////////
    // buttons
    ///////////////////

    // we first define the button parameters
        /*

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
        */


    ///////////////////
    // toggles
    ///////////////////

    // we first define the toggle parameters

    var t1 = {id:"heart", name: "warp for time spent",  value: mode=='new'};
    var t2 = {id:"hourly", name: "show hourly",  value: true};

    // now the array of toggle objets

    var toggles = [
        widget.toggle(t2).label("right"),
        widget.toggle(t1).label("right").fontSize("20").label("right").size(20).border(3).update(function(d){switchmode();})
    ]

    // here comes the block for the toggles

    var togglebox = g.block({x0:1,y0:2,width:4,height:4}).Ny(toggles.length);

    // and here we att them to the panel

    controls.selectAll(".toggle").data(toggles).enter().append(widget.toggleElement)
        .attr("transform",function(d,i){return "translate("+togglebox.x(0)+","+togglebox.y(i)+")"});	


        ///////////////////
        // sliders
        ///////////////////	

        var x1 = {id:"speed", name: "speed", range: [-1.5,0], value: -0.4};


        var sliders = [
            widget.slider(x1).label("right").update(function(){ adjustSpeed(x1.value); })
        ]

        var sliderbox = g.block({x0:0.5,y0:3.5,width:8.2,height:1}).Ny(1);

        sliders.forEach(function(d){
            d.width(sliderbox.w())
        })


        controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
            .attr("transform",function(d,i){return "translate("+sliderbox.x(0)+","+sliderbox.y(i)+")"});	


        ///////////////////
        // sliders
        ///////////////////	


        var r1 = {id:"r1", name:"labels", choices: ["Berlin","personal","none"], value:1 };

        var radios = [
            widget.radio(r1).label("right").shape("round").update(function(){
                labels = all_labels[r1.value];
            })
        ]


        var radiobox  = g.block({x0:14,y0:1,width:3,height:5}).Nx(1);


        radios.forEach(function(d){
            d.size(radiobox.h())
        })

        controls.selectAll(".radio").data(radios).enter().append(widget.radioElement)
            .attr("transform",function(d,i){return "translate("+radiobox.x(i)+","+radiobox.y(0)+")"});	

}




        
