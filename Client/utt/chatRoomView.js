var uttChatRoom = function(socket, username, templates, onLoadGame)
{

	var element = $(templates.chatRoom())

	$.get('/utt/NonCompleteGames/' + username, function(res)
	{
		_.each(res, function(game)
		{
			if(game.state === "active")
			{
				if(game.to === username)
				{
					game.opponent = game.from;
					element.find('#activeGamesScrollArea').append(createActiveGameDiv(game));
				}

				if(game.from === username)
				{
					game.opponent = game.to;
					element.find('#activeGamesScrollArea').append(createActiveGameDiv(game));
				}
			}

			if(game.state === "pending")
			{
				if(game.to === username)
				{
					element.find('#pendingGamesScrollArea').append(templates.pendingGame(
						{
							user: game.from, 
							gameId: game.gameId
						}));
				}

				if(game.from === username)
				{
					element.find('#pendingGamesScrollArea').append(templates.waitingGame(
						{
							user: game.to, 
							gameId: game.gameId
						}));
				}
			}
		});
	});

	$('body').on('click', '#requestGame', function(event)
	{
		var opponent = element.find('#userList').val();
		if(opponent)
		{
			socket.emit('requestGame', element.find('#userList').val())
		}	
	});

	$('body').on('click','#submitButton', function(event)
	{
		var message = $("#message").val();
		$('#message').val("");
		if(message.length > 0)
		{
			socket.emit("chatMessage", message);
		}
	});

	$('body').on('keyup', '#message', function(event)
	{
		if(event.which === 13)
		{
			$('#submitButton').trigger('click');
		}
	});


	$('body').on('click', '.acceptGame', function(event)
	{
		socket.emit("acceptGame", event.currentTarget.value)
	});

	$('body').on('click', '.rejectGame', function(event)
	{
		socket.emit("rejectGame", event.currentTarget.value)
		removeGame(event.currentTarget.value)
	});

	$('body').on('click', '.cancelChallenge', function(event)
	{
		socket.emit("rejectGame", event.currentTarget.value);
		removeGame(event.currentTarget.value);
	});

	$('body').on('click', '.goToGame', function(event)
	{
		onLoadGame(event.currentTarget.value);
	});

	socket.on('chatMessage', function(msg)
	{
		element.find("#chatScrollArea").append(templates.chatMessage(
			{
				user: msg.user,
				message: msg.message
			}));

		element.find('#chatScrollArea').scrollTop(element.find('#chatScrollArea')[0].scrollHeight);
	});

	socket.on('onlineUsers', function(users)
	{
		updateUserList(users)
	});

	socket.on('gameRequested', function(user, gameId)
	{
		element.find('#pendingGamesScrollArea').append(templates.pendingGame(
			{
				user: user, 
				gameId: gameId
			}));
	});

	socket.on('gameWaiting', function(user, gameId)
	{
		console.log("message")
		element.find('#pendingGamesScrollArea').append(templates.waitingGame(
						{
							user: user, 
							gameId: gameId
						}));
	});

	socket.on('gameStarted', function(gameInfo)
	{
		removeGame(gameInfo.gameId);
		element.find('#activeGamesScrollArea').append(createActiveGameDiv(gameInfo));
	});

	socket.on('setTurn', function(activePlayer, gameId)
	{
		console.log(activePlayer)
		console.log(gameId)
		var turnIndicator;

		if(activePlayer)
		{
			if(activePlayer === username)
			{
				turnIndicator = "Your Turn";
			}
			else
			{
				turnIndicator = "Waiting for " + activePlayer;
			}
			element.find('#' + gameId + 'turnIndicator').text(turnIndicator)
		}
		else
		{
			removeGame(gameId)
		}
		
	});

	socket.on('gameRemoved', function(gameId)
	{
		removeGame(gameId)
	});

	var initializeChatWindow = function()
	{
		$.get('/onlineUsers', function(users)
		{
			updateUserList(users);
		});

		$.get('/utt/chatRoomLog', function(log)
		{
			element.find("#chatScrollArea").empty();
			_.each(log, function(message)
			{
				element.find("#chatScrollArea").append(templates.chatMessage(
					{
						user: message.sender,
						message: message.message
					})
				);

				element.find('#chatScrollArea').scrollTop(element.find('#chatScrollArea')[0].scrollHeight)
			});
		});
	}


	var updateUserList = function(users)
	{
		element.find("#onlineUsersScrollArea").empty();
		var currentUsers = [];
		
		console.log("Updated "  + users)
		element.find('#userList option').each(function(index, obj)
		{
			currentUsers.push(obj.value);
		});


		_.each(users, function(user)
		{
			if(!_.contains(currentUsers, user))
			{
				element.find('#userList').append(templates.userDropDown(
					{
						user: user
					}));
			}

			element.find("#onlineUsersScrollArea").append(templates.onlineUser(
			{
				user: user
			}));
		});

		element.find('#userList option').each(function(index, obj)
		{
			if(!_.contains(users, obj.value))
			{
				obj.remove();
			}
		});
	}

	var createActiveGameDiv = function(gameInfo)
	{
		console.log(gameInfo)
		var gameId = gameInfo.gameId;
		var opponent = gameInfo.opponent;
		var time = gameInfo.lastMoveTime;
		var activePlayer = gameInfo.activePlayer;

		var turnIndicator;

		if(activePlayer === username)
		{
			turnIndicator = "Your Turn";
		}
		else
		{
			turnIndicator = "Waiting for " + opponent;
		}


		return templates.activeGame(
			{
				gameId: gameId,
				opponent: opponent,
				turnIndicator: turnIndicator
			});
	}

	var removeGame = function(gameId)
	{
		element.find('#' + gameId).remove();
	}

	var layout = function()
	{
		initializeChatWindow();
		return element;
	}

	return layout;
}