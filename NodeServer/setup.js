(function()
{
	var setup = function()
	{
		// List all the routes being used.
		return [
			'./login/routes.js',
			'./main/routes.js',
			'./game/routes.js',
			'./forum/routes.js'
		]
	}

	module.exports = setup;
}());