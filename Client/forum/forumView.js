// Code for the forum view
var forumView = function(socket, username, templates, onLoadProfile, onLoadThread, onCreateThread)
{
	var element = $(templates.forum());

	$('body').on('click', '#createThread', function(event)
	{
		onCreateThread();
	});

	$('body').on('click', '#viewThread', function(event)
	{
		onLoadThread(event.currentTarget.value, $(event.currentTarget).data('title'));
	});

	var initializeForum = function()
	{
		element.find('#threadContainer').empty();

		$.get('/forum/getThreadViews', function(views)
		{
			console.log(views)
			$.get('/forum/getThreads', function(threads)
			{
				_.each(threads, function(thread)
				{
					var createdDate = new Date(thread.createdTime);
					var lastPostDate = new Date(thread.lastPostTime);
					var localCreatedDate = new Date(createdDate.getTime() - (createdDate.getTimezoneOffset() * 60000))
					var localLastPostDate = new Date(lastPostDate.getTime() - (lastPostDate.getTimezoneOffset() * 60000));

					var threadInfoElement = $(templates.threadInfo(
					{
						title: thread.title,
						originalPost: "Created by " + thread.originalPoster + " on " + moment(localCreatedDate).format("dddd, MMMM Do YYYY, h:mm a"),
						postCount: thread.posts,
						viewCount: thread.views,
						lastPost: thread.lastPoster + " posted on " + moment(localLastPostDate).format("dddd, MMMM Do YYYY, h:mm a"),
						threadId: thread.threadId
					}));

					if(views[thread.threadId] && new Date(views[thread.threadId]).getTime() > new Date(thread.lastPostTime).getTime() || thread.lastPoster === username)
					{
						threadInfoElement.find("#unreadPostsIndicator").append(templates.greenDot());
					}
					else
					{
						threadInfoElement.find("#unreadPostsIndicator").append(templates.redDot());
					}
					
					element.find('#threadContainer').append(threadInfoElement);
				});
			});
		});
	};

	var loadForum = function()
	{
		initializeForum();
		return element;
	};

	return loadForum;
}