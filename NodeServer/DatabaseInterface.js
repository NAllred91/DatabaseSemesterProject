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

	databaseInterface.prototype.getUserInformation = function(username, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT username, wins, loses, draws, connectionCount, joinDate FROM Users WHERE username = '<%= username %>'");

		var databaseCall = queryTemplate(
		{
			username: username
		});

		db.query(databaseCall, function(err, results)
		{
			if(err)
			{
				console.log("Database Error: Getting user information failed.. ", err);
			}

			callback(results[0] || {})
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
				if(result[0] && result[0]['COUNT(*)'] === 1)
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

	databaseInterface.prototype.addUserWin = function(userName)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET wins=wins + 1 WHERE userName='<%= userName %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Incrementing user wins failed.. ", err);
			}
		});
	}

	databaseInterface.prototype.addUserLose = function(userName)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET loses=loses + 1 WHERE userName='<%= userName %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Incrementing user loses failed.. ", err);
			}
		});
	}

	databaseInterface.prototype.addUserDraw = function(userName)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET draws=draws + 1 WHERE userName='<%= userName %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName
		});
		
		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Incrementing user draws failed.. ", err);
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

	databaseInterface.prototype.registerUser = function(userName, password, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO Users (userName, password, joinDate, connectionCount) VALUES ('<%= userName %>','<%= password %>','<%= joinDate %>',0)");
		
		var databaseCall = queryTemplate(
		{
			userName: userName,
			password: password,
			joinDate: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: registering new user failed.. ", err);
			}
			callback(err);	
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

		db.query(databaseCall, function(err, result)
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

	databaseInterface.prototype.getCompleteGames = function(username, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT state, gameId, challenger, challengee, lastMoveTime, activePlayer, wonBy FROM Games WHERE state = 'complete' AND (challenger = '<%= username %>' OR challengee = '<%= username %>')")
		
		var databaseCall = queryTemplate(
		{
			username: username
		});

		db.query(databaseCall, function(err, result)
		{
			if(err)
			{
				console.log("Database Error: Getting complete games failed.. ",err);
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

		var databaseCall = "SELECT message, sender FROM Messages WHERE gameId is NULL ORDER BY timeSent ASC";

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

		var databaseQuery = _.template("SELECT message, sender FROM Messages WHERE gameId = '<%= gameId %>' ORDER BY timeSent ASC");

		var databaseCall = databaseQuery(
		{
			gameId: gameId
		});

		db.query(databaseCall, function(err, messages)
		{
			if(err)
			{
				console.log("Database Error: Getting game chat logs failed.. ", err);
				callback([]);
			}
			else
			{
				callback(messages);
			}
		});
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

	databaseInterface.prototype.addGameChatMessage = function(username, gameId, message)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO Messages (message, timeSent, sender, gameId) VALUES ('<%= message %>', '<%= now %>', '<%= username %>', '<%= gameId %>')");

		var databaseCall = queryTemplate(
		{
			username: username,
			message: message,
			gameId: gameId,
			now: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding game chat message failed.. ", err);
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

		var queryTemplate = _.template("UPDATE Games SET state = 'active', playableGrid = 0, activePlayer = '<%= activePlayer %>', startTime = '<%= now %>', lastMoveTime = '<%= now %>' WHERE gameId = '<%= gameId %>'");

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

	databaseInterface.prototype.updateGame = function(gameId, board, playableGrid, activePlayer, state, wonBy, callback)
	{
		var db = this.db;
		var gameBoard = JSON.stringify(board).replace(/"/g, '\\"');
		var now = getMySQLTimeStamp();

		var queryTemplate = _.template("UPDATE Games SET board = '<%= gameBoard %>', playableGrid = '<%= playableGrid %>', activePlayer = '<%= activePlayer %>', state = '<%= state %>', wonBy = '<%= wonBy %>', lastMoveTime = '<%= now %>' WHERE gameId = '<%= gameId %>'");
		
		var databaseCall = queryTemplate(
		{
			gameId: gameId,
			gameBoard: gameBoard,
			playableGrid: playableGrid,
			activePlayer: activePlayer,
			state: state,
			wonBy: wonBy,
			now: now
		});

		db.query(databaseCall, function(err, result)
		{
			if(err)
			{
				console.log("Database Error: Updating a game failed..", err);
				callback(err);
			}
			else if(result.affectedRows === 0)
			{
				callback(new Error("Game Id not found."));
			}
			else if(result.affectedRows > 1)
			{
				callback(new Error("Multiple games with same Id"));
			}
			else
			{
				callback(null, now);
			}
		});
	}

	databaseInterface.prototype.searchUsers = function(query, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT username FROM Users WHERE username LIKE '%<%= query %>%'");

		var databaseCall = queryTemplate(
		{
			query: query
		});

		db.query(databaseCall, function(err, result)
		{
			callback(result || []);
		});
	}

	databaseInterface.prototype.addNetworkLog = function(ip, username, url, method, userAgent, body)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO NetworkLog (ipAddress, username, url, method, userAgent, body) VALUES ('<%= ip %>','<%= username %>','<%= url %>','<%= method %>','<%= userAgent %>','<%= body %>')");
	
		var databaseCall = queryTemplate(
		{
			ip: ip,
			username: username,
			url: url,
			method: method,
			userAgent: userAgent,
			body: body
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding network log failed..", err);
			}
		});
	}

	databaseInterface.prototype.addNewThread = function(username, title, callback)
	{
		var db = this.db;
		var threadId = uuid();

		var queryTemplate = _.template("INSERT INTO Threads (originalPoster, lastPoster, createdTime, lastPostTime, title, threadId) VALUES ('<%= username %>','<%= username %>','<%= now %>','<%= now %>', '<%= title %>','<%= threadId %>')");
		
		var databaseCall = queryTemplate(
		{
			username: username,
			title: title,
			now: getMySQLTimeStamp(),
			threadId: threadId
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding new thread failed..", err);
				callback(err);
			}
			else
			{
				callback(null, threadId);
			}
		});
	}

	databaseInterface.prototype.addNewPost = function(threadId, username, body, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO Posts (threadId, poster, post, postTime) VALUES ('<%= threadId %>','<%= poster %>','<%= post %>','<%= postTime %>')");
		
		var databaseCall = queryTemplate(
		{
			threadId: threadId,
			poster: username,
			post: body,
			postTime: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding new post failed..", err);
				callback(err);
			}
			else
			{
				callback();
			}
		});
	}

	databaseInterface.prototype.getThreads = function(callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT * FROM Threads ORDER BY lastPostTime DESC");

		var databaseCall = queryTemplate();

		db.query(databaseCall, function(err, results)
		{
			if(err)
			{
				console.log("Database Error: Getting threads failed..", err);
			}

			callback(err, results)
		});
	}

	databaseInterface.prototype.getThreadPostCount = function(threadId, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT COUNT(*) FROM Posts WHERE threadId='<%= threadId %>'");

		var databaseCall = queryTemplate(
		{
			threadId: threadId
		});

		db.query(databaseCall, function(err, result)
		{
			var count = 0;
			if(err)
			{
				console.log("Database Error: Getting thread post count failed..", err);
			}
			if(result[0] && result[0]['COUNT(*)'])
			{
				count = result[0]['COUNT(*)']
			}

			callback(count);
		});
	}

	databaseInterface.prototype.incrementThreadViewCount = function(threadId)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Threads SET views=views + 1 WHERE threadId='<%= threadId %>'");

		var databaseCall = queryTemplate(
		{
			threadId: threadId
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Incrementing thread view count failed..", err);
			}
		});
	}

	databaseInterface.prototype.updateUserThreadViews = function(username, threadId)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO UserThreadViews (username, viewTime, viewedThreadId) VALUES('<%= username %>','<%= now %>','<%= threadId %>') ON DUPLICATE KEY UPDATE viewTime='<%= now %>'");
	
		var databaseCall = queryTemplate(
		{
			threadId: threadId,
			username: username,
			now: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Updating user thread views failed..", err);
			}
		});
	}

	databaseInterface.prototype.getUserThreadViews = function(username, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT viewedThreadId, viewTime FROM userThreadViews WHERE username='<%= username %>'");

		var databaseCall = queryTemplate(
		{
			username: username
		});

		db.query(databaseCall, function(err, results)
		{
			if(err)
			{
				console.log("Database Error: Getting user thread views failed..", err);
				callback([]);
			}
			else
			{
				callback(results);
			}
		});
	}

	databaseInterface.prototype.getThreadPosts = function(threadId, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT poster, post, postTime FROM Posts WHERE threadId='<%= threadId %>' ORDER BY postTime ASC");

		var databaseCall = queryTemplate(
		{
			threadId: threadId
		});

		db.query(databaseCall, function(err, results)
		{
			if(err)
			{
				console.log("Database Error: Getting thread posts failed..", err);
				callback([]);
			}
			else
			{
				callback(results);
			}

		});
	}

	databaseInterface.prototype.setLastPostTime = function(threadId, username)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Threads SET lastPostTime='<%= now %>', lastPoster='<%= username %>' WHERE threadId='<%= threadId %>'");

		var databaseCall = queryTemplate(
		{
			threadId: threadId,
			username: username,
			now: getMySQLTimeStamp()
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Setting last post time failed..", err);
			}
		});
	}

	databaseInterface.prototype.getNumberOfPostForUser = function(username, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("SELECT COUNT(*) FROM Posts WHERE poster='<%= username %>'");

		var databaseCall = queryTemplate(
		{
			username: username
		});

		db.query(databaseCall, function(err, result)
		{
			var count = 0;
			if(err)
			{
				console.log("Database Error: Getting user post count failed..", err);
			}
			if(result[0] && result[0]['COUNT(*)'])
			{
				count = result[0]['COUNT(*)']
			}

			callback(count);
		});
	}

	module.exports = databaseInterface;
}());