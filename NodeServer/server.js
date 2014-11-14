(function()
{
	var _ = require('underscore');
	var express = require('express');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var session = require('express-session');
	var setup = require('./setup.js');
	var paths = setup();
	var dbHelperApp = require('./DatabaseInterface.js');
	// A map that will be used to link socket.id's to usernames.
	var idMap = {};

	var app = express();
	var server = app.listen(8001);
                                      
    app.use(bodyParser.urlencoded(
    {
    	extended: true
    }));
    app.use(bodyParser.json());                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	app.use(cookieParser());                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	app.use(session(
		{
			secret:'Mld*p*323m',
			saveUninitialized: true,
			resave: true
		})); 
	

	// Generate a connection to the mysql database
	var mySQL = require('mysql');
	var connection = mySQL.createConnection(
	{
		host:'localhost',
		user: 'root',
		password: '',
		database: 'database'
	});

	connection.connect();

	// Create an instance of the database helper.
	var dbHelper = new dbHelperApp(connection);	

	// Reset all users connection count to 0 since
	// no users have connected yet.  Any information
	// here is left over from last time the server ran.
	dbHelper.resetConnectionCounts(function(err)
	{
		if(err)
		{
			console.log("Database Error: connectionCount reset failed");
		}

	});


	var io = require('socket.io').listen(server);
	
	// Start up all of the routes!
	_.each(paths, function(route)
	{
		require(route)(app, dbHelper, io, idMap);
	});

	// Final app.all, redirects any requests that weren't 
	// consumed to the login page.
	app.all('*', function(req, res)
	{
		res.redirect('/login.html');
	});

}());