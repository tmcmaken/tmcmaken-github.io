function aziE() {

// width and height
var w = 400;
var h = 400;

// scale to size of window
var scl = Math.min(w, h)/6.28; 

// map projection
var projection = d3.geoAzimuthalEquidistant()
		.scale(scl)
		.translate([ w/2, h/2 ]);

// path generator
var path = d3.geoPath()
  .projection(projection);

// append svg
var svg = d3.select("#svgDiv3")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

var defs = svg.append("defs")

var mask = defs.append("mask")
  .attr("id", "mask3")
mask.append("circle")
  .attr("id", "c")
  .attr("cx", w/2)
  .attr("cy", h/2)
  .attr("r", w/2)
  .attr("fill", "white");

// append g element for map
var map = svg.append("g")
//  .attr("mask", "url(#mask3)")
;

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

aziE();
