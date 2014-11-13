(function()
{
	$(document).ready(function()
	{
		$("#login").submit(function(event)
		{
			event.preventDefault();
			$.post("/login", $("#login").serialize(), function(res)
			{
				window.location.href = "/home.html";
			})
			.fail(function()
			{
				$("#error").empty();
				$("#error").append("Invalid Username or Password!");;
			})
		});
		$("#register").on("click", function()
		{
			window.location.href = "/register.html";
		});
	})
}())