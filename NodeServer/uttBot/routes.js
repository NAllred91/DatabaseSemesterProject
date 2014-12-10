(function()
{
	var config = require('../config.js');
	var _ = require('underscore');

	// A function to create an instance of socket.io.
	var getSocket = function()
	{
		var io = require('socket.io-client');
		return io;
	}


	var botArray = [
		{
			bot: getSocket().connect('http://localhost:' + config.port,
				{forceNew: true}),
			MakeAMove: require('./MakeAMove.js'),
			name: 'Bot',
			password: '0303'
		},
		{
			bot: getSocket().connect('http://localhost:' + config.port,
				{forceNew: true}),
			MakeAMove: require('./MakeAMove2.js'),
			name: 'Bot2.0',
			password: '0303'
		}
	]



	var setup = function(app, dbHelper, io, idMap)
	{	
		_.each(botArray, function(botObject)
		{
			var bot = botObject.bot;
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
				var opponent;
				if(gameData.from === botObject.name)
				{
					opponent = gameData.to;
				}
				else
				{
					opponent = gameData.from;
				}
				if(gameData.activePlayer === botObject.name)
				{
					var move = botObject.MakeAMove(botObject.name, opponent, 1, gameData.board, gameData.playableGrid);

					var big = move.big;
					var mini = move.mini;
					_.delay(function()
					{
						bot.emit('updateGame', gameData.gameId, big, mini, function(err)
						{
							if(err)
							{
								console.log("Bot Error; " + JSON.stringify(err))
							}
						})
					},1500)
				}

				if(gameData.state === "complete")
				{
					bot.emit('unsubscribe', gameData.gameId);
				}
			};

			bot.on("gameStarted", function(gameInfo)
			{
				bot.emit('subscribe', gameInfo.gameId);
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
				dbHelper.getActiveAndPendingGames(botObject.name, function(games)
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
			dbHelper.validateUser(botObject.name, botObject.password, function(user)
			{
				if(!user)
				{
					dbHelper.registerUser(botObject.name, botObject.password, function()
					{
						bot.emit('identify', botObject.name);
						// Wait 6 seconds to make sure that the Bot has connected completely.
						_.delay(function(){initialize()},6000);
					});
				}
				else
				{
					bot.emit('identify', botObject.name);
					// Wait 6 seconds to make sure that the Bot has connected completely.
					_.delay(function(){initialize()},6000);
				}
			});
		});		
	}

	module.exports = setup;
}())