(function(){


	var databaseInterface = function(db){
		this.db = db;
	}

	databaseInterface.prototype.signOnUser = function(userName, password, callback)
	{
		var db = this.db;

		var databaseCall = "UPDATE Users SET online=true WHERE userName='" + userName + "' AND password='" + password +"'";
		console.log(databaseCall)
		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
			if(err)
			{
				callback(new Error('Database Error'));
			}
			else
			{
				if(rows.changedRows === 1)
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

	databaseInterface.prototype.signOffUser = function(userName, callback)
	{
		var db = this.db;

		var databaseCall = "UPDATE Users SET online=false WHERE userName='"+ userName +"'";

		db.query(databaseCall, function(err, rows, fields)
		{
			console.log(err,rows,fields);
			callback();
		});
	}

	databaseInterface.prototype.registerUser = function(userName, password, callback)
	{
		var db = this.db;

		var databaseCall = "INSERT INTO USERS (userName, password, online) VALUES ('" + userName + "','" + password + "',false)"
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

	module.exports = databaseInterface;
}());