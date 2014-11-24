var mainProfileView = function(onReady, username, socket, onLoadGame)
{
	var templates = {};
	var element;
	var username;
	var loadProfile;

	var scripts = [
		'profileView.js'
	]

	var html = [
		'profileContainer.html',
		'usersProfile.html',
		'usersGame.html',
		'stats.html',
		'joinDate.html',
		'postCount.html'
	]

	var css = [
		'profile.css'
	]

	var length = scripts.length + html.length + css.length;

	// Wait for all of the server requests that need to be made.
	var ready = _.after(length, function()
	{		
		loadProfile = profileView(socket, username, templates, onLoadGame);
		element = $(templates.profileContainer());
		onReady();
	});

	// Called when a profile is to be displayed
	var onLoadProfile = function(userId)
	{
		element.empty();
		element.append(loadProfile(userId));
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

	var layout = function(userId)
	{
		// Whenever layout is called, the search view
		// is set.
		onLoadProfile(userId);
		return element;
	};

	return{
		layout: layout
	}
}