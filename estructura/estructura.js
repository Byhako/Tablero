var data = {}

$.get('./data.json', function(file) {
  console.log(file)
}, 'json')

function load(data) {
  data = { "nodeKeyProperty": "id",
  "nodeDataArray": [
    {"id":"0", "loc":"-67 -7", "text":"Router", "color":"red"},
    {"id":"2", "loc":"83 -2", "text":"Board", "color":"#AD7FA8FF"},
    {"id":"3", "loc":"150 -100", "text":"CardsContainer", "color":"#204A87FF"},
    {"id":"4", "loc":"150 100", "text":"CustomDragLayer", "color":"#4E9A06FF"},
    {"id":"5", "loc":"413 24", "text":"CardDragPreview", "color":"#73D216FF"},
    {"id":"6", "loc":"424 129", "text":"snapToGrid", "color":"#73D216FF"},
    {"id":"7", "loc":"350 -100", "text":"Cards", "color":"#3465A4FF"},
    {"id":"8", "loc":"480 -100", "text":"DraggableCard", "color":"#3465A4FF"},
    {"id":"9", "loc":"650 -100", "text":"Card", "color":"#3465A4FF"},
    {"id":"-10", "loc":"-210 -22", "text":"index", "color":"red"},
    {"id":"-11", "loc":"284 -175", "text":"Vista de tarjetas y columnas estáticas", "color":"white"},
    {"id":"-12", "loc":"191 183", "text":"Vista cuando se mueve cada tarjeta", "color":"white"},
    ],
    "linkDataArray": [
    {"from":"0", "to":"2", "color":"#EF2929"},
    {"from":"2", "to":"3", "color":"blue"},
    {"from":"2", "to":"4", "color":"green"},
    {"from":"4", "to":"6", "color":"green"},
    {"from":"3", "to":"7", "color":"blue"},
    {"from":"7", "to":"8", "color":"blue"},
    {"from":"8", "to":"9", "color":"blue"},
    {"from":"5", "to":"9", "color":"green"},
    {"from":"-10", "to":"0", "color":"#EF2929"},
    {"from":"4", "to":"5", "color":"green"},
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
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
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
  load(data);
}

function save() {
  const model = JSON.parse(myDiagram.model.toJson())
  var myModel = '{"nodeDataArray": [\n'
  model.nodeDataArray.map((nodo) => {
    const id = nodo.id.toString()

    // obtengo solo parte entera de loc
    var loc = nodo.loc.toString()
    loc = loc.split(" ")
    const n1 = parseInt(loc[0]).toString()
    const n2 = parseInt(loc[1]).toString()
    loc = n1 + ' ' + n2
    const text = nodo.text.toString()
    var color = "yellow"
    try {
      color = nodo.color.toString()
    }
    catch(err) {
    }
    myModel = myModel + '{"id":"' + id + '", "loc":"' + loc + '", "text":"' + 
    text + '", "color":"' + color + '"},\n'
  })

  myModel = myModel + '],\n"linkDataArray": [\n'
  model.linkDataArray.map((link) => {
    let fo = link.from.toString()
    let to = link.to.toString()
    var color = "black"
    try {
      color = link.color.toString()
    }
    catch(err) {
    }
    
    myModel = myModel + '{"from":"' + fo + '", "to":"' + to + '", "color":"' + color + '"},\n'
  })
  myModel = myModel + ']\n}'
  document.getElementById("mySavedModel").value = myModel
}


