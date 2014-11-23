(function()
{
	var express = require('express');
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/forum'));
		app.use(express.static(__dirname + '/../../Client/forum/templates'));

		app.get('/forum/getThreads', function(req, res)
		{
			res.send([{
				author: "nick",
				title: "nicks Thread",
				createdTime: new Date(),
				lastPostTime: new Date(),
				lastPoster: "Bob",
				numberOfViews: 1234,
				numberOfPosts: 5,
				threadId: "1"
			},
			{
				author: "nick",
				title: "nicks Thread",
				createdTime: new Date(),
				lastPostTime: new Date(),
				lastPoster: "Bob",
				numberOfViews: 1234,
				numberOfPosts: 5,
				threadId: "1"
			}])
		});
	}

	module.exports = setup;

}());