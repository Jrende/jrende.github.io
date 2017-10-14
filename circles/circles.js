var createCircles = (function() {
  //var seed = 685;
  var seed = Math.floor(Math.random() * 1000);
  console.log("seed: " + seed);
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  var id = 0;
  function createNode() {
    return {id: id++, nodes: []}
  }

  function getFlatMap(node) {
    var list = [];
    getFlatMapRec(node, list, 0, 0, -1, 100);
    return list;
  }

  //1 1 2 3 5 7 14 20 34 54
  var widths = [14, 20, 34, 54]
  function w() {
    return widths[Math.floor(random() * widths.length)];
    //return random() * 10 + 5;
  }

  function dist(left, right) {
    var x = (left.x - right.x) * (left.x - right.x);
    var y = (left.y - right.y) * (left.y - right.y);
    return Math.sqrt(x + y);
  }

  function getDirl(dir) {
    if(dir == 0) {
      var dirl = [0, 1, 3]
    } else if(dir == 1) {
      var dirl = [1, 0, 2]
    } else if(dir == 2) {
      var dirl = [2, 1, 3]
    } else if(dir == 3) {
      var dirl = [1, 0, 3]
    } else {
      var dirl = [0, 1, 2, 3]
    }
    return dirl;
  }

  var dirpos = [
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x:-1, y: 0},
    {x: 0, y:-1}
  ];

  var margin = 10;
  function getFlatMapRec(node, list, x, y, dir, width) {
    if(node.nodes == null) {
      return;
    }
    var childRadius = w();
    var currentNode = {id: node.id, x: x, y: y, r: width};
    for(var i = 0; i < list.length; i++) {
      var other = list[i]; 
      if(other === currentNode) {
        continue;
      }
      if(dist(currentNode, other) < (currentNode.r + other.r)) {
        var diffRad = Math.abs(currentNode.r - other.r);
        var diff = diffRad + margin;
        childRadius -= diff;
        if(childRadius < 0) {
          return;
        }
      }
    }
    var dirl = getDirl(dir);
    list.push(currentNode);
    for(var i = 0; i < node.nodes.length; i++) {
      var dirx = dirpos[dirl[i]].x;
      var diry = dirpos[dirl[i]].y;
      var dx = dirx * (childRadius + width);
      var dy = diry * (childRadius + width);
      getFlatMapRec(node.nodes[i], list, x + dx, y + dy, dirl[i], childRadius);
    }
  }


  function addChildren(node, iter) {
    if(iter == 0) {
      return;
    }

    var num = random() < 0.5 ? 1 : 3;
    for(var i = 0; i < num; i++) {
      var newNode = createNode();
      addChildren(newNode, iter - 1);
      node.nodes[i] = newNode;
    }
  }

  return function() {
    id = 0;
    var root = {nodes: []};
    for(var i = 0; i < 4; i++) {
      var node  = createNode();
      addChildren(node, 2);
      root.nodes[i] = node;
    }
    window.root = root;

    var flatMap = getFlatMap(root);

    return flatMap;
  }

})();
