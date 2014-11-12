(function(){


	var databaseInterface = function(db){
		this.db = db;
	}

	databaseInterface.prototype.findUser = function(userName, callback)
	{
		callback('ok')
	}

	module.exports = databaseInterface;
}());