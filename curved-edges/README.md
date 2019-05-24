# Curved Edges with Arrow Heads

A force-directed graph layout with curved edges and arrow heads. See http://benmaier.org/curved-edges .

## Usage

Make sure you've loaded both `arrowed-links.js` and `bezier.js`.

Then two node objects `source` and `target` need to have the properties `x`, `y`, and `radius`. The default behavior is that links are only drawn curved if another link exists which points back from target to source. Hence, if you want to enforce that the arrowed link is drawn curved, make sure to initialize with `link_back_exists=true`.

Initialize the `ArrowedLink` object as

```js
let source = { x: 100, y: 100, radius: 10 };
let target = { x: 150, y: 100, radius: 20 };

let link_back_exists = true; // make sure it draws the arrow curved
let link = new ArrowedLink(source, target, link_back_exists);
```

Then style and draw the arrowed link

```js
link.nodeStrokeWidth(2) // Nodes will have stroke width of 2px (=> node radius will be incremented by 1px)
    .linkWidth(3)       // links will have a width of 3px
    .arrowHeadLengthScalar(4) // arrow heads will have a length of 4 times the link width
    .arrowHeadWidthScalar(1) // arrow heads will have a width of this_scalar*2*headLength/sqrt(3)
    .curvatureScalar(0.5) // the curvature control point will lie at half distance of the uncurved link in normal direction to the uncurved link
    .linkStyle("rgba(0,0,0,0.5)"); // how canvas should draw the arrow (black but half transparent)

link.draw(context); // `context` is the context on which to draw
```

Afterwards, you can retrieve computed properties to save them for reproduction

```js

link.isCurved;        // gives `true` if the link was drawn curved
link.arrowHeadPoints; // an Array containing three points, defining the arrow head polygon (each an object with `x` and `y` property
link.linkPoints; // an Array of two points, defining the beginning of the link and the beginning of the arrow head
link.curveControlPoint; // if link.isCurved, contains the control point of the curved arrow tail, otherwise null
```

## Example

This is what the arrows look like:

![arrow example](https://github.com/benmaier/curved-edges/raw/master/example.png)

