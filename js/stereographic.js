function ster() {

// width and height
var w = 500;
var h = 500;

// scale to size of window
var scl = Math.min(w, h)/6.28; 

// map projection
var projection = d3.geoStereographic()
		.scale(scl)
		.translate([ w/2, h/2 ]);

// path generator
var path = d3.geoPath()
  .projection(projection);

// append svg
var svg = d3.select("#svgDiv2")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

var defs = svg.append("defs")

var radialGradient = defs.append("radialGradient")
  .attr("id", "radGrad")
  .attr("gradientUnits", "userSpaceOnUse")
  .attr("cx", w/2)
  .attr("cy", h/2)
  .attr("fx", w/2)
  .attr("fy", h/2)
  .attr("r", w*0.45)
  .attr("fr", w*0.168)
radialGradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "white")
  .attr("stop-opacity", "1");
radialGradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "white")
  .attr("stop-opacity", "0");


var mask = defs.append("mask")
  .attr("id", "mask")
mask.append("circle")
  .attr("id", "c")
  .attr("cx", w/2)
  .attr("cy", h/2)
  .attr("r", w/2)
  .attr("fill", "url(#radGrad)");

// append g element for map
var map = svg.append("g")
  .attr("mask", "url(#mask)");

// enable drag
var drag = d3.drag()
	.on("start", dragstarted)
	.on("drag", dragged);

var gpos0, o0, gpos1, o1;
projection.rotate([0,-90,0])
svg.call(drag);

// load topojson
d3.json("https://gist.githubusercontent.com/sarah37/dcca42b936545d9ee9f0bc8052e03dbd/raw/550cfee8177df10e515d82f7eb80bce4f72c52de/world-110m.json", function(json) {
	map.append("path")
	.datum({type: "Sphere"})
	.attr("class", "ocean")
	.attr("d", path);

	map.append("path")
	.datum(topojson.merge(json, json.objects.countries.geometries))
	.attr("class", "land")
	.attr("d", path);

	map.append("path")
	.datum(topojson.mesh(json, json.objects.countries, function(a, b) { return a !== b; }))
	.attr("class", "boundary")
	.attr("d", path);

	map.append("path")
	.datum(d3.geoGraticule())
	.attr("class", "graticule")
	.attr("d", path);
});


// functions for dragging
function dragstarted() {
	gpos0 = projection.invert(d3.mouse(this));
	o0 = projection.rotate();
}

function dragged() {
	gpos1 = projection.invert(d3.mouse(this));
	o0 = projection.rotate();
	o1 = eulerAngles(gpos0, gpos1, o0);
	projection.rotate(o1);
	map.selectAll("path").attr("d", path);
}
}

ster();