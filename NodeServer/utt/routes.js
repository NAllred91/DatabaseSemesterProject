(function()
{
	var express = require('express');
	var _ = require('underscore');
	var uuid = require('uuid-v4');
	var events = require('events');
	var em = new events.EventEmitter();
	var bot = 'Bot';

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
			socket.on('chatMessage', function(msg)
			{
				dbHelper.addChatRoomMessage(name, msg);

				io.emit('chatMessage', 
					{
						message: msg,
						user: name
					});
			});

			socket.on('requestGame', function(user)
			{
				dbHelper.addNewGame(name, user, newBoard(), function(gameId)
				{
					if(gameId)
					{
						var opponentId = idMap[user];
						if(io.sockets.connected[opponentId])
						{
							io.sockets.connected[opponentId].emit('gameRequested', name, gameId);
							socket.emit('gameWaiting', user, gameId);
						}
					}
				});	
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
							activePlayer: opponentName,
							lastMoveTime: now
						}

						if(io.sockets.connected[opponentId])
						{
							gameInfo.opponent = name;
							io.sockets.connected[opponentId].emit('gameStarted', gameInfo)
						}
						
						gameInfo.opponent = opponentName;
						socket.emit('gameStarted', gameInfo)
					}
				});	
			});

			socket.on('rejectGame', function(gameId)
			{
				dbHelper.rejectGame(name, gameId, function(opponentName)
				{
					if(opponentName)
					{
						var opponentId = idMap[opponentName];
						if(io.sockets.connected[opponentId])
						{
							io.sockets.connected[opponentId].emit('gameRemoved', gameId);
						}

						if(io.sockets.connected[idMap[name]])
						{
							io.sockets.connected[idMap[name]].emit('gameRemoved', gameId);
						}
					}	
				});		
			});

			socket.on('claimVictory', function(gameId)
			{
				// db.collection('games').findOne(
				// {
				// 	gameId: gameId
				// },
				// function(err, game)
				// {
				// 	if(err || !game)
				// 	{
				// 		return;
				// 	}

				// 	if(game.activePlayer !== name && (name === game.to || name === game.from))
				// 	{
				// 		if(new Date().getTime() - game.lastMoveTime > 86400000)
				// 		{
				// 			db.collection('games').update(
				// 			{
				// 				gameId: gameId
				// 			},
				// 			{
				// 				$set: {
				// 					wonBy: name,
				// 					activePlayer: null,
				// 					waitingPlayer: null,
				// 					state: "complete"
				// 				}
				dbHelper.updateGame(name, gameId, null, null, "complete", name, function(err, opponentName)
				{
					if(!err)
					{
						io.emit(gameId, {
							gameId: gameId,
							state: "complete",
							wonBy: name
						});

						var oponnentId = idMap[opponentName]
						if(io.sockets.connected[opponentName])
						{
							io.sockets.connected[opponentName].emit('gameRemoved', gameId);
						}

						if(io.sockets.connected[idMap[name]])
						{
							io.sockets.connected[idMap[name]].emit('gameRemoved', gameId);
						}
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
						var draw 
						if(!wonBy)
						{
							draw = bigDrawCheck(appliedMove.board);
						}
						else
						{
							draw = false;
						}
						
						var activePlayer;
						var waitingPlayer;
						var state = "complete";

						// If no one won, switch the players.
						if(!wonBy && !draw)
						{
							activePlayer = game.waitingPlayer;
							waitingPlayer = game.activePlayer;
							state = "active";
						}

						// db.collection('games').update(
						// {
						// 	gameId: gameId
						// },
						// {
						// 	$set: {
						// 		board: appliedMove.board,
						// 		playableGrid: appliedMove.playableGrid,
						// 		wonBy: wonBy,
						// 		activePlayer: activePlayer,
						// 		waitingPlayer: waitingPlayer,
						// 		state: state,
						// 		draw: draw
						// 	}
						// }, function(err)
						//dbHelper.updateGame(name, gameId, board, playableGrid, state, wonBy, function(err, opponentName)
						dbHelper.updateGame(null,0,0,0,0,0,function()
						{
							var err = 2
							if(err)
							{
								callback(err);
								return;
							}

							callback();

							var opponentId = idMap[opponentName];
							if(io.sockets.connected[opponentId])
							{
								io.sockets.connected[opponentId].emit('setTurn', activePlayer, gameId);
								io.sockets.connected[opponentId].emit(gameId, {
									activePlayer: activePlayer,
									board: appliedMove.board,
									date: game.date,
									from: game.from,
									gameId: gameId,
									playableGrid: appliedMove.playableGrid,
									state: state,
									to: game.to,
									waitingPlayer: waitingPlayer,
									lastMoveTime: new Date().getTime(),
									wonBy: wonBy,
									draw: draw
								});
							}

							if(io.sockets.connected[idMap[name]])
							{
								io.sockets.connected[idMap[name]].emit('setTurn', activePlayer, gameId);
							}
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
				return null;
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
				return null;
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