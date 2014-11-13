(function()
{
	var express = require('express');

	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/home'));

		app.get('/username', function(req, res)
		{
			if(req.session)
			{
				res.send(
				{
					"user": req.session.user
				});
			}
			else
			{
				res.sendStatus(401);
			}
		});
	}

	module.exports = setup;

}())