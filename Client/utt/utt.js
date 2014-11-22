// Code for the GameRoom view
var uttView = function(onReady, username, socket)
{
	var templates = {};
	var element;
	var username;
	var loadGame;

	var scripts = [
		'gameView.js',
		'chatRoomView.js'
	]

	var html = [
		'utt.html',
		'game.html',
		'chatRoom.html',
		'activeGame.html',
		'pendingGame.html',
		'waitingGame.html',
		'chatMessage.html',
		'userDropDown.html',
		'onlineUser.html',
		'xImage.html',
		'oImage.html',
		'players.html'
	]

	var css = [
		'utt.css'
	]

	var length = scripts.length + html.length + css.length;

	// Wait for all of the server requests that need to be made.
	var ready = _.after(length, function()
	{		
		loadGame = uttGameLogic(socket, username, templates, onLoadChat);
		chatRoom = uttChatRoom(socket, username, templates, onLoadGame);
		element = $(templates.utt());
		element.append(chatRoom());
		onReady();
	});

	// Called when a game is to be loaded into the view.
	var onLoadGame = function(gameId)
	{
		element.empty()
		element.append(loadGame(gameId))
	}

	// Called when the chat screen is to be loaded into the view.
	var onLoadChat = function()
	{
		element.empty()
		element.append(chatRoom())
	}

	// Retrieve all the required scripts
	_.each(scripts, function(script)
	{
		$.getScript(script, function()
		{
			ready();
		});
	});

	// Retrieve all the required templates
	_.each(html, function(template)
	{
		var name = template.split(".")[0];

		$.get(template, function(data)
		{
			templates[name] = _.template(data);
			ready();
		});
	});

	// Retrieve all the required css
	_.each(css, function(style)
	{
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', style));
		ready();
	});


	var layout = function(gameId)
	{
		if(gameId)
		{
			onLoadGame(gameId);
		}
		else
		{
			onLoadChat();
		}
		return element;
	};

	return{
		layout: layout
	}
}


