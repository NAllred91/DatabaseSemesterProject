(function()
{
	// The main url for the site.
	var baseURL = 'nick.dlogicd.com';

	// The different views.
	var uttElement;
	var searchElement;
	var profileElement;
	var forumElement

	// Wait for all the applications to be ready,
	// and wait for the DOM to be ready.
	var onReady = _.after(4, function(){
		$(document).ready(function()
		{
			// Append the chat view, that is where the user will begin.
			$('#app').append(uttElement.layout());
			$('.topBar').show();
			$('#name').append(username);

			// Check for screen dimensions
			var checkDimensions = function()
			{
				var width = $(window).width() - 30;
				$('.topBar').css('width', width + 'px');
				$('.app').css('width', width + 'px');
			}

			// Initial dimension check
			checkDimensions();
			
			// On resize, change dimensions
			$(window).resize(function()
			{
				checkDimensions();
			});

			// Handle the signout button.
			$("#signout").submit(function(event){});

			// Handle each button. Clear the app container
			// and then load the neccessary files.
			$("#search").on('click', function()
			{
				$('#app').empty();
				$('#app').append(searchElement.layout());
			});

			$("#utt").on('click', function()
			{
				$('#app').empty();
				$('#app').append(uttElement.layout());
			});

			$("#forum").on('click', function()
			{
				$('#app').empty();
				$('#app').append(forumElement.layout());
			});
		});
	});

	// Enable caching of scripts.
	$.ajaxSetup({
	  cache: true
	});

	var onLoadProfile = function(username)
	{
		$('#app').empty();
		$('#app').append(profileElement.layout(username));
	}

	var onLoadGame = function(gameId)
	{
		$('#app').empty();
		$('#app').append(uttElement.layout(gameId));
	}

	var username;
	var socket = io();

	// Redirect to login if the socket disconnects.
	socket.on('disconnect', function()
	{
		location.href= baseURL;
	});
	
	// Wait for the socket to connect
	socket.on('connect', function()
	{
		// Retrieve the username
		$.get('/username', function(res)
			{
				username = res.user;
				socket.emit('identify', username);

				// Load the various application views.
				uttElement = uttView(onReady, username, socket);
				searchElement = mainSearchView(onReady, username, socket, onLoadProfile);
				profileElement = mainProfileView(onReady, username, socket, onLoadGame);
				forumElement = mainForumView(onReady, username, socket);
			});
	});

	// Start pinging to prevent our session from timing out.
	var ping = function()
	{
		$.get('/ping', function()
		{
			_.delay(function()
			{
				ping();
			},90000)
		})
		.fail(function()
		{
			location.reload();
		});
	}

	ping();
	

}())