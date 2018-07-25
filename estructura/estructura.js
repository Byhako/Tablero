// { "from": 0, "to": 0, "text": "up or timer", "curviness": -20 }

function load(data) {
  data = { "nodeKeyProperty": "id",
    "nodeDataArray": [
      { "id": 0, "loc": "0 0", "text": "APP", color: "red"},
      { "id": 1, "loc": "-100 0", "text": "Base", color: "#AD7FA8FF" },
      { "id": 2, "loc": "100 0", "text": "Board", color: "#AD7FA8FF" },
      { "id": 3, "loc": "150 -100", "text": "CardsContainer", color: "#204A87FF" },
      { "id": 4, "loc": "150 100", "text": "CustomDragLayer", color: "#4E9A06FF" },
      { "id": 5, "loc": "300 160", "text": "CardDragPreview", color: "#73D216FF"},
      { "id": 6, "loc": "300 40", "text": "snapToGrid", color: "#73D216FF" },
      { "id": 7, "loc": "350 -100", "text": "Cards", color: "#3465A4FF"},
      { "id": 8, "loc": "480 -100", "text": "DraggableCard", color: "#3465A4FF" },
      { "id": 9, "loc": "650 -100", "text": "Card", color: "#3465A4FF" },
      { "id": 10, "loc": "0 100", "text": "actions/lists" }
    ],
    "linkDataArray": [
      { "from": 0, "to": 1, color: "#EF2929FF"},
      { "from": 0, "to": 2, color: "#EF2929FF"},
      { "from": 2, "to": 3, color: "blue"},
      { "from": 2, "to": 4, color: "green"},
      { "from": 4, "to": 5, color: "green"},
      { "from": 4, "to": 6, color: "green"},
      { "from": 3, "to": 7, color: "blue"},
      { "from": 7, "to": 8, color: "blue"},
      { "from": 8, "to": 9, color: "blue"},
      { "from": 5, "to": 9, color: "green" },
      { "from": 2, "to": 10 }
    ]
  }
  myDiagram.model = go.Model.fromJson(data);
}

