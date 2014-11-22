(function()
{
	var setup = function()
	{
		// List all the routes being used.
		return [
			'./login/routes.js',
			'./home/routes.js',
			'./utt/routes.js',
			'./uttBot/routes.js',
			'./search/routes.js',
			'./profile/routes.js',
			'./forum/routes.js'
		]
	}

	module.exports = setup;
}());