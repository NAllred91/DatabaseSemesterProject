// Code for the actual game view
var uttGameLogic = function(socket, username, templates, onLoadChat)
{
	var element = $(templates.game())

	var gameData;
	var viewing;
	var previousListener;

	$('body').on('click', '#returnToUttGameRoom', function()
		{
			onLoadChat()
		});

	$('body').on('click', '#claimVictory', function()
	{
		socket.emit('claimVictory', gameData.gameId)
	});

	$('body').on('click','#gameChatSubmitButton', function(event)
	{
		var message = {
			gameId: gameData.gameId,
			message: $("#gameMessage").val()
		}
		$('#gameMessage').val("");
		if(message.message.length > 0)
		{
			socket.emit("gameChatMessage", message);
		}
	});

	$('body').on('keyup', '#gameMessage', function(event)
	{
		if(event.which === 13)
		{
			$('#gameChatSubmitButton').trigger('click');
		}
	});

	$('body').on('click', '.board', function(event)
	{
		var xPosition = event.offsetX;
		var yPosition = event.offsetY;
		var gridHeight = event.target.clientHeight;
		var gridWidth = event.target.clientWidth;
		var bigGrid = event.target.dataset.gridnumber;
		var miniGrid;

		// The click was in the first row.
		if(yPosition < gridHeight / 3)
		{
			miniGrid = 0;
		}

		// The click was in the second row.
		else if(yPosition < (2 * gridWidth) / 3)
		{
			miniGrid = 3;
		}

		// The click was in the last row.
		else
		{
			miniGrid = 6;
		}

		// The click was in the left column.
		if(xPosition < gridWidth / 3)
		{
			miniGrid = miniGrid + 1;
		}

		// The click was in the middle column.
		else if(xPosition < (2 * gridWidth) / 3)
		{
			miniGrid = miniGrid + 2;
		}
		// The click was in the right column.
		else
		{
			miniGrid = miniGrid + 3;
		}

		if(validateMove(bigGrid, miniGrid))
		{
			placeXImage(bigGrid, miniGrid, function(img)
			{
				socket.emit('updateGame', gameData.gameId, bigGrid, miniGrid,
				function(err)
				{
					if(err)
					{
						element.find(img).remove()
					}
				});
			});
		}
	});

	var validateMove = function(big, mini)
	{
		if(!big || !mini)
		{
			return false;
		}

		if(gameData.activePlayer !== username)
		{
			return false;
		}

		if(gameData.board[big].wonBy)
		{
			return false;
		}

		if(gameData.board[big].moves[mini])
		{
			return false;
		}

		if(gameData.playableGrid == big || !gameData.playableGrid)
		{
			return true;
		}

		return false;
	}

	var placeXImage = function(big, mini, callback)
	{
		var img = $(templates.xImage());
		positionImage(img, big, mini);
		callback(img);
	}

	var placeOImage = function(big, mini)
	{
		var img = $(templates.oImage());
		positionImage(img, big, mini);
	}

	var positionImage = function(img, big, mini, callback)
	{
		var leftMargin;
		var topMargin;

		if(mini == 1 || mini == 2 || mini == 3)
		{
			topMargin = '0%';
		}

		if(mini == 4 || mini == 5 || mini == 6)
		{
			topMargin = '31%';
		}

		if(mini == 7 || mini == 8 || mini == 9)
		{
			topMargin = '65%';
		}

		if(mini == 1 || mini == 4 || mini == 7)
		{
			leftMargin = '7%';
		}

		if(mini == 2 || mini == 5 || mini == 8)
		{
			leftMargin = '38%';
		}

		if(mini == 3 || mini == 6 || mini == 9)
		{
			leftMargin = '70%';
		}

		img.css('margin-left',leftMargin);
		img.css('margin-top', topMargin);
		element.find(gridMap[big]).append(img);
	}

	var displayBoard = function(board, playableGrid, state)
	{
		element.find('.oimg').remove();
		element.find('.ximg').remove();
		_.each(board, function(grid, big)
		{
			_.each(grid.moves, function(move, mini)
			{
				if(move === username || (viewing && move === gameData.from))
				{
					placeXImage(big, mini, _.noop);
				}
				else if(move)
				{
					placeOImage(big, mini);
				}
			});

			if(grid.wonBy === username || (viewing && grid.wonBy === gameData.from))
			{
				element.find(gridMap[big]).css('background-color', 'lightblue');
			}
			else if(grid.wonBy)
			{
				element.find(gridMap[big]).css('background-color', 'pink');
			}
			else
			{
				element.find(gridMap[big]).css('background-color', 'black');
			}
		});

		if(playableGrid && state !== 'complete')
		{
			element.find(gridMap[playableGrid]).css('background-color', 'orange');
		}
	}

	var incomingChatMessage = function(msg)
	{
		var addMessage = function(message)
		{
			element.find("#gameChatScrollArea").append(templates.chatMessage(
			{
				user: message.sender,
				message: message.message
			}));
			element.find('#gameChatScrollArea').scrollTop(element.find('#gameChatScrollArea')[0].scrollHeight);
		}

		if(_.isArray(msg))
		{
			_.each(msg, function(message)
			{
				addMessage(message);
			});
		}
		else
		{
			addMessage(msg);
		}
	}
		

	var incomingData = function(data)
	{	
		gameData = data;
		var now = new Date();
		var lastMoveGMT = new Date(data.lastMoveTime);
		var lastMoveLocal = new Date(lastMoveGMT.getTime() - (lastMoveGMT.getTimezoneOffset() * 60000));
		var victoryTimeLocal = new Date(lastMoveLocal.getTime() + 86400000);

		// console.log(now)
		// console.log(data.lastMoveTime)
		// console.log(lastMoveGMT)
		// console.log(lastMoveLocal)
		console.log("IN")
		console.log(data)
		 console.log(victoryTimeLocal)

		element.find('.claimVictoryContainer').empty();

console.log(data.activePlayer)
console.log(username)
console.log(victoryTimeLocal.getTime() - now.getTime())
		if(data.activePlayer === username || (data.to !== username && data.from !== username))
		{
			var opponent;
			if(data.to === username)
			{
				opponent = data.from;
			}
			else
			{
				opponent = data.to;
			}

			if(victoryTimeLocal.getTime() - now.getTime() < 0 &&  data.state === "active" && data.lastMoveTime)
			{

				element.find('.claimVictoryContainer').append(templates.claimCountDown(
					{
						timeUntil: opponent + " can claim victory!"
					}));
			}
			else
			{
				element.find('.claimVictoryContainer').append(templates.claimCountDown(
					{
						timeUntil: opponent + " can claim victory " + moment(victoryTimeLocal).fromNow()
					}));
			}
		}
		else
		{
			if(victoryTimeLocal.getTime() - now.getTime() < 0 &&  data.state === "active" && data.lastMoveTime)
			{

				element.find('.claimVictoryContainer').append(templates.claimVictory());
			}
			else
			{
				console.log("vic")
				console.log(victoryTimeLocal)
				element.find('.claimVictoryContainer').append(templates.claimCountDown(
					{
						timeUntil: "You can claim victory " + moment(victoryTimeLocal).fromNow()
					}));
			}
		}

		if(data.activePlayer === username)
		{
			element.find('#turnIndicator').empty();
			element.find('#turnIndicator').append('Your Turn!');
		}
		else
		{
			element.find('#turnIndicator').empty();
			element.find('#turnIndicator').append('Waiting for ' + data.activePlayer + ' to go...');
		}
		if(data.state === "complete")
		{
			var opponent;
			if(data.to === username)
			{
				opponent = data.from;
			}
			else
			{
				opponent = data.to;
			}

			if(data.wonBy === username)
			{
				element.find('#turnIndicator').empty();
				element.find('#turnIndicator').append('You beat ' + opponent + '!');
			}
			else if(!data.wonBy)
			{
				element.find('#turnIndicator').empty();
				element.find('#turnIndicator').append('The game was a draw!');
			}
			else if(data.to === username || data.from === username)
			{
				element.find('#turnIndicator').empty();
				element.find('#turnIndicator').append('You lost to ' + opponent + '.');
			}
			else
			{
				element.find('#turnIndicator').empty();
				element.find('#turnIndicator').append(data.wonBy + ' won!');
			}

			removeGame(data.gameId);
		}

		displayBoard(data.board, data.playableGrid, data.state);
	}

	var removeGame = function(gameId)
	{
		$(templates.chatRoom).find('#' + gameId).remove();
	}

	var clearChat = function()
	{
		element.find("#gameChatScrollArea").empty();
	}

	var gridMap =
	{
		1: "#grid1",
		2: "#grid2",
		3: "#grid3",
		4: "#grid4",
		5: "#grid5",
		6: "#grid6",
		7: "#grid7",
		8: "#grid8",
		9: "#grid9"
	}

	var loadGame = function(gameId)
	{
		$.get('/utt/game/' + gameId, function(data)
		{
			if(data)
			{
				if(data.to !== username && data.from !== username)
				{
					viewing = true;
				}
				else
				{
					viewing = false;
				}

				element.find('#playerTitle').empty();
				if(data.to === username)
				{
					element.find('#playerTitle').append(templates.players(
					{
						xPlayer: data.to,
						yPlayer: data.from
					}));
				}
				else
				{
					element.find('#playerTitle').append(templates.players(
					{
						xPlayer: data.from,
						yPlayer: data.to
					}));
				}

				if(previousListener)
				{
					socket.emit("unsubscribe", previousListener);
					socket.removeAllListeners("gameChatMessage");
					socket.removeAllListeners("gameUpdate");
				}
				gameData = data;
				socket.emit("subscribe", gameId);
				socket.on("gameChatMessage", incomingChatMessage);
				socket.on("gameUpdate", incomingData);
				previousListener = gameId;

				incomingData(data);
			}
		});

		$.get('/utt/gameChatLog/' + gameId, function(log)
		{
			clearChat();
			incomingChatMessage(log);
		});

		return element;
	};

	return loadGame;
}
