(function()
{
	var express = require('express');
	var _ = require('underscore');

	var setup = function(app, dbHelper, io, idMap)
	{
		var onlineUserList = [];
		io.on('connection', function(socket)
		{	
			// Try for 5 seconds to get access to the restricted sockets.
			// If a username doesn't appear in the idMap by then, disconnect
			// the socket.
			var count = 0		
			var getAccess = function(count)
			{
				if(count > 5)
				{
					socket.disconnect();
					return;
				}
				var username = _.invert(idMap)[socket.id];
				if(username)
				{
					restrictedSocket(socket, username);
				}
				else
				{
					_.delay(function()
						{
							getAccess(count + 1);
						}, 1000);
				}	
			}

			getAccess(count);	
		});

		// These can only be used once the user name for the socket
		// has been given.
		var restrictedSocket = function(socket, name)
		{
			var userList = [];

			var sendOnlineUsers = function()
			{
				// Only send the user list if it has changed.
				if(_.difference(onlineUserList, userList, [name]).length 
					|| _.difference(userList, onlineUserList).length)
				{
					userList = _.without(onlineUserList, name);
					socket.emit('onlineUsers', userList);
				}

				_.delay(function()
				{
					if(socket.connected)
					{
						sendOnlineUsers();
					}		
				},500);
			}

			sendOnlineUsers()
		};

		var getOnlineUsersFromDatabase = function()
		{
			dbHelper.getOnlineUsers(function(users)
			{
				onlineUserList = users;

				_.delay(function()
				{
					getOnlineUsersFromDatabase();
				},2000);
			})
		};

		getOnlineUsersFromDatabase();

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

		app.get('/onlineUsers', function(req, res)
		{
			if(req.session)
			{
				var name = req.session.user;
				res.send(_.without(onlineUserList, name));
			}
			else
			{
				res.sendStatus(401);
			}
			
		});
	}

	module.exports = setup;

}())