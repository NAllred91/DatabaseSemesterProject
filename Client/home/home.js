(function()
{
	// The main url for the site.
	var baseURL = "http://localhost:8001";

	// Wait for all the applications to be ready,
	// and wait for the DOM to be ready.
	var onReady = _.after(2, function(){
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
				$('#app').append();
			});

			$("#utt").on('click', function()
			{
				$('#app').empty();
				$('#app').append(uttElement.layout());
			});

			$("#editProfile").on('click', function()
			{
				$('#app').empty();
				$('#app').append();
			});

			$("#forum").on('click', function()
			{
				$('#app').empty();
				$('#app').append();
			});
		});
	});

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
				onReady();
			});
	});

	// Start pinging to prevent our session cookie from timing out.
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
			location.href= baseURL;
		});
	}

	ping();
	

	// Load the various application views.
	var uttElement = uttView(onReady, socket);
	

}())