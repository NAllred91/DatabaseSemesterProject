(function()
{
	var express = require('express');
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/search'));
		app.use(express.static(__dirname + '/../../Client/search/templates'));

		app.get('/search/:query', function(req, res)
		{
			dbHelper.searchUsers(req.params.query, function(results)
			{
				res.send(results);
			});
		});

		// Catches an empty query. probably bad form...
		app.get('/search/', function(req, res)
		{
			res.send([]);
		});
	}

	module.exports = setup;

}());
