// Code for the search view
var resultsView = function(socket, username, templates, onLoadProfile)
{
	var element = $(templates.results())

	$('body').on('click', '.viewProfile', function(event)
	{
		onLoadProfile(event.currentTarget.value);
	});


	var loadResults = function(results)
	{
		element.find('#resultsScrollArea').empty();
		if(results.length > 0)
		{
			_.each(results, function(result)
			{
				element.find('#resultsScrollArea').append(templates.result(
					{
						username: result.username
					}
				));
			});
		}
		else
		{
			element.find('#resultsScrollArea').append(templates.noResults());
		}
		return element;
	};

	return loadResults;
}