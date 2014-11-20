(function()
{
	var setup = function()
	{
		// List all the routes being used.
		return [
			'./login/routes.js',
			'./home/routes.js',
			'./utt/routes.js',
			'./search/routes.js',
			'./profile/routes.js'
		]
	}

	module.exports = setup;
}());