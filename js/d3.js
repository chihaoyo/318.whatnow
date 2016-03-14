d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    wx = w.innerWidth || e.clientWidth || g.clientWidth,
    wy = w.innerHeight|| e.clientHeight|| g.clientHeight;

var drawChart = function() {
	// data pre-processing
	for(var i = 0; i < data.proposals.length; i++) {
		var p = data.proposals[i];
		p.nodes = [];
		for(var j = 0; j < p.values.length; j++) {
			p.nodes.push({x: p.values[j], y: j});
		}
	}

	// now let us draw
	var cw = wx;
	var ch = wy;
	var paddings = {top: 120, right: 40, bottom: 40, left: 40};
	var xScale = d3.scale.linear().domain([0, 5]).range([0 + paddings.left, cw - paddings.right]);
	var yScale = d3.scale.linear().domain([0, 4]).range([0 + paddings.top, ch - paddings.bottom]);
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.x); })
		.y(function(d) { return yScale(d.y); });

	var svg = d3.select('#chart').append('svg')
		.attr({
			'width': cw,
			'height': ch,
			'viewBox': '0 0 ' + cw + ' ' + ch
		});
	svg.selectAll('g.proposal').data(data.proposals).enter().append('g')
		.classed('proposal', true)
		.attr('id', function(d) { return d.name; })
		.each(function(d, i) {
			var g = d3.select(this);
			var color = d.color;//colors(i);
			g.append('circle')
				.attr({
					'cx': xScale(i),
					'cy': 40,
					'r': 15,
					'stroke': color,
					'stroke-width': 5,
					'fill': '#ccc',
				});
			g.append('text')
				.text(d.name)
				.attr({
					'x': xScale(i),
					'y': 74,
					'text-anchor': 'middle',
				})
			g.append('path')
				.attr({
					'd': line(d.nodes), // http://www.oxxostudio.tw/articles/201411/svg-d3-02-line.html
					'y': 0,
					'stroke': color,
					'stroke-width': 5,
					'fill': 'none',
				});
			g.selectAll('circle.value').data(d.values).enter().append('circle')
				.classed('value', true)
				.attr({
					'r': 5,
					'cx': (function(d) { return xScale(d); }),
					'cy': (function(d, i) { return yScale(i); }),
					'fill': color,
					'stroke': 'none',
				});
			g.on('click', function() {
				var g = d3.select(this);
				var f = g.classed('focused');
				svg.classed('focusOn', !f).selectAll('g.proposal').classed('focused', false);
				g.classed('focused', !f).moveToFront();
			});
		});
};

var drawTimelines = function() {
	// data pre-processing
	var dates = data.events.map(function(o) { return new Date(o.time); }).sort(function(a, b) { return a - b; });
	var months = Math.round((dates[dates.length - 1] - dates[0])/1000/(30*24*60*60));
	console.log(months, 'months');
	var step = 120;
	var timelineDict = {};
	for(var i = 0; i < data.timelines.length; i++) {
		var id = data.timelines[i].id;
		timelineDict[id] = data.timelines[i];
		timelineDict[id].num = i;
	};

	// now let us draw
	var cw = wx;
	var ch = months*step;
	var paddings = {top: 40, right: Math.round(cw/6), bottom: 40, left: Math.round(cw/6)};

	var xScale = d3.scale.linear().domain([0, 2]).range([0 + paddings.left, cw - paddings.right]);
	var yScale = d3.scale.linear().domain([dates[0].getTime()/1000, dates[dates.length - 1].getTime()/1000]).range([0 + paddings.top, ch - paddings.bottom]);
	var colors = d3.scale.category10();

	var svg = d3.select('#timelines').append('svg')
		.attr({
			'width': cw,
			'height': ch,
			'viewBox': '0 0 ' + cw + ' ' + ch,
		});
	for(var i = 1; i < months; i++) {
		svg.append('circle').attr({'cx': cw/2, 'cy': i*step, 'r': 3, 'fill': 'rgba(0, 0, 0, 0.5)'});
	}
	svg.selectAll('circle.event').data(data.events).enter().append('g')
		.classed('event', true)
		.each(function(d, i) {
			var g = d3.select(this);
			var x = xScale(timelineDict[d.timeline].num);
			var y = yScale((new Date(d.time)).getTime()/1000);
			var r = 8;
			var color = timelineDict[d.timeline].color;
			g.append('circle')
				.classed('event', true)
				.attr({
					'cx': x,
					'cy': y,
					'r': r,
					'fill': color,
				});
			g.append('text')
				.text(d.time)
				.attr({
					'x': x,
					'y': y + r/2,
					'text-anchor': 'middle',
				})
		});
};
$(drawChart);
$(drawTimelines);
