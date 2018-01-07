/* Developer: Leo Brandenburg */
var UserData = null;
var ownUser = null;
var memberRolesArray = null;

$(document).ready(function()
{
	// $('[data-toggle="tooltip"]').tooltip(); // tooltip for help-flag
	memberRolesArray = objectLanguages.ArrayMemberRoles;
	getOwnUser();
	getUserFromDB();
	/*$('#formPassword, #formPasswordConfirm')
		.keyup(function() {checkPasswordMatch('formPassword', 'formPasswordConfirm', false);})
		.blur(function() {checkPasswordMatch('formPassword', 'formPasswordConfirm', false);});*/
})

// gibt die eigene Id mit UserName zurück
function getOwnUser()
{
	$.ajaxSetup({async: false});
	var data =
	{
		action: "getOwnUser"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		ownUser = data;
	});
	$.ajaxSetup({async: true});
}

// holtUserDaten aus der DB
function getUserFromDB()
{
	var data =
	{
		action: "getUserData"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		UserData = data;
	});
	$.ajaxSetup({async: true});
	buildHtmlForUserTable();
}

// erzeugt die komplette Tabelle
function buildHtmlForUserTable()
{
	if (UserData.responseText != 'noDatabase')
	{
		var strHtml = '';
		for (var i = 0; i < UserData.length; i++)
		{
			strHtml += buildOneRow(i);
		}
		document.getElementById('userTable').innerHTML = strHtml;
		changeLanguage();
	}
	else
	{
		// DB nicht erreichbar - überleg dir was
	}
}

// erzeugt eine Rolle
function buildOneRow(rowId)
{
	var strHtml = '';
	strHtml += buildDefaultRow(rowId);
	strHtml += buildEditRow(rowId);
	return strHtml;
}

// Reihe zum Editieren
function buildDefaultRow(rowId)
{
	var strHtml = '';
	strHtml += '<tr id="' + UserData[rowId].Id + '_actionDefault">';
		strHtml += '<td>' + UserData[rowId].Id + '</td>';
		strHtml += '<td>' + UserData[rowId].UserName + '</td>';
		strHtml += '<td>********</td>';
		strHtml += '<td>' + giveMemberRoleName(UserData[rowId].MemberRole) + '</td>';
		strHtml += '<td>' + UserData[rowId].Email + '</td>';
		if (ownUser[0].MemberRole >= UserData[rowId].MemberRole)
		{
			strHtml += '<td><button class="btn btn-default" onclick="editUser(' + UserData[rowId].Id + ');"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> <span id="Edit" class="trans-innerHTML">Edit</span></button>';
		}
		else
		{
			strHtml += '<td><button class="btn btn-default disabled"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> <span id="Edit" class="trans-innerHTML">Edit</span></button>';
		}
		for (var j = 0; j < 10; j++)
		{
			strHtml += '&nbsp;';
		}
		if (ownUser[0].Id != UserData[rowId].Id)
		{
			if (ownUser[0].MemberRole >= UserData[rowId].MemberRole)
			{
				strHtml += '<button class="btn btn-default" onclick="deleteUser(' + UserData[rowId].Id + ');"><span style="color:#FF0000;">✘</span> <span id="Delete" class="trans-innerHTML">Delete</span></button></td>';
			}
			else
			{
				strHtml += '<button class="btn btn-default disabled"><span style="color:#FF0000;">✘</span> <span id="Delete" class="trans-innerHTML">Delete</span></button></td>';
			}
		}
		else
		{
			strHtml += '<button class="btn btn-default disabled"><span style="color:#FF0000;">✘</span> <span id="Delete" class="trans-innerHTML">Delete</span></button></td>';
		}
	strHtml += '</tr>';
	return strHtml;
}

// zeigt das Passwort, wenn man in das Feld klickt
function showPassword(Id)
{
	document.getElementById(Id).type = 'text';
}

// verbirgt das Passwort, wenn man aus dem Feld rausklickt
function hidePassword(Id)
{
	document.getElementById(Id).type = 'password';
}

