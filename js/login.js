/* Developer: Leo Brandenburg */

$(document).ready(function() {
	getGetParas();
	initializeForm();
});

// initialisiert das Formular (richtige Weiterleitungsseite)
function initializeForm()
{
	if ($_GET().createReport)
	{
		document.FormLogin.action = './?createReport';
		document.FormLogin.onsubmit =
		function()
		{
			return login('loginCreateReport');
		}
		$('#LoginHeaderEdit').addClass("hide");
		$('#LoginHeaderAdmin').addClass("hide");
		incrementViews('loginCreateReport');
	}
	else if ($_GET().edit)
	{
		document.FormLogin.action = '.';
		document.FormLogin.onsubmit =
		function()
		{
			return login('loginEdit');
		}
		$('#LoginHeaderCreate').addClass("hide");
		$('#LoginHeaderAdmin').addClass("hide");
		incrementViews('loginEdit');
	}
	else if ($_GET().admin)
	{
		document.FormLogin.action = './?admin';
		document.FormLogin.onsubmit =
		function()
		{
			return login('loginAdmin');
		}
		$('#LoginHeaderCreate').addClass("hide");
		$('#LoginHeaderEdit').addClass("hide");
		incrementViews('loginAdmin');
	}
}

// übermittelt Login-Daten an Datenbank; anhand des Rückgabewertes wird bei Erfolg die Weiterleitung eingeleitet oder bei Misserfolg eine aussagekräftige Fehlermeldung ausgegeben
function login(loginSite)
{
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
			$('#FormLoginDivErrorPw, #ErrorDb, #FormLoginDivErrorPermission').addClass('hide');
			incrementViews(loginSite + 'Success');
			returnValue = true;
		}
		else if (data.responseText == 'Member permission')
		{
			$('#FormLoginDivErrorPw, #ErrorDb').addClass('hide');
			if (loginSite == 'loginAdmin')
			{
				$('#FormLoginDivErrorPermission').removeClass('hide');
				incrementViews(loginSite + 'Fail');
			}
			else
			{
				incrementViews(loginSite + 'Success');
				returnValue = true;
			}
		}
		else if (data.responseText == 'Login fehlgeschlagen')
		{
			$('#FormLoginDivErrorPw').removeClass('hide');
			$('#ErrorDb').addClass('hide');
			if (loginSite == 'loginAdmin')
			{
				$('#FormLoginDivErrorPermission').addClass('hide');
			}
			incrementViews(loginSite + 'Fail');
			document.getElementById('Password').focus();
		}
		else if (data.responseText == 'noDatabase')
		{
			$('#FormLoginDivErrorPw').addClass('hide');
			$('#ErrorDb').removeClass('hide');
			if (loginSite == 'loginAdmin')
			{
				$('#FormLoginDivErrorPermission').addClass('hide');
			}
			document.getElementById('Password').focus();
		}
	});
	$.ajaxSetup({async: true}); // muss wieder aufgehoben werden
	return returnValue;
}