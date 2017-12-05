/* Developer: Leo Brandenburg */
// globale Variablen
var originalOwnEmail = '';
var countryData = null;
// var sortedCountryData = null;
var currentSelectedCountry = '';
var currentSelectedLanguage = '';
// var msDropDownCountries = '';
var affectedIdWhenUpload = '';

// zum Laden der Seite ausführen
$(document).ready(function(){
	// $('[data-toggle="tooltip"]').tooltip(); // tooltip for help-flag
	// msDropDownCountries = $("#dropDownListCountries").msDropdown().data("dd"); // Country-Flags
	// $(document).tooltip({delay: {show: null}});
	$('#div-ReportName, #div-NickName, #div-Date, #div-Highlight, #div-Attention, #div-Lecture, #div-Internship').removeClass('has-success has-error');
	$("#FileInputUploadAvatar").fileinput({ // FileUploadAvatar
        showUpload: false, // Zeile 674 in "fileinput.js" bearbeitet, showUpload auf false gesetzt; Zeile 3.797 in "fileinput.js" bearbeitet, um "Remove"-Button rot einzufärben
		// uploadUrl: 'img_public',
		allowedFileTypes: ["image"],
		// allowedFileTypes: ['jpg', 'png', 'gif'],
        // maxFileSize: 1024,
		// maxFilePreviewSize: 1024,
		overwriteInitial: true,
		removeClass: "btn btn-danger",
		browseLabel: "<span id='ChooseAvatar' class='trans-innerHTML'>Choose Avatar...</span>"
		// defaultPreviewContent: '<img src="img/default_avatar_male.jpg" alt="Your Avatar" style="width:160px"><h6 class="text-muted">Drag & drop an avatar-picture here</h6>'
    });
	$("#FileInputUploadGallery").fileinput({ // FileUploadGallery
		showUpload: false,
		previewFileType: "image",
		allowedFileTypes: ["image"],
		// allowedFileTypes: ['jpg', 'png', 'gif'],
		browseClass: "btn btn-success",
        browseLabel: "<span id='PickImages' class='trans-innerHTML'>Pick Images...</span>",
        browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
		removeClass: "btn btn-danger",
        // maxFileSize: 1024,
		// maxFilePreviewSize: 1024,
		maxFileCount: 20,
        overwriteInitial: true
    });
	// setzt Email ins modal ein, falls vorhanden
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
			document.getElementById('modalEmail').value = data.responseText;
		}
	});
	$.ajaxSetup({async: true});
	// Password-Match
	$('#modalNewPw, #modalNewPwConfirm').keyup(checkPasswordMatch).blur(checkPasswordMatch);
	// Länder und Länder sortieren
	getCountryData();
	$('#dropDownListCountries').change(changeCountry);
});

// holt Country-Data aus einer externen API
function getCountryData()
{
	$.ajaxSetup({async: false});
	$.get('https://restcountries.eu/rest/v2/all')
	// $.get('js/countryApi.json')
	.always(function(data)
	{
		countryData = data;
	});
	$.ajaxSetup({async: true});
	createDropDownListCountries();
}

// sortiert dropDownList 
function sortCountryList(dropDownList)
{
	$(dropDownList).html($(dropDownList).children('option').sort(function (x, y)
	{
		return $(x).text().toUpperCase() < $(y).text().toUpperCase() ? -1 : 1;
	}));
}

// kreiert oder updatet die dropDownList der Länder
function createDropDownListCountries(language)
{
	if (countryData)
	{
		language = language || '';
		var numberCountries = countryData.length;
		currentSelectedCountry = $('#dropDownListCountries').val();
		$('#dropDownListCountries').empty();
		for (var i = 0; i < numberCountries; i++)
		{
			if (language == 'br' || language == 'de' || language == 'es' || language == 'fa' || language == 'fr' || language == 'hr' || language == 'it' || language == 'ja' || language == 'nl' || language == 'pl')
			{
				$('#dropDownListCountries').append('<option value="' + countryData[i].alpha2Code +'">' + countryData[i].translations[language] + '</option>');
			}
			else
			{
				$('#dropDownListCountries').append('<option value="' + countryData[i].alpha2Code +'">' + countryData[i].name + '</option>');
			}
		}
		sortCountryList('#dropDownListCountries');
		// setFlagPictures();
		setCurrentSelectedItem();
	}
	else
	{
		setTimeout(function()
		{
			createDropDownListCountries();
		}, 1000);
	}
}