// Reihe zum Bearbeiten
function buildEditRow(rowId)
{
	var strHtml = '';
	strHtml += '<tr id="' + UserData[rowId].Id + '_actionEdit" class="hide">';
	strHtml += '<td>' + UserData[rowId].Id + '</td>';
	strHtml += '<td><input name="NotEmpty" id="userName_' + rowId +'" class="form-control trans-name-placeholder" value="' + UserData[rowId].UserName + '" placeholder="Field must not be empty" required /></td>';
	strHtml += '<td>' +
					'<div class="input-group">' +
						'<input type="password" name="NoChangeInPw" id="password_' + rowId +'" placeholder="leave empty -> no change of PW" class="form-control trans-name-placeholder" onfocus="showPassword(this.id);" onblur="hidePassword(this.id);" />' +
						'<span class="input-group-addon">' +
							'<a name="TitleLeaveEmpty" data-toggle="tooltip" data-placement="top" title="Leave this field empty to not change the password." class="trans-name-title">' +
								'<i class="glyphicon glyphicon-question-sign"></i>' +
							'</a>' +
						'</span>' +
					'</div>' +
				'</td>';
	if (ownUser[0].Id != UserData[rowId].Id)
	{
		strHtml += '<td><select id="memberRole_' + rowId +'" class="form-control">';
	}
	else
	{
		strHtml += '<td><select id="memberRole_' + rowId +'" class="form-control" disabled>';
	}
	/* var currentLanguageIndex = document.getElementById('language').selectedIndex;
	var memberRolesArray = objectLanguages.ArrayMemberRoles[currentLanguageIndex]; */
	for (var j = 0; j < memberRolesArray.length; j++)
	{
		if (UserData[rowId].MemberRole != j)
		{
			if (j <= ownUser[0].MemberRole)
			{
				strHtml += '<option value="' + j + '">' + memberRolesArray[j] + '</option>';
			}
			else
			{
				// strHtml += '<option value="' + j + '" disabled>' + memberRolesArray[j] + '</option>';
				break;
			}
		}
		else
		{
			strHtml += '<option value="' + j + '" selected>' + memberRolesArray[j] + '</option>';
		}
	}
	strHtml += '</select></td>';
	strHtml += '<td><input id="email_' + rowId +'" class="form-control" value="' + UserData[rowId].Email + '" /></td>';
	strHtml += '<td><button class="btn btn-default" onclick="updateUser(' + UserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-ok" style="color:#5CB85C;"></span> <span id="Confirm" class="trans-innerHTML">Confirm</span></button>';
	for (var j = 0; j < 10; j++)
	{
		strHtml += '&nbsp;';
	}
	strHtml += '<button class="btn btn-default" onclick="resetUser(' + UserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-remove" style="color:#FF0000;"></span> <span id="Cancel" class="trans-innerHTML">Cancel</span></button></td>';
	strHtml += '</tr>';
	return strHtml;
}

// zeigt Form für neuen User
function showFormNewUser()
{
	$('#divFormButtonNewUser').addClass('hide');
	$('#divFormNewUser').removeClass('hide');
	var ownMemberRole = ownUser[0].MemberRole;
	// var selectOptions = '<option value="-1"></option>';
	var selectOptions = '';
	for (var i = 0; i <= ownMemberRole; i++)
	{
		selectOptions += '<option value="' + i + '">' + giveMemberRoleName(i) + '</option>';
	}
	document.getElementById('selectMemberRole').innerHTML = selectOptions;
	$('#formUserName').focus();
	$('#formPassword')[0].value = generateRandomPassword();
}

// verbirgt Form für neuen User
function hideFormNewUser()
{
	$('#divFormButtonNewUser').removeClass('hide');
	$('#divFormNewUser').addClass('hide');
	resetFormNewUser();
	return false;
}

// setzt Form zurück
function resetFormNewUser()
{
	$('#divFormPassword, #divFormPasswordConfirm').removeClass('has-success has-error');
	$('#DivErrorPwNoMatch, #formNewUser-divErrorUserExists').addClass('hide');
	document.getElementById('formNewUser').reset();
	$('#formUserName').focus();
	$('#formPassword')[0].value = generateRandomPassword();
	return false;
}

// generiert ein zufälliges Passwort
function generateRandomPassword()
{
	var data =
	{
		action: "generateRandomPassword"
	}
	var password = null;
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		password = data.responseText;
	});
	$.ajaxSetup({async: true});
	return password;
}

// kopiert das Password in den Arbeitsspeicher
function copyPwToClipboard()
{
	showPassword('formPassword');
	var textToCopy = $('#formPassword');
	textToCopy.select();
	document.execCommand('copy');
	hidePassword('formPassword');
}

// überprüft Passwörter auf Übereinstimmung
/* function checkPasswordMatch(field1, field2, forced)
{
	forced = forced || false;
	var returnValue = false;
	var newPw = document.getElementById(field1).value;
	var newPwConfirm = document.getElementById(field2).value;
	if (newPw && newPw == newPwConfirm)
	{
		$('#divFormPassword, #divFormPasswordConfirm').addClass('has-success').removeClass('has-error');
		$('#DivErrorPwNoMatch').addClass('hide');
		returnValue = true;
	}
	else if (!newPw && !newPwConfirm)
	{
		// do nothing - form is empty (onload)
		// resetFormNewUser();
	}
	else
	{
		forced = forced || false;
		if (forced == true)
		{
			$('#divFormPassword, #divFormPasswordConfirm').addClass('has-error').removeClass('has-success');
			$('#DivErrorPwNoMatch').removeClass('hide');
		}
		else
		{
			$('#divFormPassword, #divFormPasswordConfirm').removeClass('has-success has-error');
			$('#DivErrorPwNoMatch').addClass('hide');
		}
	}
	$('#formNewUser-divErrorUserExists').addClass('hide'); // erst PW-check, dann Rest
	return returnValue;
}*/

