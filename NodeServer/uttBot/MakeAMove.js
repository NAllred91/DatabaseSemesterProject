(function()
{
	var _ = require('underscore');

	var MakeAMove = function(x, o, degree, board, playable)
	{
		var viableMoves = getViableMoves(board, playable);
		
		_.each(viableMoves, function(viableMove)
		{
			viableMove.rating = evaluateMove(x, o, board, viableMove);
		});

		return _.max(viableMoves, function(move)
			{
				return move.rating;
			});
	}

	var getViableMoves = function(board, playable)
	{
		var moves = [];

		// Function used to get the moves available 
		// given the playable grid.
		var checkBoard = function(board, playable)
		{
			// Check each space on the playable grid.
			_.each(board[playable].moves, function(move, index)
			{
				// If a move hasn't been made there,
				// add it to the list of moves.
				if(!move)
				{
					moves.push(
					{
						big: playable,
						mini: index
					});
				}
			});
		}

		// If there is a designated board.
		if(playable)
		{
			checkBoard(board, playable);
		}
		// Otherwise evaluate the entire board.
		else
		{
			_.each(board, function(littleBoard, index)
			{
				if(littleBoard.wonBy)
				{
					return;
				}

				checkBoard(board, index);

			});
		}

		return moves;
	}

	// Gives a rating for the given move taken by x.
	// Looks at the result of this move and the opponents
	// following move.
	var evaluateOpponentsMoves = function(x, o, board, playableGrid)
	{

		var moves = getViableMoves(board, playableGrid);
		var canWinGrid = false;
		var canWinGame = false;

		_.each(moves, function(move)
		{
			var appliedMove = applyMove(board, move.big, move.mini, x);

			if(appliedMove.board[move.big].wonBy === x)
			{
				canWinGrid = true;
			}

			removeMove(board, move.big, move.mini);
		});

		if(canWinGrid)
		{
			return 1;
		}
		else
		{
			return .5;
		}
		// 1 should indicate you will win the game, 0 should indicate you will lose the game.

		// all spaces start with .5 rating. maybe the center gets a higher number

		// if you will win the board, add 1 (and take averag.)

		// if you will give the opponent a win, add 0
	}

	// Gives a rating for the given move taken by x.
	// Looks at the result of this move on this board
	// and does a check to see if that move yields victory.
	var evaluateMove = function(x, o, board, move)
	{
		var appliedMove = applyMove(board, move.big, move.mini, x);
		var opponentsMoveRating = evaluateOpponentsMoves(o, x, appliedMove.board, appliedMove.playableGrid);
		var cumulativeScore = .5;
		var totalDataPoints = 1;
		
		// 1 if you win the game.
		if(bigVictoryCheck(appliedMove.board) === x)
		{
			//console.log(JSON.stringify(appliedMove.board))
			//console.log("BigVic")
			return 1;
		}
		// 0 if you give the opponent the win.
		if(opponentsMoveRating === 1)
		{
			return 0;
		}
		// 1 if you win the board.
		if(appliedMove.board[move.big].wonBy === x)
		{
			//console.log("littleVic")
			cumulativeScore = cumulativeScore + 1;
			totalDataPoints = totalDataPoints + 1;
		}

		removeMove(board, move.big, move.mini);

		return (cumulativeScore / totalDataPoints) * (1 - opponentsMoveRating);
		
		// .75 if you block the opponent.
		// .7 if you get the very center.
		// .5 if not interesting.
		// .3 if this is the center, but not the very center.
	}

	// Checks for a victory on a little board.
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

	// Checks for victory on the whole board.
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

		if(board[3].wonBy && board[3].wonBy === board[4].wonBy && board[4].wonBy === board[9].wonBy)
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

	// Applies a move to a board.
	var applyMove = function(board, big, mini, user)
		{
			board[big].moves[mini] = user;
			board[big].wonBy = littleVictoryCheck(board[big].moves);
			var appliedMove = 
			{
				board: board,
				playableGrid: getPlayableGrid(board, mini)
			}

			return appliedMove;
		}

	var removeMove = function(board, big, mini)
	{
		board[big].moves[mini] = null;
		board[big].wonBy = null;
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

	module.exports = MakeAMove;
}())