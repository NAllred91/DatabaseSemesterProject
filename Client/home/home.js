(function()
{
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
			$("#PM").on('click', function()
			{
				$('#app').empty();
				$('#app').append();
			});

			$("#utt").on('click', function()
			{
				$('#app').empty();
				$('#app').append(uttElement.layout());
			});

			$("#profiles").on('click', function()
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

	var socket = io();
	var username;
	
	// Retrieve the username
	$.get('/username', function(res)
		{
			username = res.user;
			socket.emit('identify', username);
			onReady();
		});
	

	// Load the various application views.
	var uttElement = uttView(onReady);
	

}())