// setzt die Flaggen in der DropDownList
/*function setFlagPictures()
{
	var numberCountries = sortedCountryData.length;
	for (var i = 0; i < numberCountries; i++)
	{
		msDropDownCountries.add({text: sortedCountryData[i].name, value: sortedCountryData[i].alpha2Code, image: sortedCountryData[i].flag});
	}
	$('#dropDownListCountries_child').children('ul').children('li').children('img').attr('width', 32);
}*/

// Auswahl bleibt bei Sprachenänderung erhalten
function setCurrentSelectedItem()
{
	if (currentSelectedCountry == null || currentSelectedCountry == '')
	{
		var currentLanguageIndex = document.getElementById('language').selectedIndex;
		var pleaseSelect = objectLanguages.DestinationCountry[currentLanguageIndex];
		$('#dropDownListCountries').prepend('<option value="" selected="selected">' + pleaseSelect + '</option>');
	}
	else
	{
		$('#dropDownListCountries option').filter(function()
		{
			return $(this).val() == currentSelectedCountry;
		}).prop('selected', true);
	}
}

// DatePicker
$(function() {
	$('input[name="daterange"]').daterangepicker({
	"autoUpdateInput": false,
	"format": 'yyyy-mm-dd',
    "opens": "right", /* right means: it opens from left to right */
    "buttonClasses": "btn",
    "cancelClass": "btn-danger"
	}, function() {
		/*if (document.formCreateReport.daterange.value != "")
		{*/
			$('#div-Date').addClass('has-success').removeClass('has-error');
		/*}
		else
		{
			$('#div-Date').addClass('has-error').removeClass('has-success');
		}*/
		$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
			$(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
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
		$('#div-NickName').addClass('has-error').removeClass('has-success');
		document.formCreateReport.NickName.focus();
		return false;
	}
	var Country = document.formCreateReport.dropDownListCountries.value;
	if (Country == "")
	{
		$('#div-Country').addClass('has-error').removeClass('has-success');
		document.formCreateReport.dropDownListCountries.focus();
		return false;
	}
	var city = document.formCreateReport.City.value;
	if (city == "")
	{
		$('#div-City').addClass('has-error').removeClass('has-success');
		document.formCreateReport.City.focus();
		return false;
	}
	var dateRange = document.formCreateReport.daterange.value;
	if (dateRange == "")
	{
		$('#div-Date').addClass('has-error').removeClass('has-success');
		document.formCreateReport.daterange.focus();
		return false;
	}
	var highlight = document.formCreateReport.Highlight.value;
	if (highlight == "")
	{
		$('#div-Highlight').addClass('has-error').removeClass('has-success');
		document.formCreateReport.Highlight.focus();
		return false;
	}
	var attention = document.formCreateReport.Attention.value;
	if (attention == "")
	{
		$('#div-Attention').addClass('has-error').removeClass('has-success');
		document.formCreateReport.Attention.focus();
		return false;
	}
	var frame_textreport = window.frames[0].document.body.innerHTML;
	if (frame_textreport.length <= 11)
	{
		$('#modal_textarea_textreport').modal('show');
		window.frames[0].document.body.focus();
		return false;
	}
	// tmp Button "save" in "in bearbeitung umändern, um 2. mal raufklicken zu verhindern"
	var success = saveFormReportInDb(NickName, Country, city, dateRange, highlight, attention, frame_textreport);
	if (success == 'ReportSpeicherung erfolgreich')
	{
		uploadFilesAvatar(affectedIdWhenUpload);
		uploadFilesGallery(affectedIdWhenUpload);
		document.formCreateReport.action = './?Id=' + affectedIdWhenUpload + '&success=true';
		// hide button and link to report or whatever // nicht mehr nötig, weil auf nächste Seite weitergeleitet
		return true; // vielleicht ein true returnen, um Bilder zu speichern wegen $_FILES?
	}
	else
	{
		return false;
	}
}

// speichert das Formular in der Datenbank
function saveFormReportInDb(NickName, Country, city, dateRange, highlight, attention, frame_textreport)
{
	var returnValue = 'ReportSpeicherung fehlgeschlagen';
	var ReportName = document.formCreateReport.ReportName.value;
	var Lecture = document.formCreateReport.Lecture.value;
	var Internship = document.formCreateReport.Internship.value;
	var numPicsAvatar = document.formCreateReport.FileInputUploadAvatar.files.length;
	var numPicsGallery = document.formCreateReport.FileInputUploadGallery.files.length;
	/*var picsAvatar = new Array();
	var picsGallery = new Array();
	for (var i = 0; i < numPicsAvatar; i++)
	{
		picsAvatar[i] = new Object();
		picsAvatar[i].name = document.formCreateReport.FileInputUploadAvatar.files[i].name;
		picsAvatar[i].type = document.formCreateReport.FileInputUploadAvatar.files[i].type;
	}
	for (var i = 0; i < numPicsGallery; i++)
	{
		picsGallery[i] = new Object();
		picsGallery[i].name = document.formCreateReport.FileInputUploadGallery.files[i].name;
		picsGallery[i].type = document.formCreateReport.FileInputUploadGallery.files[i].type;
	}*/
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
		/*'picsAvatar': picsAvatar,
		'picsGallery': picsGallery,*/
		'commentBox': frame_textreport
	};
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText != 'noDatabase')
		{
			// Bilder speichern (http://php.net/manual/de/function.imagecopyresized.php)
			if (data[1] == 'ReportSpeicherung erfolgreich')
			{
				// erfolgreich (eventuelle returnValue für große Funktion?)
				affectedIdWhenUpload = data[0];
				returnValue = 'ReportSpeicherung erfolgreich';
			}
			else if (data[1] == 'ReportSpeicherung fehlgeschlagen')
			{
				// Meldung, nicht erfolgreich beim speichern
				returnValue = 'ReportSpeicherung fehlgeschlagen';
			}
			else
			{
				// console.log(data.responseText); // Debug
			}
		}
		else
		{
			returnValue = 'no Database';
		}
	});
	$.ajaxSetup({async: true});
	// console.log(returnValue); // Debug
	return returnValue;
}

