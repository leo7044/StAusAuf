/* Developer: Leo Brandenburg */

//Login
function login(isAdminLogin)
{
	isAdminLogin = isAdminLogin || false;
	var returnValue = false;
	var UserName = document.getElementById('UserName').value;
	var Password = document.getElementById('Password').value;
	var data =
	{
		action: "login",
		UserName: UserName,
		Password: Password
	}
	$.ajaxSetup({async: false}); // notwendig, damit auf die Antwort von $.post gewartet wird
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText == 'Login erfolgreich')
		{
			changeCss('formLogin-divErrorPw', 'alert alert-danger hide');
			changeCss('formLogin-divErrorDb', 'alert alert-danger hide');
			returnValue = true;
		}
		else if (data.responseText == 'Member permission')
		{
			changeCss('formLogin-divErrorPw', 'alert alert-danger hide');
			changeCss('formLogin-divErrorDb', 'alert alert-danger hide');
			if (isAdminLogin)
			{
				changeCss('formLogin-divErrorPermission', 'alert alert-danger');
			}
			else
			{
				returnValue = true;
			}
		}
		else if (data.responseText == 'Login fehlgeschlagen')
		{
			changeCss('formLogin-divErrorPw', 'alert alert-danger');
			changeCss('formLogin-divErrorDb', 'alert alert-danger hide');
			if (isAdminLogin)
			{
				changeCss('formLogin-divErrorPermission', 'alert alert-danger hide');
			}
			$('#Password')[0].focus();
		}
		else if (data.responseText == 'noDatabase')
		{
			changeCss('formLogin-divErrorPw', 'alert alert-danger hide');
			changeCss('formLogin-divErrorDb', 'alert alert-danger');
			if (isAdminLogin)
			{
				changeCss('formLogin-divErrorPermission', 'alert alert-danger hide');
			}
			$('#Password')[0].focus();
		}
	});
	$.ajaxSetup({async: true}); // muss wieder aufgehoben werden
	return returnValue;
}