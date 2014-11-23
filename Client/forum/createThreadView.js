// Code for the create thread view
var createThreadView = function(socket, username, templates, onLoadForum)
{
	var element = $(templates.createThread());

	

	element.find("#submitNewThread").on('click', function()
	{
		console.log('cli')
		onLoadForum();
	});

	var loadCreateThread = function()
	{
		
		return element;
	};

	return loadCreateThread;
}