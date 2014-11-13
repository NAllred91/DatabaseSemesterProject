(function()
{
	// Wait for all the applications to be ready,
	// and wait for the DOM to be ready.
	var onReady = _.after(2, function(){
		$(document).ready(function()
		{
			console.log("read")
			// Append the main view.
			$('#app').append();
			$('.topBar').show();
			console.log(username)
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
			$("#chat").on('click', function()
			{
				$('#app').empty();
				$('#app').append(aboutElement.layout());
			});

			$("#PM").on('click', function()
			{
				$('#app').empty();
				$('#app').append(resumeElement.layout());
			});

			$("#utt").on('click', function()
			{
				$('#app').empty();
				$('#app').append(uttElement.layout());
			});

			$("#forum").on('click', function()
			{
				$('#app').empty();
				$('#app').append(dragonElement.layout());
			});
		});
	});

	var socket = io();
	var username;

	socket.on('confirmed', function()
	{
		console.log("goodtogo")
		onReady();
	});
	
	// Retrieve the username
	$.get('/username', function(res)
		{
			username = res.user;
			socket.emit('authorize', username);
			onReady();
		});
	

	// Load the various application views.
	

}())