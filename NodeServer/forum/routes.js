(function()
{
	var express = require('express');
	var async = require('async');
	var _ = require('underscore');

	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/forum'));
		app.use(express.static(__dirname + '/../../Client/forum/templates'));

		app.get('/forum/getThreads', function(req, res)
		{
			dbHelper.getThreads(function(err, results)
			{
				async.each(results, function(thread, callback)
				{
					dbHelper.getThreadPostCount(thread.threadId, function(err, count)
					{
						thread.posts = count;
						callback(err, thread);
					});
				}, function(err, result)
				{
					if(err)
					{
						res.send(500);
					}
					else
					{
						res.send(results);
					}
				});
			});
		});

		app.get('/forum/getThreadViews', function(req, res)
		{
			var viewObject = {};
			dbHelper.getUserThreadViews(req.session.user, function(results)
			{
				_.each(results, function(view)
				{
					viewObject[view.viewedThreadId] = view.viewTime;
				});

				res.send(viewObject);
			});
		});

		app.post('/forum/newThread', function(req, res)
		{
			
			if(req.session && req.session.user)
			{
				var username = req.session.user;
				var body = req.body.body;
				dbHelper.addNewThread(username, req.body.title, function(err, threadId)
				{
					if(err)
					{
						res.sendStatus(500);
					}
					else
					{
						dbHelper.addNewPost(threadId, username, body, function(err)
						{
							if(err)
							{
								res.sendStatus(500);
							}
							else
							{
								res.sendStatus(201);
							}
						});
					}
				});
			}
			else
			{
				res.sendStatus(500);
			}
		});

		app.post('/forum/newPost', function(req, res)
		{
			if(req.session && req.session.user && req.body)
			{
				var threadId = req.body.threadId;
				var post = req.body.post;
				var username = req.session.user;

				dbHelper.addNewPost(threadId, username, post, function(err)
				{
					if(err)
					{
						res.sendStatus(500);
					}
					else
					{
						dbHelper.setLastPostTime(threadId);
						res.sendStatus(201);
					}
				});
			}
			else
			{
				res.sendStatus(500);
			}
		});

		app.get('/forum/threadPosts/:threadId', function(req, res)
		{
			dbHelper.incrementThreadViewCount(req.params.threadId)
			dbHelper.updateUserThreadViews(req.session.user, req.params.threadId)
			dbHelper.getThreadPosts(req.params.threadId, function(posts)
			{
				res.send(posts);
			});
		});
	}

	module.exports = setup;

}());