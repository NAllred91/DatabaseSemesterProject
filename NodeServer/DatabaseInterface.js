(function(){

	var _ = require('underscore');

	var databaseInterface = function(db){
		this.db = db;
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
				console.log("Database Error: User validation failed.. ",err);
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

	databaseInterface.prototype.removeUserConnection = function(userName, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET connectionCount=connectionCount - 1 WHERE userName='<%= userName %>'");

		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
		});
	}

	databaseInterface.prototype.addUserConnection = function(userName, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("UPDATE Users SET connectionCount=connectionCount + 1 WHERE userName='<%= userName %>'");
		
		var databaseCall = queryTemplate(
		{
			userName: userName
		});

		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
		});
	}

	databaseInterface.prototype.registerUser = function(userName, password, callback)
	{
		var db = this.db;

		var queryTemplate = _.template("INSERT INTO USERS (userName, password, connectionCount) VALUES ('<%= userName %>','<%= password %>',0)");
		
		var databaseCall = queryTemplate(
		{
			userName: userName,
			password: password
		});

		db.query(databaseCall, function(err, rows, fields)
		{
			if(err)
			{
				callback(err.code);
			}
			else
			{
				callback();
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
				console.log("Database Error: Getting online user list failed..",err);
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
			callback(err);
		});
	}

	databaseInterface.prototype.getActiveAndPendingGames = function(username, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.getFinishedGames = function(username, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.getGameData = function(gameId, callback)
	{
		var db = this.db;
		callback();
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
			now: new Date().toISOString().slice(0, 19).replace('T', ' ')
		});

		db.query(databaseCall, function(err)
		{
			if(err)
			{
				console.log("Database Error: Adding chat room message failed...", err);
			}
		});
	}

	databaseInterface.prototype.addNewGame = function(waitingPlayer, activePlayer, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.acceptGame = function(username, gameId, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.rejectGame = function(username, gameId, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.updateGame = function(username, gameId, board, playableGrid, state, wonBy, callback)
	{
		var db = this.db;
		callback();
	}
	module.exports = databaseInterface;
}());