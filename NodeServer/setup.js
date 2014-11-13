(function()
{
	var setup = function()
	{
		// List all the routes being used.
		return [
			'./login/routes.js',
			'./home/routes.js',
			'./game/routes.js',
			'./forum/routes.js'
		]
	}

	module.exports = setup;
}());