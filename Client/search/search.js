// Code for search
var mainSearchView = function(onReady, socket)
{
	var templates = {};
	var element;
	var username;
	var loadResults;
	var loadSearch;

	var scripts = [
		'searchView.js',
		'resultsView.js'
	]

	var html = [
		'search.html',
		'results.html'
	]

	var css = [
		'search.css'
	]

	var length = scripts.length + html.length + css.length;

	// Wait for all of the server requests that need to be made.
	var ready = _.after(length + 1, function()
	{		
		loadSearch = searchView(socket, username, templates, onLoadResults);
		loadResults = resultsView(socket, username, templates, onLoadSearch);
		element = $(templates.search());
		onReady();
	});

	// Called when the search view is loaded.
	var onLoadSearch = function()
	{
		element.empty();
		element.append(loadSearch());
	}

	// Called when the results are to be displayed.
	var onLoadResults = function(results)
	{
		element.empty();
		element.append(loadResults(results));
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

	// Retrieve your username
	$.get('/username', function(res)
	{
		username = res.user;
		ready();
	});


	var layout = function()
	{
		// Whenever layout is called, the search view
		// is set.
		onLoadSearch();
		return element;
	};

	return{
		layout: layout
	}
}

