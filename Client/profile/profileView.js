// Code for the profile view
var profileView = function(socket, username, templates, onLoadGame)
{
	var element = $(templates.usersProfile());
	var WhoIsThis = '';

	$('body').on('click', '.enterGame', function(event)
	{
		onLoadGame(event.currentTarget.value);	
	});

	$('body').on('click', '#sendGameRequest', function(event)
	{
		console.log("click")
		socket.emit('requestGame', WhoIsThis);
		onLoadGame();
	});

	$('body').on('click', '#refreshProfile', function(event)
	{
		initializeProfile(WhoIsThis);
	});


	var initializeProfile = function(profileName)
	{
		if(profileName === username)
		{
			element.find('#sendGameRequest').hide();
		}
		else
		{
			element.find('#sendGameRequest').show();
		}

		element.find('#username').empty();
		element.find('#activeGamesScrollArea').empty();
		element.find('#completedGamesScrollArea').empty();
		element.find('#statsContainer').empty();
		element.find('#onlineIndicator').empty();
		element.find('#joinDateContainer').empty();

		element.find('#username').append(profileName);
		
		$.get('/utt/CompleteGames/' + profileName, function(games)
		{
			_.each(games, function(game)
			{
				var turnMessage;
				if(game.wonBy)
				{
					turnMessage = "This game was won by " + game.wonBy + "!";
				}
				else
				{
					turnMessage = "This games was a draw!";
				}
				element.find('#completedGamesScrollArea').append(templates.usersGame(
				{
					gameId: game.gameId,
					user: game.from,
					opponent: game.to,
					turnMessage: turnMessage
				}));
			});
		});

		$.get('/utt/NonCompleteGames/' + profileName, function(games)
		{
			_.each(games, function(game)
			{
				var turnMessage;

				if(game.activePlayer)
				{
					turnMessage = "Waiting for " + game.activePlayer + " to make a move!";
				}
				else
				{
					turnMessage = "Waiting for " + game.to + " to accept the game!";
				}
				element.find('#activeGamesScrollArea').append(templates.usersGame(
				{
					gameId: game.gameId,
					user: game.from,
					opponent: game.to,
					turnMessage: turnMessage
				}));
			});
		});

		$.get('/profile/getUserInfo/' + profileName, function(info)
		{
			var joinDateGMT = new Date(info.joinDate);
			console.log(joinDateGMT)
			element.find('#statsContainer').append(templates.stats(
			{
				wins: info.wins,
				loses: info.loses,
				draws: info.draws
			}));

			element.find('#joinDateContainer').append(templates.joinDate(
			{
				joinDate: moment(new Date(joinDateGMT.getTime() - (joinDateGMT.getTimezoneOffset() * 60000))).format('MMMM Do YYYY, h:mm a')
			}));

			if(info.connectionCount > 0)
			{
				element.find('#onlineIndicator').append('(online)');
			}
			else
			{
				element.find('#onlineIndicator').append('(offline)');
			}
		});
	}

	var loadProfile = function(profileName)
	{
		WhoIsThis = profileName;
		initializeProfile(profileName);
		return element;
	};

	return loadProfile;
}