// Code for the create thread view
var createThreadView = function(socket, username, templates, onLoadForum)
{
	var element = $(templates.createThread());

	

	element.find("#submitNewThread").on('click', function()
	{
		element.find('#titleError').empty();
		element.find('#bodyError').empty();
		element.find('#title').empty();
		element.find('#originalPost').empty();

		var title = element.find('#title').val();
		var body = element.find('#originalPost').val();
		var acceptable = true;

		if(title.length > 30)
		{
			element.find('#titleError').append("Error: Title is too long.");
			acceptable = false;
		}
		if(!title)
		{
			element.find('#titleError').append("Error: Give your thread a title.");
			acceptable = false;
		}
		if(body.length > 500)
		{
			element.find('#bodyError').append("Error: Too many characters.");
			acceptable = false;
		}
		if(!body)
		{
			element.find('#bodyError').append("Error: Must include an original post.");
			acceptable = false;
		}

		if(acceptable)
		{
			$.post('/forum/newThread',
			{
				title: title,
				body: body
			}, function()
			{
				onLoadForum();
			}).fail(function()
			{
				element.find('#bodyError').append("Error: Post to server failed, try again.");
			});
		}
	});

	var loadCreateThread = function()
	{
		element.find('#titleError').empty();
		element.find('#bodyError').empty();
		element.find('#title').val("");
		element.find('#originalPost').val("");
		
		return element;
	};

	return loadCreateThread;
}