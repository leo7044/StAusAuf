/* Developer: Leo Brandenburg */

$(document).ready(function() {
	getGetParas();
	initializeForm();
	$('#formLogin-divError').hide();
});

// initialisiert das Formular (richtige ZielPage)
function initializeForm()
{
	if ($_GET().createReport)
	{
		document.formLogin.action = './?createReport';
		document.formLogin.onsubmit =
		function()
		{
			return login();
		}
		$('#LoginHeaderAdmin').addClass("hide");
	}
	else if ($_GET().admin)
	{
		document.formLogin.action = './?admin';
		document.formLogin.onsubmit =
		function()
		{
			return login(true);
		}
		$('#LoginHeader').addClass("hide");
	}
}

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
			$('#formLogin-divErrorPw').addClass('hide');
			$('#ErrorDb').addClass('hide');
			$('#formLogin-divErrorPermission').addClass('hide');
			returnValue = true;
		}
		else if (data.responseText == 'Member permission')
		{
			$('#formLogin-divErrorPw').addClass('hide');
			$('#ErrorDb').addClass('hide');
			if (isAdminLogin)
			{
				$('#formLogin-divErrorPermission').removeClass('hide');
			}
			else
			{
				returnValue = true;
			}
		}
		else if (data.responseText == 'Login fehlgeschlagen')
		{
			$('#formLogin-divErrorPw').removeClass('hide');
			$('#ErrorDb').addClass('hide');
			if (isAdminLogin)
			{
				$('#formLogin-divErrorPermission').addClass('hide');
			}
			$('#Password')[0].focus();
		}
		else if (data.responseText == 'noDatabase')
		{
			$('#formLogin-divErrorPw').addClass('hide');
			$('#ErrorDb').removeClass('hide');
			if (isAdminLogin)
			{
				$('#formLogin-divErrorPermission').addClass('hide');
			}
			$('#Password')[0].focus();
		}
	});
	$.ajaxSetup({async: true}); // muss wieder aufgehoben werden
	return returnValue;
}