(function()
{
	var express = require('express');
	var _ = require('underscore');
	var uuid = require('uuid-v4');
	var events = require('events');
	var em = new events.EventEmitter();

	var setup = function(app, dbHelper, io, idMap)
	{
		app.use(express.static(__dirname + '/../../Client/utt'));
		app.use(express.static(__dirname + '/../../Client/utt/templates'));

		app.get('/utt/NonCompleteGames/:username', function(req, res)
		{
			dbHelper.getActiveAndPendingGames(req.params.username, function(games)
			{
				res.send(games);
			});
		});

		app.get('/utt/CompleteGames/:username', function(req, res)
		{
			dbHelper.getCompleteGames(req.params.username, function(games)
			{
				res.send(games);
			});
		});

		app.get('/utt/game/:id', function(req, res)
		{
			dbHelper.getGameData(req.params.id, function(game)
			{
				if(!game)
				{
					res.sendStatus(400);
				}
				else
				{
					res.send(game);
				}
			});
		});

		app.get('/utt/gameChatLog/:id', function(req, res)
		{
			dbHelper.getGameChatLog(req.params.id, function(log)
			{
				res.send(log);
			});
		});

		app.get('/utt/chatRoomLog', function(req, res)
		{
			dbHelper.getChatRoomLog(function(log)
			{
				res.send(log);
			});
		});

		io.on('connection', function(socket)
		{	

			// Try for 5 seconds to get access to the restricted sockets.
			// If a username doesn't appear in the idMap by then, disconnect
			// the socket.	
			var getAccess = function(count)
			{
				if(count > 5)
				{
					socket.disconnect();
					return;
				}

				var username = _.invert(idMap)[
					_.find(idMap, function(socketArray)
					{
						return _.contains(socketArray, socket.id);
					})
				];

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

			getAccess(0);	
		});

		// These can only be used once the user name for the socket
		// has been given.
		var restrictedSocket = function(socket, name)
		{
			socket.on('chatMessage', function(msg)
			{
				dbHelper.addChatRoomMessage(name, msg);

				io.emit('chatMessage', 
					{
						message: msg,
						user: name
					});
			});

			socket.on('gameChatMessage', function(msg)
			{
				dbHelper.addGameChatMessage(name, msg.gameId, msg.message);
				msg.sender = name;
				io.sockets.in(msg.gameId).emit("gameChatMessage", msg);
			});

			socket.on('requestGame', function(opponentName)
			{
				if(opponentName !== name)
				{
					dbHelper.addNewGame(name, opponentName, newBoard(), function(gameId)
					{
						if(gameId)
						{
							var myIds = idMap[name];
							_.each(myIds, function(myId)
							{
								if(io.sockets.connected[myId])
								{
									io.sockets.connected[myId].emit('gameWaiting', opponentName, gameId);
								}	
							});
							
							var opponentIds = idMap[opponentName];
							_.each(opponentIds, function(opponentId)
							{
								if(io.sockets.connected[opponentId])
								{
									io.sockets.connected[opponentId].emit('gameRequested', name, gameId);
								}
							});
						}
					});	
				}
			});

			socket.on('acceptGame', function(gameId)
			{
				dbHelper.acceptGame(name, gameId, function(opponentName, now)
				{
					if(opponentName)
					{
						var opponentId = idMap[opponentName];
						var gameInfo =
						{
							gameId: gameId,
							activePlayer: name,
							lastMoveTime: now
						}

						var myIds = idMap[name];
						gameInfo.opponent = opponentName;
						_.each(myIds, function(myId)
						{
							if(io.sockets.connected[myId])
							{
								io.sockets.connected[myId].emit('gameStarted', gameInfo);
							}	
						});
						
						var opponentIds = idMap[opponentName];
						gameInfo.opponent = name;
						_.each(opponentIds, function(opponentId)
						{
							if(io.sockets.connected[opponentId])
							{
								io.sockets.connected[opponentId].emit('gameStarted', gameInfo);
							}
						});
					}
				});	
			});

			socket.on('rejectGame', function(gameId)
			{
				dbHelper.rejectGame(name, gameId, function(opponentName)
				{
					if(opponentName)
					{
						var myIds = idMap[name];
						_.each(myIds, function(myId)
						{
							if(io.sockets.connected[myId])
							{
								io.sockets.connected[myId].emit('gameRemoved', gameId);
							}	
						});
						
						var opponentIds = idMap[opponentName];
						_.each(opponentIds, function(opponentId)
						{
							if(io.sockets.connected[opponentId])
							{
								io.sockets.connected[opponentId].emit('gameRemoved', gameId);
							}
						});
					}	
				});		
			});

			socket.on('claimVictory', function(gameId)
			{
				var now = new Date();
				dbHelper.getGameData(gameId, function(game)
				{
					if(!game)
					{
						return;
					}

					if(game.activePlayer !== name && (name === game.to || name === game.from) && (now.getTime() + (now.getTimezoneOffset() * 60000)) - new Date(game.lastMoveTime).getTime() > 10000)
				 	{
				 		var opponentName;
				 		if(game.to === name)
						{
							opponentName = game.from;
						}
						else
						{
							opponentName = game.to;
						}

						dbHelper.addUserWin(name);
						dbHelper.addUserLose(opponentName);

						dbHelper.updateGame(gameId, game.board, 0, null, "complete", name, function(err)
						{
							console.log("updated")
							if(!err)
							{
								io.sockets.in(gameId).emit("gameUpdate", 
								{
									type: "gameUpdate",
									activePlayer: null,
							 		board: game.board,
									startTime: game.startTime,
									from: game.from,
									gameId: gameId,
									playableGrid: 0,
									state: "complete",
									to: game.to,
									lastMoveTime: now,
									wonBy: name,
							});

							var myIds = idMap[name];
							_.each(myIds, function(myId)
							{
								if(io.sockets.connected[myId])
								{
									console.log("meEmit")
									io.sockets.connected[myId].emit('gameRemoved', gameId);
								
							 	}	
							});

							var opponentIds = idMap[opponentName];
							_.each(opponentIds, function(opponentId)
							{
								if(io.sockets.connected[opponentId])
								{
									console.log("emit")
									io.sockets.connected[opponentId].emit('gameRemoved', gameId);
								}
							});
							}
						});
					}
				});
			});

			socket.on('updateGame', function(gameId, big, mini, callback)
			{
				dbHelper.getGameData(gameId, function(game)
				{
					if(!game)
					{
						callback(new Error("Game Not Found"));
						return;
					}

					// If it wasn't this players turn
					if(game.activePlayer !== name)
					{
						callback(new Error("Not Your Turn"));
						return;
					}

					// If the game was completed
					if(game.state === "complete")
					{
						callback(new Error("Game Is Complete"));
						return;
					}

					if(validateMove(game.board, big, mini, name, game.playableGrid))
					{
						var appliedMove = applyMove(game.board, big, mini, name);
						var wonBy = bigVictoryCheck(appliedMove.board);
						var draw;
						if(!wonBy)
						{
							draw = bigDrawCheck(appliedMove.board);
						}
						else
						{
							draw = false;
						}
						
						var activePlayer;
						var opponentName;
						var state = "complete";
						var now = new Date().getTime()

						// If no one won, switch the players.
						if(!wonBy && !draw)
						{
							if(game.activePlayer === game.to)
							{
								activePlayer = game.from;
							}
							else if(game.activePlayer === game.from)
							{
								activePlayer = game.to;
							}
							else
							{
								callback(new Error("Bad Data..."));
							}
							state = "active";
						}

						if(game.to === name)
						{
							opponentName = game.from;
						}
						else if(game.from === name)
						{
							opponentName = game.to;
						}

						if(draw)
						{
							dbHelper.addUserDraw(name);
							dbHelper.addUserDraw(opponentName);
						}

						if(wonBy)
						{
							if(wonBy === opponentName)
							{
								dbHelper.addUserLose(name);
								dbHelper.addUserWin(opponentName);
							}
							else
							{
								dbHelper.addUserLose(opponentName);
								dbHelper.addUserWin(name);
							}
						}

						dbHelper.updateGame(gameId, appliedMove.board, appliedMove.playableGrid, activePlayer, state, wonBy, function(err, now)
						{
							if(err)
							{
								callback(err);
								return;
							}

							callback();
							io.sockets.in(gameId).emit("gameUpdate", 
								{
									type: "gameUpdate",
									activePlayer: activePlayer,
							 		board: appliedMove.board,
									date: game.date,
									from: game.from,
									gameId: gameId,
									playableGrid: appliedMove.playableGrid,
									state: state,
									to: game.to,
									lastMoveTime: now,
									wonBy: wonBy,
							});
							var myIds = idMap[name];
							_.each(myIds, function(myId)
							{
								if(io.sockets.connected[myId])
								{
									io.sockets.connected[myId].emit('setTurn', activePlayer, gameId);
								
							 	}	
							});
							
							var opponentIds = idMap[opponentName];
							_.each(opponentIds, function(opponentId)
							{
								if(io.sockets.connected[opponentId])
								{
									io.sockets.connected[opponentId].emit('setTurn', activePlayer, gameId);
								}
							});
						});
					}
					else
					{
						// If the move didn't pass validation.
						callback(new Error('Bad Move'));
					}
				});
			});
		}
	}


	// Functions used to process the game.

	var validateMove = function(board, big, mini, user, playableGrid)
		{
			// If the move wasn't in the playable grid
			if(playableGrid && big != playableGrid)
			{
				return false;
			}

			// If a move has already been made there.
			if(board[big].moves[mini])
			{
				return false;
			}

			return true;
		}

	var applyMove = function(board, big, mini, user)
	{
		board[big].moves[mini] = user;
		board[big].wonBy = littleVictoryCheck(board[big].moves);
		if(!board[big].wonBy)
		{
			board[big].draw = littleDrawCheck(board[big].moves);
		}
		else
		{
			board[big].draw = false;
		}
		
		var appliedMove = 
		{
			board: board,
			playableGrid: getPlayableGrid(board, mini)
		}

		return appliedMove;
	}

	var getPlayableGrid = function(board, grid)
	{
		if(board[grid].wonBy)
		{
			return 0;
		}

		if(
			board[grid].moves[1]
			&& board[grid].moves[2]
			&& board[grid].moves[3]
			&& board[grid].moves[4] 
			&& board[grid].moves[5] 
			&& board[grid].moves[6] 
			&& board[grid].moves[7]
			&& board[grid].moves[8]
			&& board[grid].moves[9])
		{
			return 0;
		}

		return grid;
	}

	var littleVictoryCheck = function(board)
	{
		if(board[1] && board[1] === board[2] && board[2] === board[3])
		{
			return board[1];
		}

		if(board[4] && board[4] === board[5] && board[5] === board[6])
		{
			return board[4];
		}

		if(board[7] && board[7] === board[8] && board[8] === board[9])
		{
			return board[7];
		}

		if(board[1] && board[1] === board[4] && board[4] === board[7])
		{
			return board[1];
		}

		if(board[2] && board[2] === board[5] && board[5] === board[8])
		{
			return board[2];
		}

		if(board[3] && board[3] === board[6] && board[6] === board[9])
		{
			return board[3];
		}

		if(board[1] && board[1] === board[5] && board[5] === board[9])
		{
			return board[1];
		}

		if(board[3] && board[3] === board[5] && board[5] === board[7])
		{
			return board[3];
		}

		return null;
	}

	var bigVictoryCheck = function(board)
	{
		if(board[1].wonBy && board[1].wonBy === board[2].wonBy && board[2].wonBy === board[3].wonBy)
		{
			return board[1].wonBy;
		}

		if(board[4].wonBy && board[4].wonBy === board[5].wonBy && board[5].wonBy === board[6].wonBy)
		{
			return board[4].wonBy;
		}

		if(board[7].wonBy && board[7].wonBy === board[8].wonBy && board[8].wonBy === board[9].wonBy)
		{
			return board[7].wonBy;
		}

		if(board[1].wonBy && board[1].wonBy === board[4].wonBy && board[4].wonBy === board[7].wonBy)
		{
			return board[1].wonBy;
		}

		if(board[2].wonBy && board[2].wonBy === board[5].wonBy && board[5].wonBy === board[8].wonBy)
		{
			return board[2].wonBy;
		}

		if(board[3].wonBy && board[3].wonBy === board[6].wonBy && board[6].wonBy === board[9].wonBy)
		{
			return board[3].wonBy;
		}

		if(board[1].wonBy && board[1].wonBy === board[5].wonBy && board[5].wonBy === board[9].wonBy)
		{
			return board[1].wonBy;
		}

		if(board[3].wonBy && board[3].wonBy === board[5].wonBy && board[5].wonBy === board[7].wonBy)
		{
			return board[3].wonBy;
		}

		return null;
	}

	var littleDrawCheck = function(board)
	{
		var isBoardFull = !_.contains(board, null);
		return isBoardFull;
	}

	var bigDrawCheck = function(board)
	{
		var availableMove = _.find(board, function(grid)
		{
			if(grid.wonBy || grid.draw)
			{
				return false;
			}
			return true;
		})

		if(availableMove)
		{
			return false;
		}
		return true;
	}

	var newBoard = function()
	{
		var board = {
			1:
			{
				moves: {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			2:
			{
				moves: {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			3:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			4:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			5:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			6:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			7:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			8:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			},
			9:
			{
				moves:  {
					1: null, 
					2: null, 
					3: null, 
					4: null, 
					5: null, 
					6: null, 
					7: null, 
					8: null, 
					9: null
				},
				wonBy: null
			}
		}

		return board;
	}
	

	module.exports = setup;
}())