// Code for the profile view
var profileView = function(socket, username, templates, onLoadGame)
{
	var element = $(templates.profile());


	var loadProfile = function(username)
	{
		console.log(username)
		return element;
	};

	return loadProfile;
}