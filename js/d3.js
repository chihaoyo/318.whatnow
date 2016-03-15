d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};


var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    ww = w.innerWidth || e.clientWidth || g.clientWidth,
    wh = w.innerHeight|| e.clientHeight|| g.clientHeight;

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
	var cw = ww;
	var ch = d3.min([wh, 600]);
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
	svg.selectAll('g.axis').data(data.axes).enter().append('g')
		.classed('axis', true)
		.each(function(d, i) {
			var g = d3.select(this);
			g.append('line')
				.attr({
					'x1': 0,
					'y1': yScale(i),
					'x2': cw,
					'y2': yScale(i),
					'stroke': '#ccc',
					'stroke-width': 2,
				});
			g.append('text').text(d)
				.attr({
					'x': 0,
					'y': yScale(i) - 4,
				})
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
					'stroke-width': 8,
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
					'stroke-width': 8,
					'fill': 'none',
				});
			g.selectAll('circle.value').data(d.values).enter().append('circle')
				.classed('value', true)
				.attr({
					'r': 8,
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
	data.events = data.events.sort(function(a, b) { return new Date(a.time) - new Date(b.time)});

	var dates = data.events.map(function(o) { return new Date(o.time); });//.sort(function(a, b) { return a - b; });
	var firstDay = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
	//var months = Math.round((dates[dates.length - 1] - dates[0])/1000/(30*24*60*60));
	var lastDay = new Date(new Date(dates[dates.length - 1].getFullYear(), (dates[dates.length - 1].getMonth()) + 1, 1) - 1);
	//var step = 120;
	var timelineDict = {};
	for(var i = 0; i < data.timelines.length; i++) {
		var id = data.timelines[i].id;
		timelineDict[id] = data.timelines[i];
		timelineDict[id].num = i;
	};
	console.log(timelineDict);

	// now let us draw
	var cw = ww;
	var paddings = {top: 40, right: Math.round(cw/6), bottom: 40, left: Math.round(cw/6)};
	var ch = (lastDay - firstDay)/1000*0.00005 + paddings.top + paddings.bottom;//months*step;

	var xScale = d3.scale.linear().domain([0, 2]).range([0 + paddings.left, cw - paddings.right]);
	var yScale = d3.scale.linear().domain([firstDay.getTime()/1000, lastDay.getTime()/1000]).range([0 + paddings.top, ch - paddings.bottom]);
	var colors = d3.scale.category10();

	var svg = d3.select('#timelines').append('svg')
		.attr({
			'width': cw,
			'height': ch,
			'viewBox': '0 0 ' + cw + ' ' + ch,
		});
	for(var i = firstDay; i < lastDay; i = new Date(i.setMonth(i.getMonth() + 1))) {
		svg.append('circle').attr({
			'cx': cw/2,
			'cy': yScale(i.getTime()/1000),
			'r': 3,
			'fill': 'rgba(0, 0, 0, 0.35)',
		});
	}
	svg.append('circle').attr({
		'cx': cw/2,
		'cy': yScale(lastDay.getTime()/1000),
		'r': 3,
		'fill': 'rgba(0, 0, 0, 0.35)'
	});

	var last = {x: 0, y: 0};
	svg.selectAll('circle.event').data(data.events).enter().append('g')
		.classed('event', true)
		.each(function(d, i) {
			var g = d3.select(this);
			var r = 15, s = 8, fontSize = 12;
			var x = xScale(timelineDict[d.timeline].num);
			var y = yScale((new Date(d.time)).getTime()/1000);
			if(y - last.y < 2*r && x == last.x) x += 2*r;
			var color = timelineDict[d.timeline].color;
			g.append('circle')
				.classed('event', true)
				.attr({
					'cx': x,
					'cy': y,
					'r': r,
					'fill': '#ccc',
					'stroke': color,
					'stroke-width': s,
				});
			/*g.append('text')
				.text(d.time)
				.attr({
					'x': x,
					'y': y + r + s + fontSize,
					'text-anchor': 'middle',
				});*/
			last = {x: x, y: y};
		});
};
