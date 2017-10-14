window.addEventListener("load", function() {
  function update() {
   var circles = svg.select("g")
    .selectAll("circle")
    .data(createCircles(), function(d) {return d.id});

  circles.enter()
    .append("circle")
    .attr("r", 0)
    .attr("cx", function(d) { return Math.random() * width/2 - width/4})
    .attr("cy", function(d) { return Math.random() * height/2 - height/4})
    .style("fill", function(d) { return "white"; });

  circles.transition()
    .duration(1000)
    .delay(250)
    .attr("r", function(d) { return d.r; })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .style("fill", function(d) { return "black"; });

  circles.exit().transition()
    .style("fill", function(d) { return "white"; })
    .attr("r", 0)
    .remove();

  }

  var width = document.querySelector("body").clientWidth;
  var height = 1080;

  var svg = d3.select("body").append("svg")
  .attr("style", "width: 100%; height: 1080px")
  .attr("width", "100%")
  .attr("height", "1080")
  .attr("class", "bubble");
  update();
    var circles = svg.append('g')
      .attr("transform", "translate(" + width/2.0 + ", " + height/2.0 + ")")
      .selectAll("circle")
      .data(createCircles(), function(d) {return d.id});

    circles.enter()
      .append("circle")
      .attr("r", 0)
      .attr("cx", function(d) { return Math.random() * width/2 - width/4})
      .attr("cy", function(d) { return Math.random() * height/2 - height/4})
      .style("fill", function(d) { return "white"; });

    circles.transition()
      .duration(1000)
      .delay(250)
      .attr("r", function(d) { return d.r; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d) { return "black"; });

    circles.exit().transition()
      .remove();

    var time = 2000;
    var isRunning = true;
    var interval = setInterval(update, time);
    function toggleUpdate() {
        if(isRunning) {
          clearInterval(interval);
          isRunning = false;
        } else {
          update();
          interval = setInterval(update, time);
          isRunning = true;
        }
    }
    window.addEventListener("touchstart", function() {
      toggleUpdate()
      document.querySelector("audio").play();
    });
    window.addEventListener("keydown", function(event) {
      if(event.keyCode === 32) {
        toggleUpdate()
      }
    });
});
