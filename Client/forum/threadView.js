// Code for the thread view
var threadView = function(socket, username, templates, onLoadForum)
{
	var element = $(templates.threadContainer());

	

	

	var loadThread = function(threadId)
	{
		console.log(threadId)

		$.get('/forum/threadPosts/' + threadId, function(posts)
		{
			
		})
		
		return element;
	};

	return loadThread;
}