// Code for the forum view
var forumView = function(socket, username, templates, onLoadThread, onMakeThread)
{
	var element = $(templates.search());

	// $('body').on('click', '#searchSubmit', function(event)
	// {
	// 	var search = element.find('#searchArea').val();
	// 	if(search)
	// 	{
	// 		$.get('/search/' + search, function(res)
	// 		{
	// 			onLoadResults(res);
	// 		});
	// 	}	
	// });

	var loadForum = function()
	{
		return element;
	};

	return loadForum;
}