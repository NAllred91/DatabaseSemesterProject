(function()
{
	var setup = function(app, dbHelper, io)
	{
		app.use(express.static(__dirname + '/../../Client/forum'));
		app.use(express.static(__dirname + '/../../Client/forum/templates'));
	}

	module.exports = setup;

}());