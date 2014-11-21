(function()
{
	var io = require('socket.io-client');
	var bot = io.connect('http://localhost:8001');
	var _ = require('underscore');
	var MakeAMove = require('./MakeAMove.js')



	var setup = function(app, dbHelper, io, idMap)
	{	
		bot.on('gameRequested', function(user, gameId)
		{
			bot.emit('subscribe', gameId);
			_.delay(function()
			{
				bot.emit('acceptGame', gameId);
			},1000)
		});

		var processData = function(gameData)
		{
			if(gameData.activePlayer === 'Bot')
			{
				var move = MakeAMove('Bot', gameData.from, 1, gameData.board, gameData.playableGrid);

				var big = move.big;
				var mini = move.mini;

				bot.emit('updateGame', gameData.gameId, big, mini, function(err)
				{
					if(err)
					{
						console.log("Bot Error; " + JSON.stringify(err))
					}
				})
			}

			if(gameData.state === "complete")
			{
				bot.emit('unsubscribe', gameData.gameId);
			}
		};

		bot.on("gameStarted", function(gameInfo)
		{
			dbHelper.getGameData(gameInfo.gameId, function(game)
				{
					if(game)
					{
						processData(game);
					}
				});
		});

		bot.on("gameUpdate", function(gameData)
		{
			processData(gameData);
		});

		var initialize = function()
		{
			dbHelper.getActiveAndPendingGames('Bot', function(games)
			{
				_.each(games, function(game)
				{
					bot.emit('subscribe', game.gameId);
					dbHelper.getGameData(game.gameId, function(game)
					{
						if(game)
						{
							processData(game);
						}
					});
				});
			});
		}

		// Check to see if the Bot is registered, if not register the Bot.
		dbHelper.validateUser('Bot', '0303', function(user)
		{
			if(!user)
			{
				dbHelper.registerUser('Bot', '0303', function()
				{
					bot.emit('identify', 'Bot');
					// Wait 6 seconds to make sure that the Bot has connected completely.
					_.delay(function(){initialize()},6000);
				});
			}
			else
			{
				bot.emit('identify', 'Bot');
				// Wait 6 seconds to make sure that the Bot has connected completely.
				_.delay(function(){initialize()},6000);
			}
		});
		
	}

	module.exports = setup;
}())