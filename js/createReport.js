/* Developer: Leo Brandenburg */
// globale Variablen
var originalOwnEmail = '';
var ArrayCountryData = null;
// var sortedCountryData = null;
var currentSelectedLanguage = '';
// var msDropDownCountries = '';
var affectedIdWhenUpload = '';

// zum Laden der Seite ausführen
$(document).ready(function(){
	$('#DivReportName, #DivNickName, #DivDate, #DivHighlight, #DivAttention, #DivLecture, #DivInternship').removeClass('has-success has-error');
	initializeFileInput();
	getOwnEmail();
	$('#ModalNewPw, #ModalNewPwConfirm').keyup(checkPasswordMatch).blur(checkPasswordMatch);
	getCountryData();
	$('#DropDownListCountries').change(changeCountry);
	incrementViews('createReport');
});

// holt Country-Data aus einer API
function getCountryData()
{
	$.ajaxSetup({async: false});
	// $.get('https://restcountries.eu/rest/v2/all') // for less traffic but more dependency
	$.post('js/countryApi.json') // in case extern API goes offline
	.always(function(data)
	{
		ArrayCountryData = data;
	});
	$.ajaxSetup({async: true});
	createDropDownListCountries();
}

// setzt E-Mail ins Modal ein, falls vorhanden und in DB hinterlegt
function getOwnEmail()
{
	var data =
	{
		action: "getOwnEmail"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText != 'no Email' && data.responseText != 'no Database')
		{
			originalOwnEmail = data.responseText;
			document.getElementById('ModalEmail').value = data.responseText;
		}
	});
	$.ajaxSetup({async: true});
}

// initialisiert die beiden Input-Felder für das hochladen von Bildern
function initializeFileInput()
{
	$("#FileInputUploadTitle").fileinput({ // FileUploadTitle
        showUpload: false,
		allowedFileTypes: ["image"],
		// allowedFileTypes: ["jpg", "png", "gif"],
        // maxFileSize: 1024,
		// maxFilePreviewSize: 1024,
		overwriteInitial: true,
		removeClass: "btn btn-danger",
		browseLabel: "<span id='ChooseTitle' class='trans-innerHTML'>Choose title-picture...</span>",
        overwriteInitial: true
    });
	$("#FileInputUploadGallery").fileinput({ // FileUploadGallery
		showUpload: false,
		previewFileType: "image",
		allowedFileTypes: ["image"],
		// allowedFileTypes: ["jpg", "png", "gif"],
		browseClass: "btn btn-success",
        browseLabel: "<span id='PickImages' class='trans-innerHTML'>Pick Images...</span>",
        browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
		removeClass: "btn btn-danger",
        // maxFileSize: 1024,
		// maxFilePreviewSize: 1024,
		maxFileCount: 20,
        overwriteInitial: true
    });
}

// DatePicker
$(function() {
	$('input[name="DateRange"]').daterangepicker({
	"autoUpdateInput": false,
	"format": 'DD.MM.YYYY',
    "opens": "right", /* right means: it opens from left to right */
    "buttonClasses": "btn",
    "cancelClass": "btn-danger"
	}, function() {
		$('#DivDate').addClass('has-success').removeClass('has-error');
		$('input[name="DateRange"]').on('apply.daterangepicker', function(ev, picker) {
			$(this).val(picker.startDate.format('DD.MM.YYYY') + ' - ' + picker.endDate.format('DD.MM.YYYY'));
		});
	});
});

