// Code for the forum
var mainForumView = function(onReady, username, socket, onLoadProfile)
{
	var templates = {};
	var element;
	var username;
	var loadResults;
	var loadSearch;

	var scripts = [
	]

	var html = [
		'forum.html'
	]

	var css = [
	]

	var length = scripts.length + html.length + css.length;

	// Wait for all of the server requests that need to be made.
	var ready = _.after(length, function()
	{		
		// loadSearch = searchView(socket, username, templates, onLoadResults);
		// loadResults = resultsView(socket, username, templates, onLoadProfile, onLoadSearch);
		element = $(templates.forum());
		onReady();
	});

	// Called when the forum view is loaded.
	var onLoadForum = function()
	{
		element.empty();
		element.append("Forum to come!");
	}


	// Retrieve all the required scripts
	_.each(scripts, function(script)
	{
		$.getScript(script, function()
		{
			ready();
		});
	});

	// Retrieve all the required templates
	_.each(html, function(template)
	{
		var name = template.split(".")[0];

		$.get(template, function(data)
		{
			templates[name] = _.template(data);
			ready();
		});
	});

	// Retrieve all the required css
	_.each(css, function(style)
	{
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', style));
		ready();
	});

	var layout = function()
	{
		// Whenever layout is called, the forum view
		// is set.
		onLoadForum();
		return element;
	};

	return{
		layout: layout
	}
}

