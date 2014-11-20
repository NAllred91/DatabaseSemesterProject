// Code for the search view
var searchView = function(socket, username, templates, onLoadResults)
{
	var element = $(templates.search());

	$('body').on('click', '#searchSubmit', function(event)
	{
		var search = element.find('#searchArea').val();
		if(search)
		{
			$.get('/search/' + search, function(res)
			{
				onLoadResults(res);
			});
		}	
	});


	var loadSearch = function()
	{
		return element;
	};

	return loadSearch;
}