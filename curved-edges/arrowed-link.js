class ArrowedLink {
  // source and target need to be objects with properties `x`, `y`, and `radius`

  constructor(source, target, link_back_exists=false)
  {
    this.source = source;
    this.target = target;
    this.link_back_exists = link_back_exists;

    this.initGeom();

    this.nodeStrokeWidth(0);
    this.linkWidth(1);
    this.arrowHeadLengthScalar(3);
    this.arrowHeadWidthScalar(1);
    this.curvatureScalar(0.25);
    this.linkStyle("black");
  }

  initGeom()
  {

    this.P0 = { x: this.source.x, y: this.source.y };
    this.P2 = { x: this.target.x, y: this.target.y };

    // unit vector source-> target
    this.e = { 
              xp: this.P2.x - this.P0.x,
              yp: this.P2.y - this.P0.y
            };

    // distance source->target
    this.D = Math.sqrt( this.e.xp*this.e.xp + this.e.yp*this.e.yp );
    this.e.xp /= this.D;
    this.e.yp /= this.D;

    // normal vector;
    this.ep1 = { xp: -this.e.yp, yp: this.e.xp };
  }

  nodeStrokeWidth(w)
  {
    if (!arguments.length) return this.node_stroke_width;

    this.node_stroke_width = w;
    this.target_radius = this.target.radius + 0.5 * w;
    this.source_radius = this.source.radius + 0.5 * w;
    return this;
  }

  linkWidth(w)
  {
    if (!arguments.length) return this.link_width;

    this.link_width = w;
    this.head_length = this.arrow_head_length_scalar * this.link_width;
    return this;
  }

  arrowHeadLengthScalar(l)
  {
    if (!arguments.length) return this.arrow_head_length_scalar;

    this.arrow_head_length_scalar = l;
    this.head_length = this.arrow_head_length_scalar * this.link_width;
    return this;
  }

  arrowHeadWidthScalar(w)
  {
    if (!arguments.length) return this.arrow_head_width_scalar;

    this.arrow_head_width_scalar = w;
    return this;
  }

  curvatureScalar(c)
  {
    if (!arguments.length) return this.curvature_scalar;

    this.curvature_scalar = c;
    return this;
  }

  linkStyle(s)
  {
    if (!arguments.length) return this.link_style;

    this.link_style = s;
    return this;
  }

  draw(context)
  {

    context.save();

    let 
        controlpoint_center, // point where the arrow base meets its tail
        controlpoint_left,   // left point of arrow head
        controlpoint_right,  // right point of arrow head
        A, // this is the point where the arrow head ends at the target
        curve_segment = null; // this is the segment of the bezier curve that will be drawn

    let P0 = this.P0,
        P2 = this.P2,
        D = this.D,
        e = this.e,
        curvature = this.curvature_scalar,
        ep1 = this.ep1,
        headLength = this.head_length,
        sourceRadius = this.source_radius,
        targetRadius = this.target_radius
      ;

    this.isCurved = (curvature > 0) && (this.link_back_exists || (this.D-this.target_radius-this.source_radius-this.head_length<0));
    let headWidth = this.arrow_head_width_scalar * headLength/Math.sqrt(3);

    if (this.isCurved)
    {
        
        this.P1 = { 
                   x: P0.x + 0.5*D*e.xp + curvature * D * ep1.xp,
                   y: P0.y + 0.5*D*e.yp + curvature * D * ep1.yp
                 };
        let P1 = this.P1;

        A = this.get_bezier_point_and_direction_at_point_with_distance(P2,targetRadius,0.9);

        // compute length of whole curve
        let curve = new Bezier(P0,P1,P2);
        let L = curve.length();


        controlpoint_center = this.get_bezier_point_and_direction_at_point_with_distance(A,
                                                                                         headLength,
                                                                                         A.t-headLength/L
                                                                                        );

        let ecNormal = { xp: -controlpoint_center.yp,
                         yp: controlpoint_center.xp
                       } 
        controlpoint_left = {
            x: controlpoint_center.x + headWidth * (ecNormal.xp),
            y: controlpoint_center.y + headWidth * (ecNormal.yp)
        };
        controlpoint_right = {
            x: controlpoint_center.x + headWidth * (-ecNormal.xp),
            y: controlpoint_center.y + headWidth * (-ecNormal.yp)
        };

        // draw the link
        context.lineWidth = this.link_width;
        context.strokeStyle = this.link_style;
        context.beginPath();

        let c = curve.split(0,controlpoint_center.t);
        context.moveTo(c.points[0].x, c.points[0].y);
        context.quadraticCurveTo(c.points[1].x, c.points[1].y,c.points[2].x, c.points[2].y);
        context.stroke();

        curve_segment = c;

    }
    else
    {
        A = {
               x: P0.x + (D-targetRadius) * e.xp,
               y: P0.y + (D-targetRadius) * e.yp
        };
        controlpoint_center = {
               x: P0.x + (D-targetRadius-headLength) * e.xp,
               y: P0.y + (D-targetRadius-headLength) * e.yp
        };
        controlpoint_left = {
            x: controlpoint_center.x + headWidth * (ep1.xp),
            y: controlpoint_center.y + headWidth * (ep1.yp)
        };
        controlpoint_right = {
            x: controlpoint_center.x + headWidth * (-ep1.xp),
            y: controlpoint_center.y + headWidth * (-ep1.yp)
        };

        context.lineWidth = this.link_width;
        context.beginPath();
        context.strokeStyle = this.link_style;
        context.moveTo(P0.x, P0.y);
        context.lineTo(controlpoint_center.x, controlpoint_center.y);
        context.stroke();
    }

    //draw arrowhead
    context.lineWidth = 0;
    context.beginPath();
  
    context.moveTo(A.x,A.y);
    context.lineTo(controlpoint_left.x,controlpoint_left.y);
    context.lineTo(controlpoint_right.x,controlpoint_right.y);
    context.lineTo(A.x,A.y);
    context.fillStyle = this.link_style;
    context.fill();

    context.restore();

    // save relevant controlpoints in a way they can be easily retrieved
    this.arrowHeadPoints = [
        A,
        controlpoint_left,
        controlpoint_right
    ];

    this.linkPoints = [
        P0,
        controlpoint_center
    ];

    if (this.isCurve)
      this.curveControlPoint = curve_segment.points[1];
    else
      this.curveControlPoint = null;
  }

  get_bezier_point_and_direction_at_point_with_distance(A,R,t_initial)
  {
    let P0 = this.P0;
    let P1 = this.P1;
    let P2 = this.P2;
    let t = t_initial;       // initial guess: source node position
    let old_t = -1;  // dummy 
    let C;

    //newton-raphson with accuracy of 1 per mille
    while(Math.abs(1-t/old_t)>1e-3)
    {
      C = this.get_bezier_distance_cost_and_point(A,R,t);
      old_t = t;
      t = t - C.c / C.cp;
    }

    // norm direction vector
    let D = Math.sqrt( Math.pow(C.B.xp,2) + Math.pow(C.B.yp,2) );
    C.B.xp /= D;
    C.B.yp /= D;

    // add t value
    C.B.t = t;
    return C.B;
  }

  get_bezier_distance_cost_and_point(A,R,t)
  {
    let B = this.get_bezier_point_and_derivative(t); // get point and derivative
    return {
      c: R*R - ( Math.pow(B.x-A.x,2) + Math.pow(B.y-A.y,2)), // get cost
      cp: -2*(B.x-A.x)*B.xp-2*(B.y-A.y)*B.yp,                // cost derivative
      B: B // point and point derivative
    }
  }

  get_bezier_point_and_derivative(t)
  {
    let P0 = this.P0;
    let P1 = this.P1;
    let P2 = this.P2;
    return {
      x: P1.x + (1-t)*(1-t)*(P0.x-P1.x)+t*t*(P2.x-P1.x), // point
      y: P1.y + (1-t)*(1-t)*(P0.y-P1.y)+t*t*(P2.y-P1.y),
      xp: 2*(1-t)*(P1.x-P0.x)+2*t*(P2.x-P1.x), // derivative
      yp: 2*(1-t)*(P1.y-P0.y)+2*t*(P2.y-P1.y)
    }
  }

}