// lädt Avatar-Bild mittels AJAX hoch
function uploadFilesAvatar(id)
{
	var returnValue = false;
	var form_data = new FormData();
	for (var i = 0; i < $('#FileInputUploadAvatar').prop('files').length; i++)
	{
		var file_data = $('#FileInputUploadAvatar').prop('files')[i];
		form_data.append('fileAvatar' + i, file_data);
	}
	form_data.append('id', id);
	form_data.append('action', 'fileAjaxUploadAvatar');
	$.ajaxSetup({async: false});
	$.ajax({
		url: './php/manageBackend.php', // point to server-side PHP script
		dataType: 'text',  // what to expect back from the PHP script, if anything
		cache: false,
		contentType: false,
		processData: false,
		data: form_data,
		type: 'post',
		success: function(data)
		{
			console.log(data);
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
		dataType: 'text',  // what to expect back from the PHP script, if anything
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
	var input_field = $('#dropDownListCountries').val();
	$('#dropDownListCountries option[value=""]').remove();
	if ($('#div-City').hasClass('hide'))
	{
		$('#div-City').addClass('has-error').removeClass('hide has-success');
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
			$('#dataListCity').empty();
			for (var i = 0; i < dataLength; i++)
			{
				$('#dataListCity').append('<option value="' + data[i].city_ascii + '"/>');
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
function focus_textarea_textreport()
{
	window.frames[0].document.body.focus();
}

// verändert die css-Klasse von Country
function changeCountryClass()
{
	if (document.formCreateReport.Country.value != "")
	{
		$('#div-Country').addClass('has-success').removeClass('has-error');
		document.getElementById('countries_msdd').style.borderColor = "#3c763d";
		document.formCreateReport.City.focus();
	}
	else
	{
		$('#div-Country').addClass('has-error').removeClass('has-success');
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
		$('#formModalProfile-divSuccess, #formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #modalClose, #div-changePw').addClass('hide');
		$('#modalCancel, #modalSave, #modalButtonEditPw').removeClass('hide');
		$('#modal-div-OldPw, #modal-div-NewPw, #modal-div-NewPwConfirm').removeClass('has-success has-error');
		document.getElementById('formModalProfile').reset();
		document.getElementById('modalEmail').value = originalOwnEmail;
	};
});

//Eingaben ModalProfile überprüfgen
function checkInputFormModalProfile()
{
	var emailAddress = document.getElementById('modalEmail').value;
	if ($('#div-changePw').hasClass(''))
	{
		if (checkPasswordMatch(true))
		{
			var oldPw = document.getElementById('modalOldPw').value;
			var newPw = document.getElementById('modalNewPw').value;
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
					$('#formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #modalButtonEditPw, #modalButtonEditPwCancel, #modalCancel, #modalSave').addClass('hide');
					$('#formModalProfile-divSuccess, #modalClose').removeClass('hide');
					$('#modal-div-OldPw').addClass('has-success').removeClass('has-error');
				}
				else if (data.responseText == 'Altes Passwort falsch')
				{
					$('#ErrorDb').addClass('hide');
					$('#formModalProfile-divErrorWrongPw').removeClass('hide');
					$('#modal-div-OldPw').addClass('has-error').removeClass('has-success');
				}
				else if (data.responseText == 'Profil Aktualisierung fehlgeschlagen') // tritt auf, wenn das Passwort auf das selbige geändert wurde
				{
					$('#formModalProfile-divErrorWrongPw, #ErrorDb').addClass('hide');
					$('#formModalProfile-divErrorUpdate').removeClass('hide');
				}
				else
				{
					$('#formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw').addClass('hide');
					$('#ErrorDb').removeClass('hide');
				}
			});
			$.ajaxSetup({async: true});
		}
		else
		{
			$('#formModalProfile-divSuccess, #formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw, #ErrorDb').addClass('hide');
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
				$('#formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw, #DivErrorPwNoMatch, #ErrorDb, #modalButtonEditPw, #modalButtonEditPwCancel, #modalCancel, #modalSave').addClass('hide');
				$('#formModalProfile-divSuccess, #modalClose').removeClass('hide');
			}
			else if (data.responseText == 'Email Aktualisierung fehlgeschlagen') // tritt praktisch nie auf
			{
				$('#formModalProfile-divErrorWrongPw, #ErrorDb').addClass('hide');
				$('#formModalProfile-divErrorUpdate').removeClass('hide');
			}
			else
			{
				$('#formModalProfile-divErrorUpdate, #formModalProfile-divErrorWrongPw').addClass('hide');
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
	$('#modalButtonEditPw').addClass('hide');
	$('#modalButtonEditPwCancel, #div-changePw').removeClass('hide');
	$('#modalOldPw').focus();
}

// onclick auf cancel change Password
function buttonChangePasswordCancel()
{
	$('#modalButtonEditPwCancel, #formModalProfile-divErrorWrongPw, #div-changePw').addClass('hide');
	$('#modalButtonEditPw').removeClass('hide');
}

// überprüft, ob die neuen Passwörter gleich sind
function checkPasswordMatch(forced)
{
	var returnValue = false;
	var newPw = document.getElementById('modalNewPw').value;
	var newPwConfirm = document.getElementById('modalNewPwConfirm').value;
	if (newPw && newPw == newPwConfirm)
	{
		$('#DivErrorPwNoMatch').addClass('hide');
		$('#modal-div-NewPw, #modal-div-NewPwConfirm').addClass('has-success').removeClass('has-error');
		returnValue = true;
	}
	else if (!newPw && !newPwConfirm)
	{
		$('#DivErrorPwNoMatch').addClass('hide');
		$('#modal-div-NewPw, #modal-div-NewPwConfirm').addClass('has-error').removeClass('has-success');
	}
	else
	{
		forced = forced || false;
		if (forced == true)
		{
			$('#DivErrorPwNoMatch').removeClass('hide');
			$('#modal-div-NewPw, #modal-div-NewPwConfirm').addClass('has-error').removeClass('has-success');
		}
		else
		{
			// $('#DivErrorPwNoMatch').addClass('hide'); // Grund: wegen der Enter-Taste würde die Fehlermeldung sofort wieder verschwinden
			$('#modal-div-NewPw, #modal-div-NewPwConfirm').removeClass('has-success has-error');
		}
	}
	return returnValue;
}

// leave page? // if you test the page... comment it out ;) // necessary because otherwise you could leave the page when you drag a pic into the comment-box and I guess nobody wants this ;)
/*window.onbeforeunload = function (e) {
    e = e || window.event;
    if (e) {
        e.returnValue = 'Do you want to reload the page?';
    }
};*/

// =============================================
// für Übersetzungen
// =============================================

// wird beim Öffnen des Profil-Modals ausgeführt
function modifyModalProfile()
{
	prepareLanguageSelection(true);
}