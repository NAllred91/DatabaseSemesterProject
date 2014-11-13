(function()
{
	var _ = require('underscore');
	var express = require('express');

	var setup = function(app, dbHelper, io)
	{
		// List of online users
		var onlineUsers = {};


		// Begin Routes

		// Redirect to home if the user is logged in.
		app.get('/login.html', function(req,res,next)
		{
			if(req.session && req.session.user && onlineUsers[req.session.user])
			{
				res.redirect('/home.html');
				return;
			}

			next()
		});

		// Listen for the user to log in.
		app.post('/login', function(req, res)
		{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
			var username = req.body.username;
			var password = req.body.password;

			db.collection('users').findOne(
			{
				lowerCaseUsername: username.toLowerCase(),
				password: password
			}, function(err, user)
			{
				if(err)
				{
					res.status(500).end();
					return;
				}

				if(!user || user.password !== password)
				{
					res.status(401).end();
					return;
				}
				db.collection('users').update(
				{
					lowerCaseUsername: username.toLowerCase()
				},
				{
					$set: {online: true}
				}, function(err)
				{
					if(!err)
					{
						console.log("logged on")
						req.session.user = user.username;
						res.redirect('/home.html');
					}
				});
			});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
		});

		// If the user is already logged in redirect to home.
		app.get('/register.html', function(req, res, next)
		{
			console.log('get')
			if(req.session.user)
			{
				res.redirect('/home.html');
				return;
			}

			next();
		});

		// Listen for users registering.
		app.post('/register', function(req, res)
		{
			var username = req.body.username;
			var password = req.body.password;

			db.collection('users').findOne(
			{
				lowerCaseUsername: username.toLowerCase()
			}, function(err, user)
			{
				if(err)
				{
					res.status(500).end();
					return;
				}
				if(user)
				{
					res.status(409).end();
					return;
				}
				if(user && !password)
				{
					res.status(406).end();
					return;
				}

				db.collection('users').insert(
				{
					username: username,
					lowerCaseUsername: username.toLowerCase(),
					password: password
				}, function(err)
				{
					if(err)
					{
						res.status(500).end();
						return;
					}
					res.redirect('/login.html');
				});		
			});
		});

		// Listen for users signing out.
		app.post('/signOut', function(req, res)
		{
			db.collection('users').update(
				{
					username: req.session.user
				},
				{
					$set: {online: false}
				}, function(err)
				{
					if(!err)
					{
						req.session.user = undefined;
						res.redirect('/login.html');
					}
				});
		});

		// Serve up html, css, js, and images.
		app.use(express.static(__dirname + '/../../Client/login'));
		app.use(express.static(__dirname + '/../../Client/images'));
		app.use(express.static(__dirname + '/../../Client/modules'));

		// Beyond this point, all users must be logged in.
		app.all('*', function(req, res, next)
		{
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

			if(req.session && req.session.user)
			{
				next()
			}
			else
			{
				res.redirect('/login.html');
				return;
			}
		});

		app.get('/', function(req, res)
		{
			res.redirect('/home.html');
		});
	}

	module.exports = setup;

}())