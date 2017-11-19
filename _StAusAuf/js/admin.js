/* Developer: Leo Brandenburg */
var UserData = null;
var ownUser = null;
var memberRolesArray = Array('Member', 'Moderator', 'Administrator');

$(document).ready(function()
{
	getOwnUser();
	getUserFromDB();
	$('#formPassword, #formPasswordConfirm')
		.keyup(function() {checkPasswordMatch('formPassword', 'formPasswordConfirm', false);})
		.blur(function() {checkPasswordMatch('formPassword', 'formPasswordConfirm', false);});
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
		$('#userTable')[0].innerHTML = strHtml;
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
			strHtml += '<td><button class="btn btn-default" onclick="editUser(' + UserData[rowId].Id + ');"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> Edit</button>';
		}
		else
		{
			strHtml += '<td><button class="btn btn-default disabled"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> Edit</button>';
		}
		for (var j = 0; j < 10; j++)
		{
			strHtml += '&nbsp;';
		}
		if (ownUser[0].Id != UserData[rowId].Id)
		{
			if (ownUser[0].MemberRole >= UserData[rowId].MemberRole)
			{
				strHtml += '<button class="btn btn-default" onclick="deleteUser(' + UserData[rowId].Id + ');"><span style="color:#FF0000;">✘</span> Delete</button></td>';
			}
			else
			{
				strHtml += '<button class="btn btn-default disabled"><span style="color:#FF0000;">✘</span> Delete</button></td>';
			}
		}
		else
		{
			strHtml += '<button class="btn btn-default disabled"><span style="color:#FF0000;">✘</span> Delete</button></td>';
		}
	strHtml += '</tr>';
	return strHtml;
}

// zeigt das Passwort, wenn man in das Feld klickt
function showPassword(Id)
{
	$('#' + Id)[0].type = 'text';
}

// verbirgt das Passwort, wenn man aus dem Feld rausklickt
function hidePassword(Id)
{
	$('#' + Id)[0].type = 'password';
}

// Reihe zum Bearbeiten
function buildEditRow(rowId)
{
	var strHtml = '';
	strHtml += '<tr id="' + UserData[rowId].Id + '_actionEdit" class="hide">';
		strHtml += '<td>' + UserData[rowId].Id + '</td>';
		strHtml += '<td><input id="userName_' + rowId +'" class="form-control" value="' + UserData[rowId].UserName + '" placeholder="Field must not be empty" /></td>';
		strHtml += '<td>' +
						'<div class="input-group">' +
							'<input type="password" id="password_' + rowId +'" placeholder="leave empty -> no change of PW" class="form-control" onfocus="showPassword(this.id);" onblur="hidePassword(this.id);" />' +
							'<span class="input-group-addon">' +
								'<a data-toggle="tooltip" data-placement="top" title="Leave this field empty to not change the password">' +
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
		strHtml += '<td><button class="btn btn-default" onclick="updateUser(' + UserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-ok" style="color:#5CB85C;"></span> Confirm</button>';
		for (var j = 0; j < 10; j++)
		{
			strHtml += '&nbsp;';
		}
		strHtml += '<button class="btn btn-default" onclick="resetUser(' + UserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-remove" style="color:#FF0000;"></span> Abort</button></td>';
	strHtml += '</tr>';
	return strHtml;
}

// zeigt Form für neuen User
function showFormNewUser()
{
	changeCss('divFormButtonNewUser', 'hide');
	changeCss('divFormNewUser', '');
	var ownMemberRole = ownUser[0].MemberRole;
	// var selectOptions = '<option value="-1"></option>';
	var selectOptions = '';
	for (var i = 0; i <= ownMemberRole; i++)
	{
		selectOptions += '<option value="' + i + '">' + giveMemberRoleName(i) + '</option>';
	}
	$('#selectMemberRole')[0].innerHTML = selectOptions;
	$('#formUserName').focus();
}

// verbirgt Form für neuen User
function hideFormNewUser()
{
	changeCss('divFormButtonNewUser', '');
	changeCss('divFormNewUser', 'hide');
	resetFormNewUser();
	return false;
}

// setzt Form zurück
function resetFormNewUser()
{
	changeCss('divFormPassword', 'form-group');
	changeCss('divFormPasswordConfirm', 'form-group');
	changeCss('formNewUser-divErrorPwNoMatch', 'alert alert-danger hide');
	changeCss('formNewUser-divErrorUserExists', 'alert alert-danger hide');
	document.getElementById('formNewUser').reset();
	$('#formUserName').focus();
	return false;
}

// überprüft Passwörter auf Übereinstimmung
function checkPasswordMatch(field1, field2, forced)
{
	forced = forced || false;
	var returnValue = false;
	var newPw = $('#' + field1)[0].value;
	var newPwConfirm = $('#' + field2)[0].value;
	if (newPw && newPw == newPwConfirm)
	{
		changeCss('divFormPassword', 'form-group has-success');
		changeCss('divFormPasswordConfirm', 'form-group has-success');
		changeCss('formNewUser-divErrorPwNoMatch', 'alert alert-danger hide');
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
			changeCss('divFormPassword', 'form-group has-error');
			changeCss('divFormPasswordConfirm', 'form-group has-error');
			changeCss('formNewUser-divErrorPwNoMatch', 'alert alert-danger');
		}
		else
		{
			changeCss('divFormPassword', 'form-group');
			changeCss('divFormPasswordConfirm', 'form-group');
			changeCss('formNewUser-divErrorPwNoMatch', 'alert alert-danger hide');
		}
	}
	changeCss('formNewUser-divErrorUserExists', 'alert alert-danger hide'); // erst PW-check, dann Rest
	return returnValue;
}

// creiert einen neuen User
function createNewUser()
{
	if (checkPasswordMatch('formPassword', 'formPasswordConfirm', true))
	{
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
				changeCss('formNewUser-divErrorUserExists', 'alert alert-danger');
			}
		}
		else
		{
			// DB nicht erreichbar
		}
	}
	return false;
}

// User bearbeiten
function editUser(Id)
{
	changeCss(Id + '_actionDefault', 'hide');
	changeCss(Id + '_actionEdit', '');
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
	$('#' + Id + '_actionDefault')[0].outerHTML = buildDefaultRow(rowId);
	$('#' + Id + '_actionEdit')[0].outerHTML = buildEditRow(rowId);
}

// löscht User
function deleteUser(Id)
{
	if (confirm('Are you sure you want to delete the user?'))
	{
		changeCss(Id + '_actionDefault', 'hide');
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