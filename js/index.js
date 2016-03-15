$(function() {
	var $street = $('#street');
	for(var i = 0; i < data.chapters.length; i++) {
		var $chapter = $('<div>').addClass('chapter').appendTo($street);
		var $card = $('<div>').addClass('card').appendTo($chapter);
		$('<h2>').text(data.chapters[i].title).appendTo($card);
		$('<p>').addClass('description').text(data.chapters[i].description).appendTo($card);
		var $expand = $('<div>').addClass('expand').appendTo($chapter);
		var expandText = {expand: '放大', collapse: '縮小'};
		var $expandButton = $('<button>').text(expandText.expand).appendTo($expand).click(function() {
			var $b = $(this);
			$b.parents('.chapter').toggleClass('expanded');
			$b.text(($b.text() == expandText.expand ? expandText.collapse : expandText.expand));
		});
		var $reports = $('<div>').addClass('reports').appendTo($chapter);
		for(var j = 0; j < data.reports.length; j++) {
			var report = data.reports[j];
			if(report.chapter == data.chapters[i].id) {
				var $report = $('<a>').attr({href: report.link, target: '_blank'}).addClass('report').appendTo($reports);
				var $thumbnail = $('<div>').addClass('thumbnail').appendTo($report);
				if(report.youtubeID) {
					var url = 'https://img.youtube.com/vi/' + report.youtubeID + '/hqdefault.jpg'; //maxresdefault
					$thumbnail.attr('style', 'background-image: url(' + url + ')');
				}
				$('<time>').text(report.time).appendTo($report);
				$('<h3>').text(report.title).appendTo($report);
			}
		}
	}

	var $legislature = $('#legislature');
/*	var $timelineTitles = $('#timelineTitles');
	for(var i = 0; i < data.timelines.length; i++) {
		$('<div>').addClass('title').appendTo($timelineTitles)
			.text(data.timelines[i].title)
			.css('background-color', data.timelines[i].color);
	}*/

	$('nav > ul > li').click(function() {
		$('body').animate({'scrollTop': $('section#' + $(this).attr('data-target')).position().top - 88 + 1});
	});

	ww = $('body').width();
	drawChart();
	drawTimelines();
});
