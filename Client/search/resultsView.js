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
		if(results.length > 0)
		{
			element.find('#resultsScrollArea').empty();
			_.each(results, function(result)
			{
				element.find('#resultsScrollArea').append(templates.result(
					{
						username: result.username
					}
				));
			});
		}
		return element;
	};

	return loadResults;
}