// checks transmitted formular-values
// it is necessary for DatePicker because Date-Picker is readonly - the rest is for colors
function checkInputFormCreateReport()
{
	var NickName = document.formCreateReport.NickName.value;
	if (NickName == "")
	{
		$('#DivNickName').addClass('has-error').removeClass('has-success');
		document.formCreateReport.NickName.focus();
		return false;
	}
	var Country = document.formCreateReport.DropDownListCountries.value;
	if (Country == "")
	{
		$('#DivCountry').addClass('has-error').removeClass('has-success');
		document.formCreateReport.DropDownListCountries.focus();
		return false;
	}
	var city = document.formCreateReport.City.value;
	if (city == "")
	{
		$('#DivCity').addClass('has-error').removeClass('has-success');
		document.formCreateReport.City.focus();
		return false;
	}
	var dateRange = document.formCreateReport.DateRange.value;
	if (dateRange == "")
	{
		$('#DivDate').addClass('has-error').removeClass('has-success');
		document.formCreateReport.DateRange.focus();
		return false;
	}
	var highlight = document.formCreateReport.Highlight.value;
	if (highlight == "")
	{
		$('#DivHighlight').addClass('has-error').removeClass('has-success');
		document.formCreateReport.Highlight.focus();
		return false;
	}
	var attention = document.formCreateReport.Attention.value;
	if (attention == "")
	{
		$('#DivAttention').addClass('has-error').removeClass('has-success');
		document.formCreateReport.Attention.focus();
		return false;
	}
	var frameTextreport = window.frames[0].document.body.innerHTML;
	if (frameTextreport.length <= 11)
	{
		$('#ModalTextareaTextreport').modal('show');
		window.frames[0].document.body.focus();
		return false;
	}
	$('#ButtonSubmitForm').attr('disabled', true);
	var success = saveFormReportInDb(NickName, Country, city, dateRange, highlight, attention, frameTextreport);
	if (success == 'ReportSpeicherung erfolgreich')
	{
		uploadFilesTitle(affectedIdWhenUpload);
		uploadFilesGallery(affectedIdWhenUpload);
		document.formCreateReport.action = './?Id=' + affectedIdWhenUpload + '&success=true';
		return true;
	}
	else
	{
		return false;
	}
}

// speichert das Formular in der Datenbank
function saveFormReportInDb(NickName, Country, city, dateRange, highlight, attention, frameTextreport)
{
	var returnValue = 'ReportSpeicherung fehlgeschlagen';
	var ReportName = document.formCreateReport.ReportName.value;
	var Lecture = document.formCreateReport.Lecture.value;
	var Internship = document.formCreateReport.Internship.value;
	var numPicsTitle = document.formCreateReport.FileInputUploadTitle.files.length;
	var numPicsGallery = document.formCreateReport.FileInputUploadGallery.files.length;
	var data =
	{
		'action': "saveFormReport",
		'reportName': ReportName,
		'nickName': NickName,
		'country': Country,
		'city': city,
		'dateRange': dateRange,
		'highlight': highlight,
		'attention': attention,
		'lecture': Lecture,
		'internship': Internship,
		'commentBox': frameTextreport
	};
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText != 'noDatabase')
		{
			if (data[1] == 'ReportSpeicherung erfolgreich')
			{
				affectedIdWhenUpload = data[0];
				returnValue = 'ReportSpeicherung erfolgreich';
			}
			else
			{
				returnValue = 'ReportSpeicherung fehlgeschlagen';
			}
		}
		else
		{
			returnValue = 'no Database';
		}
	});
	$.ajaxSetup({async: true});
	return returnValue;
}

// lädt Title-Bild mittels AJAX hoch
function uploadFilesTitle(id)
{
	var returnValue = false;
	var form_data = new FormData();
	for (var i = 0; i < $('#FileInputUploadTitle').prop('files').length; i++)
	{
		var file_data = $('#FileInputUploadTitle').prop('files')[i];
		form_data.append('fileTitle' + i, file_data);
	}
	form_data.append('id', id);
	form_data.append('action', 'fileAjaxUploadTitle');
	$.ajaxSetup({async: false});
	$.ajax({
		url: './php/manageBackend.php', // point to server-side PHP script
		dataType: 'text',  // what to expect back from the PHP script (in case)
		cache: false,
		contentType: false,
		processData: false,
		data: form_data,
		type: 'post',
		success: function(data)
		{
			returnValue = true;
		}
	});
	$.ajaxSetup({async: true});
	return returnValue;
}

// lädt Gallery mittels AJAX hoch
function uploadFilesGallery(id)
{
	var returnValue = false;
	var form_data = new FormData();
	for (var i = 0; i < $('#FileInputUploadGallery').prop('files').length; i++)
	{
		var file_data = $('#FileInputUploadGallery').prop('files')[i];
		form_data.append('fileGallery' + i, file_data);
	}
	form_data.append('id', id);
	form_data.append('action', 'fileAjaxUploadGallery');
	$.ajaxSetup({async: false});
	$.ajax({
		url: './php/manageBackend.php', // point to server-side PHP script
		dataType: 'text',  // what to expect back from the PHP script (in case)
		cache: false,
		contentType: false,
		processData: false,
		data: form_data,
		type: 'post',
		success: function(data)
		{
			returnValue = true;
		}
	});
	$.ajaxSetup({async: true});
	return returnValue;
}

