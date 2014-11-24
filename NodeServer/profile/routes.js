(function()
{
	var express = require('express');
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/profile'));
		app.use(express.static(__dirname + '/../../Client/profile/templates'));

		app.get('/profile/getUserInfo/:username', function(req, res)
		{
			dbHelper.getUserInformation(req.params.username, function(info)
			{
				dbHelper.getNumberOfPostForUser(req.params.username, function(postCount)
				{
					info.postCount = postCount;
					res.send(info);
				});
			});
		});
	}

	module.exports = setup;

}());