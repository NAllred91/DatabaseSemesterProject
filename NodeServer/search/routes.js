(function()
{
	var express = require('express');
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/search'));
		app.use(express.static(__dirname + '/../../Client/search/templates'));
	}

	module.exports = setup;

}());