// ändert die css-Klasse eines Inputs, falls erforderlich
function checkInputAndChangeClassOfDiv(para_input, para_div, para_required)
{
	var input_field = document.getElementById(para_input).value;
	if (input_field == "" && para_required == true)
	{
		$('#' + para_div).addClass('has-error').removeClass('has-success');
		return false;
	}
	else
	{
		$('#' + para_div).addClass('has-success').removeClass('has-error');
	}
}

// land in dropDownList geändert
function changeCountry()
{
	var input_field = $('#DropDownListCountries').val();
	$('#DropDownListCountries option[value=""]').remove();
	if ($('#DivCity').hasClass('hide'))
	{
		$('#DivCity').addClass('has-error').removeClass('hide has-success');
	}
	document.formCreateReport.City.focus();
	var data =
	{
		action: "getCityList",
		iso2: input_field
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText != 'noDatabase')
		{
			var dataLength = data.length;
			$('#DataListCity').empty();
			for (var i = 0; i < dataLength; i++)
			{
				$('#DataListCity').append('<option value="' + data[i].city_ascii + '"/>');
			}
		}
	});
	$.ajaxSetup({async: true});
}

//input-field ist nicht leer
function inputNotEmpty(para_input, para_div)
{
	var input_field = document.getElementById(para_input).value;
	if (input_field == "")
	{
		$('#' + para_div).addClass('has-error').removeClass('has-success');
	}
	else
	{
		$('#' + para_div).removeClass('has-success has-error');
	}
}

// nach Hinweis, Textarea auszufüllen
function focusTextareaTextreport()
{
	window.frames[0].document.body.focus();
}

// verändert die css-Klasse von Country
function changeCountryClass()
{
	if (document.formCreateReport.Country.value != "")
	{
		$('#DivCountry').addClass('has-success').removeClass('has-error');
		document.getElementById('countries_msdd').style.borderColor = "#3c763d";
		document.formCreateReport.City.focus();
	}
	else
	{
		$('#DivCountry').addClass('has-error').removeClass('has-success');
		document.getElementById('countries_msdd').style.borderColor = "#a94442";
	}
}

// BB-Codes
$(function() {
	$("textarea").sceditor({
		plugins: "bbcode",
		width: '100%',
		style: "sceditor/minified/themes/default.min.css",
		emoticonsRoot: "sceditor/" // IMPORTANT: To include the emoticons you have to change the "emoticonsRoot" to "sceditor/" --> reason: the folder "sceditor" was created by hand and not automatically --> reason: a better overview in folder-structure
	});
});

// MyApp, Controller, RealTime-Änderung der Klassen
myApp = angular.module('MyApp', ['ngMessages', 'daterangepicker'])
myApp.controller('angModCreateReport', function($scope) {
	$scope.ownReset = function(form)
	{
		form.$setUntouched();
		form.$setPristine();
		$('#FormModalProfileDivSuccess, #FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #ModalClose, #div-changePw').addClass('hide');
		$('#ModalCancel, #ModalSave, #ModalButtonEditPw').removeClass('hide');
		$('#ModalDivOldPw, #ModalDivNewPw, #ModalDivNewPwConfirm').removeClass('has-success has-error');
		document.getElementById('FormModalProfile').reset();
		document.getElementById('ModalEmail').value = originalOwnEmail;
	};
});

