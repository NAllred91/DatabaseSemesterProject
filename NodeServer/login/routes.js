(function()
{
	var _ = require('underscore');
	var express = require('express');

	var setup = function(app, dbHelper, io, idMap)
	{
		// Begin Routes

		io.on('connection', function(socket)
		{
			// The connection must identify what user it is representing.  This is
			// an obvious security flaw, however it is ok for the purposes of the class.
			// Under normal use of the website this will be suffecient. 
			socket.on('identify', function(username)
			{
				idMap[username] ? idMap[username].push(socket.id) : idMap[username] = [socket.id];
				dbHelper.addUserConnection(username);
				socket.on('subscribe', function(room)
				{
					socket.join(room);
				});

				socket.on('unsubscribe', function(room)
				{
					socket.leave(room);
				});
				socket.on('disconnect', function()
				{
					dbHelper.removeUserConnection(username);
					idMap[username] = _.without(idMap[username], socket.id);
					if(idMap[username].length === 0)
					{
						delete idMap[username];
					}
				});
			});		
		});

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

			dbHelper.validateUser(username, password, function(correctCaseName)
			{
				if(!correctCaseName)
				{
					res.sendStatus(401);
				}
				else
				{
					req.session.user = correctCaseName;
					req.session.cookie.maxAge = 120000;
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
						res.sendStatus(201);
					}
				});
		});

		// Listen for users signing out.
		app.post('/signOut', function(req, res)
		{
			if(req.session)
			{
				req.session.user = undefined;
			}
				res.redirect('/login.html');
		});

		// Serve up html, css, js, and images.
		app.use(express.static(__dirname + '/../../Client/login'));
		app.use(express.static(__dirname + '/../../Client/images'));
		app.use(express.static(__dirname + '/../../Client/modules'));

		// Use a ping to reset the max age of the cookie.
		app.get('/ping', function(req, res)
		{
			if(req.session && req.session.user)
			{
				req.session._garbage = Date();
				req.session.touch();
				res.sendStatus(200);
			}
			else
			{
				console.log("Error: Ping Failed..")
				res.sendStatus(401);
			}
		});

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
			}
		});

		app.get('/', function(req, res)
		{
			res.redirect('/home.html');
		});
	}

	module.exports = setup;

}())