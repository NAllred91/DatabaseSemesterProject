(function()
{
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/profile'));
		app.use(express.static(__dirname + '/../../Client/profile/templates'));
	}

	module.exports = setup;

}());