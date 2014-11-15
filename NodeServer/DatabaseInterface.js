(function(){

	var _ = require('underscore');
	var uuid = require('uuid-v4');

	var databaseInterface = function(db){
		this.db = db;
	}

	var getMySQLTimeStamp = function()
	{
		return new Date().toISOString().slice(0, 19).replace('T', ' ');
	}

	var getPlayers = function(db, gameId, callback)
	{
		var queryTemplate = _.template("SELECT challenger, challengee FROM Games WHERE gameId = '<%= gameId %>'");

		var databaseCall = queryTemplate(
		{
			gameId: gameId
		});

		db.query(databaseCall, function(err, results)
		{
			if(err)
			{
				console.log("Database Error: Getting game players failed.. ", err);
			}
			callback(results[0] || {});
		});
	}

	databaseInterface.prototype.validateUser = function(userName, password, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT COUNT(*), userName FROM Users WHERE userName='<%= userName %>' AND password='<%= password %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName,
			password: password
		});

		db.query(databaseCall, function(err, result)
		{
			if(err)
			{
				console.log("Database Error: User validation failed.. ", err);
				callback();
			}
			else
			{
				if(result[0]['COUNT(*)'] === 1)
				{
					callback(result[0]['userName']);
				}
				else
				{
					console.log("Invalid username/password combination: " + userName + " : " + password);
					callback();
				}
			}
		});
	}

	databaseInterface.prototype.removeUserConnection = function(userName)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET connectionCount=connectionCount - 1 WHERE userName='<%= userName %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err)
		{
			if(err)
				{
					console.log("Database Error: Removing user connection failed.. ", err);
				}
		});
	}

	databaseInterface.prototype.addUserConnection = function(userName)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET connectionCount=connectionCount + 1 WHERE userName='<%= userName %>'");
		
		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err, rows, fields)
		{
			if(err)
				{
					console.log("Database Error: Adding user connection failed.. ", err);
				}
		});
	}

	databaseInterface.prototype.registerUser = function(userName, password)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO USERS (userName, password, connectionCount) VALUES ('<%= userName %>','<%= password %>',0)");
		
		var databaseCall = queryTemplate(
		{
			userName: userName,
			password: password
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: connectionCount reset failed.. ", err);
			}		
		});
	}

	databaseInterface.prototype.getOnlineUsers = function(callback)
	{
		var db = this.db;
		
		var databaseCall = "SELECT userName FROM Users WHERE connectionCount > 0";

		db.query(databaseCall, function(err, users)
		{
			if(err)
			{
				console.log("Database Error: Getting online user list failed.. ",err);
				callback([]);
			}
			else
			{
				var userArray = _.map(users, function(user)
				{
					return user.userName;
				});

				callback(userArray);
			}	
		});
	}

	databaseInterface.prototype.resetConnectionCounts = function(callback)
	{
		var db = this.db;

		var databaseCall = "UPDATE Users SET connectionCount = 0";

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Reseting connection count failed..", err);
			}
		});
	}

	databaseInterface.prototype.getActiveAndPendingGames = function(username, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT state, gameId, challenger, challengee, lastMoveTime, activePlayer FROM Games WHERE (state = 'pending' OR state = 'active') AND (challenger = '<%= username %>' OR challengee = '<%= username %>')")
		
		var databaseCall = queryTemplate(
		{
			username: username
		});

		db.query(databaseCall, function(err, result, somethin)
		{
			if(err)
			{
				console.log("Database Error: Getting active and pending games failed.. ",err);
				callback([]);
			}
			else
			{
				// TODO consistency....
				var formattedResults = _.map(result, function(game)
				{
					game.to = game.challengee;
					game.from = game.challenger;
					return game;
				});

				callback(formattedResults);
			}
		});
	}

	databaseInterface.prototype.getFinishedGames = function(username, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.getGameData = function(gameId, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT * FROM Games WHERE gameId = '<%= gameId %>'");

		var databaseCall = queryTemplate(
		{
			gameId: gameId
		});

		db.query(databaseCall, function(err, game)
		{
			if(err)
			{
				console.log("Database Error: Getting game failed.. ",err);
				callback();
			}
			else if(game.length === 0)
			{
				callback()
			}
			else
			{
				// TODO consistency....
				game[0].to = game[0].challengee;
				game[0].from = game[0].challenger;
				game[0].board = JSON.parse(game[0].board);

				callback(game[0]);
			}
		});
	}

	databaseInterface.prototype.getChatRoomLog = function(callback)
	{
		var db = this.db;

		var databaseCall = "SELECT message, sender FROM Messages WHERE recipient is NULL ORDER BY timeSent ASC";

		db.query(databaseCall, function(err, messages)
		{
			if(err)
			{
				console.log("Database Error: Getting chat room logs failed.. ", err);
				callback([]);
			}
			else
			{
				callback(messages);
			}
		});
	}

	databaseInterface.prototype.getGameChatLog = function(gameId, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.addChatRoomMessage = function(username, message)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO Messages (message, timeSent, sender) VALUES ('<%= message %>', '<%= now %>', '<%= username %>')");

		var databaseCall = queryTemplate(
		{
			username: username,
			message: message,
			now: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding chat room message failed.. ", err);
			}
		});
	}

	databaseInterface.prototype.addNewGame = function(challenger, challengee, board, callback)
	{
		var db = this.db;
		var gameBoard = JSON.stringify(board).replace(/"/g, '\\"');
		var gameId = uuid();

		var queryTemplate = _.template('INSERT INTO Games (gameId, board, challenger, challengee, state) VALUES("<%= gameId %>", "<%= gameBoard %>", "<%= challenger %>", "<%= challengee %>", "pending")');

		var databaseCall = queryTemplate(
		{
			challenger: challenger,
			challengee: challengee,
			gameId: gameId,
			gameBoard: gameBoard,
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding new game failed.. ", err);
				callback();
			}
			else
			{
				callback(gameId);
			}
		});
	}

	databaseInterface.prototype.acceptGame = function(username, gameId, callback)
	{
		var db = this.db;
		var now = getMySQLTimeStamp();

		var queryTemplate = _.template("UPDATE Games SET state = 'active', playableGrid = 0, activePlayer = '<%= activePlayer %>', startTime = '<%= now %>' WHERE gameId = '<%= gameId %>'");

		var databaseCall = queryTemplate(
		{
			activePlayer: username,
			gameId: gameId,
			now: now
		});

		getPlayers(db, gameId, function(players)
			{
				var opponentName = 	_.without(_.values(players), username)
				 if(opponentName.length === 1)
				 {
				 	db.query(databaseCall, function(err)
					{
						if(err)
						{
							console.log("Database Error: Accepting game failed.. ", err);
							callback();
						}
						else
						{
							callback(opponentName[0], now);
						}
					});
				 }
				 else
				 {
				 	callback();
				 }
			});
	}

	databaseInterface.prototype.rejectGame = function(username, gameId, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("DELETE FROM Games WHERE gameId = '<%= gameId %>' AND state = 'pending'");

		var databaseCall = queryTemplate(
		{
			gameId: gameId
		});
		
		getPlayers(db, gameId, function(players)
			{
				var opponentName = 	_.without(_.values(players), username)
				if(opponentName.length === 1)
				{
					db.query(databaseCall, function(err, result)
					{
						if(err)
						{
							console.log("Database Error: Rejecting game failed.. ", err);
							callback();
						}
						else
						{
							callback(opponentName[0]);
						}
					});
				}
				else
				{
					callback();
				}
			});
	}

	databaseInterface.prototype.updateGame = function(username, gameId, board, playableGrid, state, wonBy, callback)
	{
		var db = this.db;
		callback();
	}
	module.exports = databaseInterface;
}());