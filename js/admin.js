/* Developer: Leo Brandenburg */
var ObjectOwnUser = null;
var ArrayUserData = null;
var ArrayMemberRoles = null;

$(document).ready(function()
{
	ArrayMemberRoles = ObjectLanguages.ArrayMemberRoles;
	getOwnUser();
	getUserFromDB();
	incrementViews('admin');
	fillViewTables();
})

// um alle Benutzer in der Tabelle darzustellen, werden alle Informationen (bis auf Passwörter) zu allen Benutzern abgefragt
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
		ArrayUserData = data;
	});
	$.ajaxSetup({async: true});
	buildHtmlForUserTable();
}

// erzeugt die komplette Tabelle, in der alle Benutzer zu sehen sind
function buildHtmlForUserTable()
{
	if (ArrayUserData.responseText != 'noDatabase')
	{
		var strHtml = '';
		for (var i = 0; i < ArrayUserData.length; i++)
		{
			strHtml += buildOneRow(i);
		}
		document.getElementById('UserTable').innerHTML = strHtml;
		changeLanguage();
	}
	else
	{
		// DB nicht erreichbar - überleg dir was
	}
}

// erzeugt eine Zeile in der Tabelle, in der jeweils ein Benutzer abgebildet wird
function buildOneRow(rowId)
{
	var strHtml = '';
	strHtml += buildDefaultRow(rowId);
	strHtml += buildEditRow(rowId);
	return strHtml;
}

