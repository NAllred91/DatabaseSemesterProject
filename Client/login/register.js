(function()
{
	$(document).ready(function()
	{
		$("#register").submit(function(event)
		{
			event.preventDefault();

			var pass = $("#password").val();
			var passtwo = $("#passwordAgain").val();

			if($("#username").val().length < 3)
			{
				$("#error").empty();
				$("#error").append("Username is too short!");
				return;
			}
			if(!pass)
			{
				$("#error").empty();
				$("#error").append("You need a password!");
				return;
			}

			if(pass.length > 4)
			{
				$("#error").empty();
				$("#error").append("Your password is too long!");
				return;

			}
			
			if(pass === passtwo && pass)
			{
				$.post("/register", $("#register").serialize(), function(res)
				{
					window.location.href = "/home";
				})
				.fail(function()
				{
					$("#error").empty();
					$("#error").append("Username is already taken!")
				});
			}
			else
			{
				$("#error").empty();
				$("#error").append("Passwords don't match!")
			}
		});
		$("#signin").on("click", function()
		{
			window.location.href = "/login.html";
		});
	})

}())