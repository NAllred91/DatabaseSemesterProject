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

	$('body').on('keyup', '#searchArea', function(event)
	{
		if(event.which === 13)
		{
			$('#searchSubmit').trigger('click');
		}
	});


	var loadSearch = function()
	{
		element.find('#searchArea').val("");
		return element;
	};

	return loadSearch;
}