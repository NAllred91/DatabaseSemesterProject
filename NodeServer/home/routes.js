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
				var username = idMap[socket.id];
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
			var sendOnlineUsers = function()
			{
				socket.emit('onlineUsers', _.without(onlineUserList, name));

				_.delay(function()
				{
					sendOnlineUsers();
				},5000);
			}
		};

		var getOnlineUsersFromDatabase = function()
		{
			dbHelper.getOnlineUsers(function(err, users)
			{
				onlineUserList = users;

				_.delay(function()
				{
					getOnlineUsersFromDatabase();
				},4500);
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
	}

	module.exports = setup;

}())