// erzeugt Zeile zum Betrachten
function buildDefaultRow(rowId)
{
	var strHtml = '';
	strHtml += '<tr id="' + ArrayUserData[rowId].Id + '_actionDefault">';
		strHtml += '<td>' + ArrayUserData[rowId].Id + '</td>';
		strHtml += '<td>' + ArrayUserData[rowId].UserName + '</td>';
		strHtml += '<td>********</td>';
		strHtml += '<td>' + getMemberRoleName(ArrayUserData[rowId].MemberRole) + '</td>';
		strHtml += '<td>' + ArrayUserData[rowId].Email + '</td>';
		if (ObjectOwnUser.MemberRole >= ArrayUserData[rowId].MemberRole)
		{
			strHtml += '<td><button class="btn btn-default" onclick="editUser(' + ArrayUserData[rowId].Id + ');"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> <span id="Edit" class="trans-innerHTML">Edit</span></button>';
		}
		else
		{
			strHtml += '<td><button class="btn btn-default disabled"><span class="glyphicon glyphicon-pencil" style="color:#0000FF;"></span> <span id="Edit" class="trans-innerHTML">Edit</span></button>';
		}
		for (var j = 0; j < 10; j++)
		{
			strHtml += '&nbsp;';
		}
		if (ObjectOwnUser.Id != ArrayUserData[rowId].Id)
		{
			if (ObjectOwnUser.MemberRole >= ArrayUserData[rowId].MemberRole)
			{
				strHtml += '<button class="btn btn-default" onclick="deleteUser(' + ArrayUserData[rowId].Id + ');"><span style="color:#FF0000;">✘</span> <span id="Delete" class="trans-innerHTML">Delete</span></button></td>';
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

// erzeugt Zeile im Bearbeitungsmodus
function buildEditRow(rowId)
{
	var strHtml = '';
	strHtml += '<tr id="' + ArrayUserData[rowId].Id + '_actionEdit" class="hide">';
	strHtml += '<td>' + ArrayUserData[rowId].Id + '</td>';
	strHtml += '<td><input name="NotEmpty" id="UserName_' + rowId +'" class="form-control trans-name-placeholder" value="' + ArrayUserData[rowId].UserName + '" placeholder="Field must not be empty" required /></td>';
	strHtml += '<td>' +
					'<div class="input-group">' +
						'<input type="password" name="NoChangeInPw" id="Password_' + rowId +'" placeholder="leave empty -> no change of PW" class="form-control trans-name-placeholder" onfocus="showPassword(this.id);" onblur="hidePassword(this.id);" />' +
						'<span class="input-group-addon">' +
							'<a name="TitleLeaveEmpty" data-toggle="tooltip" data-placement="top" title="Leave this field empty to not change the password." class="trans-name-title">' +
								'<i class="glyphicon glyphicon-question-sign"></i>' +
							'</a>' +
						'</span>' +
					'</div>' +
				'</td>';
	if (ObjectOwnUser.Id != ArrayUserData[rowId].Id)
	{
		strHtml += '<td><select id="MemberRole_' + rowId +'" class="form-control">';
	}
	else
	{
		strHtml += '<td><select id="MemberRole_' + rowId +'" class="form-control" disabled>';
	}
	for (var j = 0; j < ArrayMemberRoles.length; j++)
	{
		if (ArrayUserData[rowId].MemberRole != j)
		{
			if (j <= ObjectOwnUser.MemberRole)
			{
				strHtml += '<option value="' + j + '">' + ArrayMemberRoles[j] + '</option>';
			}
			else
			{
				// strHtml += '<option value="' + j + '" disabled>' + ArrayMemberRoles[j] + '</option>';
				break;
			}
		}
		else
		{
			strHtml += '<option value="' + j + '" selected>' + ArrayMemberRoles[j] + '</option>';
		}
	}
	strHtml += '</select></td>';
	strHtml += '<td><input id="Email_' + rowId +'" class="form-control" value="' + ArrayUserData[rowId].Email + '" /></td>';
	strHtml += '<td><button class="btn btn-default" onclick="updateUser(' + ArrayUserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-ok" style="color:#5CB85C;"></span> <span id="Confirm" class="trans-innerHTML">Confirm</span></button>';
	for (var j = 0; j < 10; j++)
	{
		strHtml += '&nbsp;';
	}
	strHtml += '<button class="btn btn-default" onclick="resetUser(' + ArrayUserData[rowId].Id + ', ' + rowId + ');"><span class="glyphicon glyphicon-remove" style="color:#FF0000;"></span> <span id="Cancel" class="trans-innerHTML">Cancel</span></button></td>';
	strHtml += '</tr>';
	return strHtml;
}

// macht das Passwort sichtbar, wenn man in das Feld klickt
function showPassword(Id)
{
	document.getElementById(Id).type = 'text';
}

// verbirgt das Passwort, wenn man aus dem Feld rausklickt
function hidePassword(Id)
{
	document.getElementById(Id).type = 'password';
}

// macht das Formular für die Erstellung eines neuen Benutzers sichtbar
function showFormNewUser()
{
	$('#DivFormButtonNewUser').addClass('hide');
	$('#DivFormNewUser').removeClass('hide');
	var ownMemberRole = ObjectOwnUser.MemberRole;
	// var selectOptions = '<option value="-1"></option>';
	var selectOptions = '';
	for (var i = 0; i <= ownMemberRole; i++)
	{
		selectOptions += '<option value="' + i + '">' + getMemberRoleName(i) + '</option>';
	}
	document.getElementById('MemberRoleSelection').innerHTML = selectOptions;
	$('#FormUserName').focus();
	$('#FormPassword')[0].value = generateRandomPassword();
}

// verbirgt das Formular für die Erstellung eines neuen Benutzers
function hideFormNewUser()
{
	$('#DivFormButtonNewUser').removeClass('hide');
	$('#DivFormNewUser').addClass('hide');
	resetFormNewUser();
	return false;
}

// setzt das Formular für die Erstellung eines neuen Benutzers zurück
function resetFormNewUser()
{
	$('#DivFormPassword').removeClass('has-success has-error');
	$('#DivErrorPwNoMatch, #FormNewUserDivErrorUserExists').addClass('hide');
	document.getElementById('FormNewUser').reset();
	$('#FormUserName').focus();
	$('#FormPassword')[0].value = generateRandomPassword();
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

// kopiert das Password in die Zwischenablage
function copyPwToClipboard()
{
	showPassword('FormPassword');
	var textToCopy = $('#FormPassword');
	textToCopy.select();
	document.execCommand('copy');
	// hidePassword('FormPassword');
}

// legt einen neuen Benutzer in der Datenbank an
function createNewUser()
{
	// im BackEnd speichern
	var userName = document.FormNewUser.FormUserName.value;
	var password = document.FormNewUser.FormPassword.value;
	var memberRole = document.FormNewUser.MemberRoleSelection.value;
	var email = document.FormNewUser.FormEmail.value;
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
			$('#FormNewUserDivErrorUserExists').removeClass('hide');
		}
	}
	else
	{
		// DB nicht erreichbar
	}
	return false;
}

// wechselt in den Bearbeitungsmodus
function editUser(Id)
{
	$('#' + Id + '_actionDefault').addClass('hide');
	$('#' + Id + '_actionEdit').removeClass('hide');
}

// speichert Änderungen an einem Benutzer in der Datenbank
function updateUser(Id, rowId)
{
	// ArrayUserData updaten
	var userName = $('#UserName_' + rowId).val();
	var password = $('#Password_' + rowId).val();
	var memberRole = $('#MemberRole_' + rowId).val();
	var email = $('#Email_' + rowId).val();
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
					ArrayUserData[rowId].UserName = userName;
					ArrayUserData[rowId].MemberRole = memberRole;
					ArrayUserData[rowId].Email = email;
				}
				else if (data.responseText == 'kein Update vorgenommen')
				{
					// console.log(data.responseText);
				}
				else
				{
					// JS-Manipulation oder realTime-Problem (mehrere Personen gleichzeitig fuschen irgendwo rum -> Lsg: reload)
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
		$('#UserName_' + rowId).focus();
	}
}

// wechselt aus dem Bearbeitungsmodus in den Betrachtungsmodus (ArrayUserData) zurück - Achtung: ArrayUserData in saveUser müssen aktuell gehalten werden, weil updateUser auch auf resetUser aufbaut
function resetUser(Id, rowId)
{
	document.getElementById(Id + '_actionDefault').outerHTML = buildDefaultRow(rowId);
	document.getElementById(Id + '_actionEdit').outerHTML = buildEditRow(rowId);
	changeLanguage();
}

// löscht Benutzer aus der Datenbank
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

// gibt die Benutzerrolle anhand des Zahlenwertes in Klartext aus
function getMemberRoleName(memberRole)
{
	returnValue = 'Error';
	switch(memberRole)
	{
		case memberRole:
			returnValue = ArrayMemberRoles[memberRole];
			break;
		default:
			break;
	}
	return returnValue;
}

// befüllt die Besucher-Statistik-Tabelle
function fillViewTables()
{
	var arrayViews = getViews();
	var strHtml = '';
	for (var key in arrayViews[0])
	{
		strHtml +=
		'<tr>' +
			'<td><span id="Stats_' + arrayViews[0][key]['page'] + '" class="trans-innerHTML">' + arrayViews[0][key]['page'] + '</span></td>' +
			'<td>' + arrayViews[0][key]['views'] + '</td>' +
		'<tr>';
	}
	$('#StatsPage')[0].innerHTML = strHtml;
	var strHtml = '';
	for (var key in arrayViews[1])
	{
		strHtml +=
		'<tr style="cursor: pointer;" onclick="forwardToLink(\'Id\', ' + arrayViews[1][key]['Id'] + ');">' +
			'<td>' + arrayViews[1][key]['Id'] + '</td>' +
			'<td>' + arrayViews[1][key]['reportName'] + '</td>' +
			'<td>' + arrayViews[1][key]['views'] + '</td>' +
		'<tr>';
	}
	$('#StatsReports')[0].innerHTML = strHtml;
	changeLanguage();
}

// fragt aus der Datenbank alle Besucher-Statistiken ab
function getViews()
{
	var arrayViews = null;
	var data =
	{
		action: "getViews"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		arrayViews = data;
	});
	$.ajaxSetup({async: true});
	return arrayViews;
}

// leitet den User zu einem anderen Link weiter
function forwardToLink(link, id)
{
	window.location = './?' + link + '=' + id;
}