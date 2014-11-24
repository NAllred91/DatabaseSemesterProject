// Code for the thread view
var threadView = function(socket, username, templates, onLoadForum, onLoadThread)
{
	var element = $(templates.threadContainer());
	var thisThreadId;
	var thisThreadTitle;

	$('body').on('click', '#postReply', function(event)
	{
		showReplyPosting();
	});

	$('body').on('click', '#cancelReply', function(event)
	{
		hideReplyPosting();
	});

	$('body').on('click', '#submitReply', function(event)
	{
		var post = element.find('#replyText').val();
		$.post('/forum/newPost',
		{
			threadId: thisThreadId,
			post: post
		}, function()
		{
			onLoadThread(thisThreadId, thisThreadTitle);
		})
		.fail(function()
		{
			console.log("faileded/....")
		});
	});
	
	var hideReplyPosting = function()
	{
		element.find("#cancelReply").hide();
		element.find("#replyText").hide();
		element.find("#submitReply").hide();
		element.find("#postReply").show();
	}

	var showReplyPosting = function()
	{
		element.find("#cancelReply").show();
		element.find("#replyText").show();
		element.find("#submitReply").show();
		element.find("#postReply").hide();
	}

	var initializeThread = function(threadId, title)
	{
		element.empty();

		element.append(templates.thread(
		{
			title: title
		}));

		hideReplyPosting();

		$.get('/forum/threadPosts/' + threadId, function(posts)
		{
			console.log(posts)
			_.each(posts, function(post)
			{

				var postDate = new Date(post.postTime);
				var localPostDate = new Date(postDate.getTime() - (postDate.getTimezoneOffset() * 60000))
				console.log(post.postTime)
				console.log(postDate, localPostDate)
				console.log("append")
				element.find("#postsContainer").append(templates.post(
					{
						header: "Posted by " + post.poster + " on " + moment(localPostDate).format("dddd, MMMM Do YYYY, h:mm a"),
						message: post.post
					}));
			});
		});
	}

	var loadThread = function(threadId, title)
	{
		thisThreadId = threadId;
		thisThreadTitle = title;
		initializeThread(threadId, title);	
		return element;
	};

	return loadThread;
}