// kreiert einen neuen User
function createNewUser()
{
	/* if (checkPasswordMatch('formPassword', 'formPasswordConfirm', true))
	{ */
		// im BackEnd speichern
		var userName = document.formNewUser.formUserName.value;
		var password = document.formNewUser.formPassword.value;
		var memberRole = document.formNewUser.selectMemberRole.value;
		var email = document.formNewUser.formEmail.value;
		var data =
		{
			action: "createUser",
			userName: userName,
			password: password,
			memberRole: memberRole,
			email: email
		}
		var requestData = null;
		$.ajaxSetup({async: false});
		$.post('php/manageBackend.php', data)
		.always(function(data)
		{
			requestData = data;
		});
		$.ajaxSetup({async: true});
		if (requestData != 'noDatabase')
		{
			if (requestData[0] != 0 && requestData[1] == 'User erfolgreich angelegt')
			{
				hideFormNewUser();
				getUserFromDB();
			}
			else
			{
				$('#formNewUser-divErrorUserExists').removeClass('hide');
			}
		}
		else
		{
			// DB nicht erreichbar
		}
	/* } */
	return false;
}

// User bearbeiten
function editUser(Id)
{
	$('#' + Id + '_actionDefault').addClass('hide');
	$('#' + Id + '_actionEdit').removeClass('hide');
}

// User speichern
function updateUser(Id, rowId)
{
	// UserData updaten
	var userName = $('#userName_' + rowId).val();
	var password = $('#password_' + rowId).val();
	var memberRole = $('#memberRole_' + rowId).val();
	var email = $('#email_' + rowId).val();
	// in BackEnd speichern
	if (userName)
	{
		var data =
		{
			action: "updateUser",
			userIdToUpdate: Id,
			userName: userName,
			password: password,
			memberRole: memberRole,
			email: email
		}
		$.ajaxSetup({async: false});
		$.post('php/manageBackend.php', data)
		.always(function(data)
		{
			if (data.responseText != 'noDatabase')
			{
				if (data.responseText == 'UserUpdate erfolgreich')
				{
					UserData[rowId].UserName = userName;
					UserData[rowId].MemberRole = memberRole;
					UserData[rowId].Email = email;
					// console.log(data.responseText);
				}
				else if (data.responseText == 'kein Update vorgenommen')
				{
					// console.log(data.responseText);
				}
				else
				{
					// JS-Manipulation oder realTime-Problem (mehrere Personen gleichzeitig fuschen irgendwo rum -> Lsg: reload?)
				}
			}
			else
			{
				// DB nicht erreichbar
			}
		});
		$.ajaxSetup({async: true});
		resetUser(Id, rowId);
		getOwnUser();
	}
	else
	{
		$('#userName_' + rowId).focus();
	}
}

// setzt User auf Ursprungszustand (UserData) zurück - Achtung: UserData in saveUser müssen aktuell gehalten werden, weil updateUser auch auf resetUser aufbaut
function resetUser(Id, rowId)
{
	document.getElementById(Id + '_actionDefault').outerHTML = buildDefaultRow(rowId);
	document.getElementById(Id + '_actionEdit').outerHTML = buildEditRow(rowId);
	changeLanguage();
}

// löscht User
function deleteUser(Id)
{
	if (confirm('Are you sure you want to delete the user?'))
	{
		$('#' + Id + '_actionDefault').addClass('hide');
		var data =
		{
			action: "deleteUser",
			userIdToDelete: Id
		}
		$.ajaxSetup({async: false});
		$.post('php/manageBackend.php', data);
		$.ajaxSetup({async: true});
	}
}

// gibt die MemberRolle in Klartext aus
function giveMemberRoleName(memberRole)
{
	/* var currentLanguageIndex = document.getElementById('language').selectedIndex;
	var memberRolesArray = objectLanguages.ArrayMemberRoles[currentLanguageIndex]; */
	returnValue = 'Error';
	switch(memberRole)
	{
		case memberRole:
			returnValue = memberRolesArray[memberRole];
			break;
		default:
			break;
	}
	return returnValue;
}