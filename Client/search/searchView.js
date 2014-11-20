// Code for the search view
var searchView = function(socket, username, templates, onLoadResults)
{
	var element = $(templates.search())
	console.log(templates.search())



	var loadSearch = function()
	{
		console.log("loadSearch")
		console.log(element)
		return element;
	};

	return loadSearch;
}