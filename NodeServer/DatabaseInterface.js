(function(){


	var databaseInterface = function(db){
		this.db = db;
	}

	databaseInterface.prototype.signOnUser = function(userName, callback)
	{
		callback();
	}

	databaseInterface.prototype.signOffUser = function(userName, callback)
	{
		callback();
	}

	databaseInterface.prototype.registerUser = function(userName, password, callback)
	{
		callback();
	}

	module.exports = databaseInterface;
}());