//Eingaben ModalProfile überprüfgen
function checkInputFormModalProfile()
{
	var emailAddress = document.getElementById('ModalEmail').value;
	if ($('#div-changePw').hasClass(''))
	{
		if (checkPasswordMatch(true))
		{
			var oldPw = document.getElementById('ModalOldPw').value;
			var newPw = document.getElementById('ModalNewPw').value;
			var data =
			{
				action: "updateProfile",
				oldPw: oldPw,
				newPw: newPw,
				email: emailAddress
			}
			$.ajaxSetup({async: false});
			$.post('php/manageBackend.php', data)
			.always(function(data)
			{
				if (data.responseText == 'Profil Aktualisierung erfolgreich')
				{
					originalOwnEmail = emailAddress;
					$('#FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #ModalButtonEditPw, #ModalButtonEditPwCancel, #ModalCancel, #ModalSave').addClass('hide');
					$('#FormModalProfileDivSuccess, #ModalClose').removeClass('hide');
					$('#ModalDivOldPw').addClass('has-success').removeClass('has-error');
				}
				else if (data.responseText == 'Altes Passwort falsch')
				{
					$('#ErrorDb').addClass('hide');
					$('#FormModalProfileDivErrorWrongPw').removeClass('hide');
					$('#ModalDivOldPw').addClass('has-error').removeClass('has-success');
				}
				else if (data.responseText == 'Profil Aktualisierung fehlgeschlagen') // tritt auf, wenn das Passwort auf das selbige geändert wurde
				{
					$('#FormModalProfileDivErrorWrongPw, #ErrorDb').addClass('hide');
					$('#FormModalProfileDivErrorUpdate').removeClass('hide');
				}
				else
				{
					$('#FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw').addClass('hide');
					$('#ErrorDb').removeClass('hide');
				}
			});
			$.ajaxSetup({async: true});
		}
		else
		{
			$('#FormModalProfileDivSuccess, #FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw, #ErrorDb').addClass('hide');
		}
	}
	else
	{
		var data =
		{
			action: "updateEmail",
			email: emailAddress
		}
		$.ajaxSetup({async: false});
		$.post('php/manageBackend.php', data)
		.always(function(data)
		{
			if (data.responseText == 'Email Aktualisierung erfolgreich')
			{
				originalOwnEmail = emailAddress;
				$('#FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #ModalButtonEditPw, #ModalButtonEditPwCancel, #ModalCancel, #ModalSave').addClass('hide');
				$('#FormModalProfileDivSuccess, #ModalClose').removeClass('hide');
			}
			else if (data.responseText == 'Email Aktualisierung fehlgeschlagen') // tritt praktisch nie auf
			{
				$('#FormModalProfileDivErrorWrongPw, #ErrorDb').addClass('hide');
				$('#FormModalProfileDivErrorUpdate').removeClass('hide');
			}
			else
			{
				$('#FormModalProfileDivErrorUpdate, #FormModalProfileDivErrorWrongPw').addClass('hide');
				$('#ErrorDb').removeClass('hide');
			}
		});
		$.ajaxSetup({async: true});
	}
	return false;
}

// onclick auf change Password
function buttonChangePassword()
{
	$('#ModalButtonEditPw').addClass('hide');
	$('#ModalButtonEditPwCancel, #div-changePw').removeClass('hide');
	$('#ModalOldPw').focus();
}

// onclick auf cancel change Password
function buttonChangePasswordCancel()
{
	$('#ModalButtonEditPwCancel, #FormModalProfileDivErrorWrongPw, #div-changePw').addClass('hide');
	$('#ModalButtonEditPw').removeClass('hide');
}

// überprüft, ob die neuen Passwörter gleich sind
function checkPasswordMatch(forced)
{
	var returnValue = false;
	var newPw = document.getElementById('ModalNewPw').value;
	var newPwConfirm = document.getElementById('ModalNewPwConfirm').value;
	if (newPw && newPw == newPwConfirm)
	{
		$('#DivErrorPwNoMatch').addClass('hide');
		$('#ModalDivNewPw, #ModalDivNewPwConfirm').addClass('has-success').removeClass('has-error');
		returnValue = true;
	}
	else if (!newPw && !newPwConfirm)
	{
		$('#DivErrorPwNoMatch').addClass('hide');
		$('#ModalDivNewPw, #ModalDivNewPwConfirm').addClass('has-error').removeClass('has-success');
	}
	else
	{
		forced = forced || false;
		if (forced == true)
		{
			$('#DivErrorPwNoMatch').removeClass('hide');
			$('#ModalDivNewPw, #ModalDivNewPwConfirm').addClass('has-error').removeClass('has-success');
		}
		else
		{
			// $('#DivErrorPwNoMatch').addClass('hide'); // Grund: wegen der Enter-Taste würde die Fehlermeldung sofort wieder verschwinden
			$('#ModalDivNewPw, #ModalDivNewPwConfirm').removeClass('has-success has-error');
		}
	}
	return returnValue;
}

// =============================================
// für Übersetzungen
// =============================================

// wird beim Öffnen des Profil-Modals ausgeführt
function modifyModalProfile()
{
	prepareLanguageSelection(true);
}