(function(){

	var _ = require('underscore');

	var databaseInterface = function(db){
		this.db = db;
	}

	databaseInterface.prototype.validateUser = function(userName, password, callback)
	{
		var db = this.db;

		var databaseCall = "SELECT COUNT(*) FROM Users WHERE userName='" + userName + "' AND password='" + password + "'";
		console.log(databaseCall)
		db.query(databaseCall, function(err, count)
		{
			console.log(err,count);
			if(err)
			{
				callback(new Error('Database Error'));
			}
			else
			{
				if(count[0]['COUNT(*)'] === 1)
				{
					callback();
				}
				else
				{
					callback(new Error("Invalid username/password combination"));
				}
			}
		});
	}

	databaseInterface.prototype.removeUserConnection = function(userName, callback)
	{
		var db = this.db;

		var databaseCall = "UPDATE Users SET connectionCount=connectionCount - 1 WHERE userName='"+ userName +"'";

		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
		});
	}

	databaseInterface.prototype.addUserConnection = function(userName, callback)
	{
		var db = this.db;

		var databaseCall = "UPDATE Users SET connectionCount=connectionCount + 1 WHERE userName='"+ userName +"'";

		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
		});
	}

	databaseInterface.prototype.registerUser = function(userName, password, callback)
	{
		var db = this.db;

		var databaseCall = "INSERT INTO USERS (userName, password, online, connectionCount) VALUES ('" + userName + "','" + password + "',false,0)"
		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
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
		callback();
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
		callback();
	}

	databaseInterface.prototype.getGameChatLog = function(gameId, callback)
	{
		var db = this.db;
		callback();
	}

	databaseInterface.prototype.addChatRoomMessage = function(username, message, callback)
	{
		var db = this.db;
		callback();
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