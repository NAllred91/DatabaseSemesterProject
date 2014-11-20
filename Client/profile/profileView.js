// Code for the profile view
var profileView = function(socket, username, templates, onLoadGame)
{
	var element = $(templates.usersProfile());

	$('body').on('click', '.enterGame', function(event)
	{
		onLoadGame(event.currentTarget.value);	
	});

	var initializeProfile = function(username)
	{
		element.find('#username').empty();
		element.find('#activeGamesScrollArea').empty();
		element.find('#completedGamesScrollArea').empty();
		element.find('#statsContainer').empty();

		element.find('#username').append(username);
		$.get('/utt/CompleteGames/' + username, function(games)
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

		$.get('/utt/NonCompleteGames/' + username, function(games)
		{
			_.each(games, function(game)
			{
				element.find('#activeGamesScrollArea').append(templates.usersGame(
				{
					gameId: game.gameId,
					user: game.from,
					opponent: game.to,
					turnMessage: "Waiting for " + game.activePlayer + " to make a move!"
				}));
			});
		});

		$.get('/profile/getUserInfo/' + username, function(info)
		{
			console.log(info)
			element.find('#statsContainer').append(JSON.stringify(info))
		});
	}

	var loadProfile = function(username)
	{

		initializeProfile(username);
		return element;
	};

	return loadProfile;
}