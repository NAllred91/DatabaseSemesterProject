// Code for the forum view
var forumView = function(socket, username, templates, onLoadProfile, onLoadThread, onCreateThread)
{
	var element = $(templates.forum());

	$('body').on('click', '#createThread', function(event)
	{
		onCreateThread();
	});

	var initializeForum = function()
	{
		element.find('#threadContainer').empty();

		$.get('/forum/getThreads', function(threads)
		{
			console.log(threads)
			_.each(threads, function(thread)
			{
				element.find('#threadContainer').append(templates.threadInfo(
					{
						title: "1",
						originalPost: "2",
						postCount: "3",
						viewCount: "4",
						lastPost: "5"
					}));
			});
		})
	};

	var loadForum = function()
	{
		initializeForum();
		return element;
	};

	return loadForum;
}