function init() {
  var $ = go.GraphObject.make;  // for conciseness in defining templates
  myDiagram =
    $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
      {
        // start everything in the middle of the viewport
        initialContentAlignment: go.Spot.Center,
        // have mouse wheel events zoom in and out instead of scroll up and down
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        // support double-click in background creating a new node
        "clickCreatingTool.archetypeNodeData": { text: "new node" },
        // enable undo & redo
        "undoManager.isEnabled": true
      });
  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function(e) {
    
    var idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });
  // define the Node template
  myDiagram.nodeTemplate =
    $(go.Node, "Auto",
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // define the node's outer shape, which will surround the TextBlock
      $(go.Shape, "RoundedRectangle",
        {
          parameter1: 20,  // the corner has a large radius
          fill: $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" }),
          stroke: null,
          portId: "",  // this Shape is the Node's port, not the whole Node
          fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
          cursor: "pointer"
        },
        new go.Binding("fill", "color")),
     $(go.TextBlock,
        {
          font: "bold 11pt helvetica, bold arial, sans-serif",
          editable: true  // editing the text automatically updates the model data
        },
        new go.Binding("text").makeTwoWay())
    );
  // unlike the normal selection Adornment, this one includes a Button
  myDiagram.nodeTemplate.selectionAdornmentTemplate =
    $(go.Adornment, "Spot",
      $(go.Panel, "Auto",
        $(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
        $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
      ),
      // the button to create a "next" node, at the top-right corner
      $("Button",
        {
          alignment: go.Spot.TopRight,
          click: addNodeAndLink  // this function is defined below
        },
        $(go.Shape, "PlusLine", { width: 6, height: 6 })
      ) // end button
    ); // end Adornment
  // clicking the button inserts a new node to the right of the selected node,
  // and adds a link to that new node
  function addNodeAndLink(e, obj) {
    var adornment = obj.part;
    var diagram = e.diagram;
    diagram.startTransaction("Add State");
    // get the node data for which the user clicked the button
    var fromNode = adornment.adornedPart;
    var fromData = fromNode.data;
    // create a new "State" data object, positioned off to the right of the adorned Node
    var toData = { text: "new" };
    var p = fromNode.location.copy();
    p.x += 200;
    toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
    // add the new node data to the model
    var model = diagram.model;
    model.addNodeData(toData);
    // create a link data from the old node data to the new node data
    var linkdata = {
      from: model.getKeyForNodeData(fromData),  // or just: fromData.id
      to: model.getKeyForNodeData(toData),
      text: "label"
    };
    // and add the link data to the model
    model.addLinkData(linkdata);
    // select the new Node
    var newnode = diagram.findNodeForData(toData);
    diagram.select(newnode);
    diagram.commitTransaction("Add State");
    // if the new node is off-screen, scroll the diagram to show the new node
    diagram.scrollToRect(newnode.actualBounds);
  }
  // replace the default Link template in the linkTemplateMap
  myDiagram.linkTemplate =
    $(go.Link,  // the whole link panel
      {
        curve: go.Link.Bezier, adjusting: go.Link.Stretch,
        reshapable: true, relinkableFrom: true, relinkableTo: true,
        toShortLength: 3
      },
      new go.Binding("points").makeTwoWay(),
      new go.Binding("curviness"),
      $(go.Shape,  // the link shape
        { strokeWidth: 3 },
        new go.Binding("stroke", "color")),
      $(go.Shape, { toArrow: "Standard", scale: 2, strokeWidth: 0 }, // heath arrow
        new go.Binding("fill", "color")),
      $(go.Panel, "Auto",
        $(go.Shape,  // the label background, which becomes transparent around the edges
          {
            fill: $(go.Brush, "Radial",
                    { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
            stroke: null
          }),
        $(go.TextBlock, "transition",  // the label text
          {
            textAlign: "center",
            font: "1pt helvetica, arial, sans-serif",
            margin: 1,
            editable: true  // enable in-place editing
          },
          // editing the text automatically updates the model data
          new go.Binding("text").makeTwoWay())
      )
    );
  // read in the JSON data from the "mySavedModel" element
  load();
}


/*


function init() {
  var $ = go.GraphObject.make;
  myDiagram =
    $(go.Diagram, "myDiagramDiv", // the ID of the DIV HTML element
      {
        initialContentAlignment: go.Spot.Center,
        "Changed": invalidateLinkRoutes,
        "undoManager.isEnabled": true
      });
  myDiagram.nodeTemplate =
    $(go.Node, go.Panel.Auto,
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "loc", go.Point.parse),
      $(go.Shape,
        { figure: "Procedure", fill: "white" },
        new go.Binding("fill", "color")),
      $(go.TextBlock,
        { font: "bold 11pt sans-serif" },
        new go.Binding("text"))
    );
  myDiagram.linkTemplate =
    $(MultiNodePathLink,  // subclass of Link, defined below
      go.Link.Bezier,
      { layerName: "Background", toShortLength: 4 },
      $(go.Shape, { strokeWidth: 4 },
        new go.Binding("stroke", "color")),
      $(go.Shape, { toArrow: "Standard", scale: 3, strokeWidth: 0 },
        new go.Binding("fill", "color"))
    );
  function invalidateLinkRoutes(e) {
    // when a Node is moved, invalidate the route for all MultiNodePathLinks that go through it
    if (e.change === go.ChangedEvent.Property && e.propertyName === "location" && e.object instanceof go.Node) {
      var diagram = e.diagram;
      var node = e.object;
      if (node._PathLinks) {
        node._PathLinks.each(function(l) { l.invalidateRoute(); });
      }
    } else if (e.change === go.ChangedEvent.Remove && e.object instanceof go.Layer) {
      // when a Node is deleted that has MultiNodePathLinks going through it, invalidate those link routes
      if (e.oldValue instanceof go.Node) {
        var node = e.oldValue;
        if (node._PathLinks) {
          node._PathLinks.each(function(l) { l.invalidateRoute(); });
        }
      } else if (e.oldValue instanceof MultiNodePathLink) {
        // when deleting a MultiNodePathLink, remove all references to it in Node._PathLinks
        var link = e.oldValue;
        var diagram = e.diagram;
        var midkeys = link.data.path;
        if (Array.isArray(midkeys)) {
          for (var i = 0; i < midkeys.length; i++) {
            var node = diagram.findNodeForKey(midkeys[i]);
            if (node !== null && node._PathLinks) node._PathLinks.remove(link);
          }
        }
      }
    }
  }
  // create a few nodes and links
  myDiagram.model = new go.GraphLinksModel([
      { key: 1, text: "Alpha mi mama me mimi", color: "lightyellow", loc: "0 0" },
      { key: 2, text: " Beta ", color: "brown", loc: "200 0" },
      { key: 3, text: "Gamma", color: "green", loc: "300 100" },
      { key: 4, text: "Delta", color: "slateblue", loc: "100 200" },
      { key: 5, text: "Epsilon", color: "aquamarine", loc: "300 350" },
      { key: 6, text: "Zeta", color: "tomato", loc: "0 100" },
      { key: 7, text: "Eta", color: "goldenrod", loc: "0 300" },
      { key: 8, text: "Theta", color: "orange", loc: "300 200" },
  ], [
      { from: 1, to: 5, path: [2, 3, 4], color: "blue" },
      { from: 6, to: 5, path: [7, 4, 8], color: "red" }
  ]);
}
function MultiNodePathLink() {
  go.Link.call(this);
}
go.Diagram.inherit(MultiNodePathLink, go.Link);
// ignores this.routing, this.adjusting, this.corner, this.smoothness, this.curviness

MultiNodePathLink.prototype.computePoints = function() {
  // get the list of Nodes that should be along the path
  var nodes = [];
  if (this.fromNode !== null && this.fromNode.location.isReal()) {
    nodes.push(this.fromNode);
  }
  var midkeys = this.data.path;
  if (Array.isArray(midkeys)) {
    var diagram = this.diagram;
    for (var i = 0; i < midkeys.length; i++) {
      var node = diagram.findNodeForKey(midkeys[i]);
      if (node instanceof go.Node && node.location.isReal()) {
        nodes.push(node);
        // Optimization?: remember on each path Node all of
        // the MultiNodePathLinks that go through it;
        // but this optimization requires maintaining this cache
        // in a Diagram Changed event listener.
        var set = node._PathLinks;
        if (!set) set = node._PathLinks = new go.Set(go.Link);
        set.add(this);
      }
    }
  }
  if (this.toNode !== null && this.toNode.location.isReal()) {
    nodes.push(this.toNode);
  }
  // now do the routing
  this.clearPoints();
  var prevloc = null;
  var thisloc = null;
  var nextloc = null;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    thisloc = node.location;
    nextloc = (i < nodes.length - 1) ? nodes[i + 1].location : null;
    var prevpt = null;
    var nextpt = null;
    if (this.curve === go.Link.Bezier) {
      if (prevloc !== null && nextloc !== null) {
        var prevang = thisloc.directionPoint(prevloc);
        var nextang = thisloc.directionPoint(nextloc);
        var avg = (prevang + nextang) / 2;
        var clockwise = prevang > nextang;
        if (Math.abs(prevang - nextang) > 180) {
          avg += 180;
          clockwise = !clockwise;
        }
        if (avg >= 360) avg -= 360;
        prevpt = new go.Point(Math.sqrt(thisloc.distanceSquaredPoint(prevloc)) / 4, 0);
        prevpt.rotate(avg + (clockwise ? 90 : -90));
        prevpt.add(thisloc);
        nextpt = new go.Point(Math.sqrt(thisloc.distanceSquaredPoint(nextloc)) / 4, 0);
        nextpt.rotate(avg - (clockwise ? 90 : -90));
        nextpt.add(thisloc);
      } else if (nextloc !== null) {
        prevpt = null;
        nextpt = thisloc;  // fix this point after the loop
      } else if (prevloc !== null) {
        var lastpt = this.getPoint(this.pointsCount - 1);
        prevpt = thisloc;  // fix this point after the loop
        nextpt = null;
      }
    }
    if (prevpt !== null) this.addPoint(prevpt);
    this.addPoint(thisloc);
    if (nextpt !== null) this.addPoint(nextpt);
    prevloc = thisloc;
  }
  // fix up the end points when it's Bezier
  if (this.curve === go.Link.Bezier) {
    // fix up the first point and the first control point
    var start = this.getLinkPointFromPoint(this.fromNode, this.fromPort, this.fromPort.getDocumentPoint(go.Spot.Center), this.getPoint(3), true);
    var ctrl2 = this.getPoint(2);
    this.setPoint(0, start);
    this.setPoint(1, new go.Point((start.x * 3 + ctrl2.x) / 4, (start.y * 3 + ctrl2.y) / 4));
    // fix up the last point and the last control point
    var end = this.getLinkPointFromPoint(this.toNode, this.toPort, this.toPort.getDocumentPoint(go.Spot.Center), this.getPoint(this.pointsCount - 4), false);
    var ctrl1 = this.getPoint(this.pointsCount - 3);
    this.setPoint(this.pointsCount - 2, new go.Point((end.x * 3 + ctrl1.x) / 4, (end.y * 3 + ctrl1.y) / 4));
    this.setPoint(this.pointsCount - 1, end);
  }
  return true;
};
*/
/*
    { key: 1, text: "Alpha", color: "lightblue" },
    { key: 2, text: "Beta", color: "orange" },
    { key: 3, text: "Gamma", color: "lightgreen", group: 5 },
    { key: 4, text: "Delta", color: "pink", group: 5 },
    { key: 5, text: "Epsilon", color: "green", isGroup: true }

    { from: 1, to: 2, color: "blue" },
    { from: 2, to: 2 },
    { from: 3, to: 4, color: "green" },
    { from: 3, to: 1, color: "purple" }

*/