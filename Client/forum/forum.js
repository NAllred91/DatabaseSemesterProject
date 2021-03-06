// Code for the forum
var mainForumView = function(onReady, username, socket, onLoadProfile)
{
	var templates = {};
	var element;
	var username;
	var loadForum;
	var loadThread;
	var loadCreateThread;

	var scripts = [
		'forumView.js',
		'createThreadView.js',
		'threadView.js'
	]

	var html = [
		'forumContainer.html',
		'createThread.html',
		'threadInfo.html',
		'threadContainer.html',
		'redDot.html',
		'greenDot.html',
		'forum.html',
		'thread.html',
		'post.html'
	]

	var css = [
		'forum.css'
	]

	var length = scripts.length + html.length + css.length;

	// Wait for all of the server requests that need to be made.
	var ready = _.after(length, function()
	{		
		loadThread = threadView(socket, username, templates, onLoadForum, onLoadThread);
		loadCreateThread = createThreadView(socket, username, templates, onLoadForum);
		loadForum = forumView(socket, username, templates, onLoadProfile, onLoadThread, onLoadCreateThread);
		element = $(templates.forumContainer());
		onReady();
	});

	// Called when the forum view is loaded.
	var onLoadForum = function()
	{
		element.empty();
		element.append(loadForum());
	}

	// Called to load a thread.
	var onLoadThread = function(threadId, title)
	{
		element.empty();
		element.append(loadThread(threadId, title));
	}

	// Called to create a thread.
	var onLoadCreateThread = function()
	{
		element.empty();
		element.append(loadCreateThread());
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

