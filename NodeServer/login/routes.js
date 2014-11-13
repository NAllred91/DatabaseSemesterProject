(function()
{
	var _ = require('underscore');
	var express = require('express');

	var setup = function(app, dbHelper, io)
	{
		// Begin Routes

		// Redirect to home if the user is logged in.
		app.get('/login.html', function(req,res,next)
		{
			if(req.session && req.session.user)
			{
				res.redirect('/home.html');
			}
			else
			{
				next();
			}
		});

		// Listen for the user to log in.
		app.post('/login', function(req, res)
		{                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
			var username = req.body.username;
			var password = req.body.password;

			dbHelper.signOnUser(username, password, function(err)
			{
				if(err === "Database Error")
				{
					res.sendStatus(500);
				}
				else if(err)
				{
					res.sendStatus(401);
				}
				else
				{
					req.session.user = username;
					res.redirect('/home.html');
				}
			});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		});

		// If the user is already logged in redirect to home.
		app.get('/register.html', function(req, res, next)
		{
			if(req.session && req.session.user)
			{
				res.redirect('/home.html');
			}
			else
			{
				next();
			}		
		});

		// Listen for users registering.
		app.post('/register', function(req, res)
		{
			var username = req.body.username;
			var password = req.body.password;

			if(!username && !password)
			{
				res.sendStatus(406);
				return;
			}

			dbHelper.registerUser(username, password,
				function(err)
				{
					console.log(err)
					if(err === "ER_DUP_ENTRY")
					{
						res.sendStatus(409);
					}
					else if(err)
					{
						res.sendStatus(500);
					}
					else
					{
						res.redirect('/login.html');
					}
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