/* Developer: Leo Brandenburg */
var pictureData = null;
var countryData = null;
var reportData = null;
var ownUser = new Array();
var arrayTitle = new Array();
var arrayTitleEdit = new Array();
var arrayContent = new Array();

$(document).ready(function()
{
	getGetParas();
	getOwnUser();
	getCountryData();
	getPictureData();
	getReportData();
	createIdArray();
	fillReportTable();
	incrementViews('viewReports');
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

// fällt das ownUserArray falls kein Login existiert
/* function prepareUserIfNoLogin()
{
	ownUser[0] = new Object();
	ownUser[0]['Id'] = 0;
	ownUser[0]['MemberRole'] = 'noLogin';
	ownUser[0]['UserName'] = 'noLogin';
} */

// erstellt Id-Array um ArrayId und RealId zu suchen
function createIdArray()
{
	idArray = new Array();
	for (var i = 0; i < reportData.length; i++)
	{
		idArray[i] = reportData[i].Id;
	}
};

// holt Country-Data aus einer externen API
function getCountryData()
{
	$.ajaxSetup({async: false});
	$.get('https://restcountries.eu/rest/v2/all') // for less traffic but more dependency
	// $.post('js/countryApi.json') // in case extern API goes offline
	.always(function(data)
	{
		countryData = data;
	});
	$.ajaxSetup({async: true});
	countryIso = new Array();
	for (var i = 0; i < countryData.length; i++)
	{
		countryIso[i] = countryData[i].alpha2Code;
	}
}

// speichert PictureData in Array
function getPictureData()
{
	var data =
	{
		action: "getPictureData"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		if (data.responseText != 'noDatabase')
		{
			pictureData = data;
		}
		else
		{
			// DB nicht erreichbar - überleg dir was
		}
	});
	$.ajaxSetup({async: true});
}

// lädt Daten aus der DB
function getReportData()
{
	var data =
	{
		action: "getReportData"
	}
	$.ajaxSetup({async: false});
	$.post('php/manageBackend.php', data)
	.always(function(data)
	{
		reportData = data;
	});
	$.ajaxSetup({async: true});
}

// fällt die ReportTable beim onLoad
function fillReportTable()
{
	if (reportData.responseText != 'noDatabase')
	{
		var strHtml = "";
		if ($_GET().Id)
		{
			/* strHtml += '<div class="alert alert-success alert-dismissable fade in">';
			strHtml += '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>The report has been successfully saved.';
			strHtml += '</div>'; */
			try
			{
				if ($_GET().success == 'true')
				{
					loadContentOfModal('modal_' + $_GET().Id, true);
				}
				else
				{
					loadContentOfModal('modal_' + $_GET().Id);
				}
				$("#modalReport").modal("show");
			}
			catch(e){/* Id existiert nicht */};
		}
		var lastColumn = 0;
		for (var i = 0; i < reportData.length; i++)
		{
			var pfadToTitlePic = 'img/default_avatar_male.jpg';
			var dataId = reportData[i].Id; // reason: deleted reports, offet from 1
			var row = parseInt(i / 3);
			lastColumn = row;
			var column = parseInt(i % 3);
			switch(column) // copy case 0 to 1 and 2 - only difference is case 0 first and in case 2 last row
			{
				case 0:
				{
					strHtml += '<div class="row" id="row' + column + '">';
					strHtml += '<div class="col-md-4" id="box' + row + column + '">';
					var picUrl = pictureData[dataId][0].toString();
					if (picUrl != '')
					{
						pfadToTitlePic = 'img_upload/' + dataId + '/thumb_Title/' + picUrl;
					}
					strHtml += '<center>';
					strHtml += '<a id="modal_' + dataId + '" data-toggle="modal" data-target="#modalReport" style="cursor: pointer;" onclick="loadContentOfModal(this.id);">';
					strHtml += '<img src="' + pfadToTitlePic + '" class="picture-size-small"></img>';
					strHtml += '</a>';
					strHtml += '<br/>' + reportData[i].reportName + ' (' + reportData[i].nickName + ')';
					strHtml += '<br/><span name="ReportCountry">' + getCountryInCorrectLanguage(i) + '</span>';
					strHtml += '</center>'
					strHtml += '</div>';
					break;
				}
				case 1:
				{
					strHtml += '<div class="col-md-4" id="box' + row + column + '">';
					var picUrl = pictureData[dataId][0].toString();
					if (picUrl != '')
					{
						pfadToTitlePic = 'img_upload/' + dataId + '/thumb_Title/' + picUrl;
					}
					strHtml += '<center>';
					strHtml += '<a id="modal_' + dataId + '" data-toggle="modal" data-target="#modalReport" style="cursor: pointer;" onclick="loadContentOfModal(this.id);">';
					strHtml += '<img src="' + pfadToTitlePic + '" class="picture-size-small"></img>';
					strHtml += '</a>';
					strHtml += '<br/>' + reportData[i].reportName + ' (' + reportData[i].nickName + ')';
					var indexOfCountry = $.inArray(reportData[i].country, countryIso);
					strHtml += '<br/><span name="ReportCountry">' + getCountryInCorrectLanguage(i) + '</span>';
					strHtml += '</center>'
					strHtml += '</div>';
					break;
				}
				case 2:
				{
					strHtml += '<div class="col-md-4" id="box' + row + column + '">';
					var picUrl = pictureData[dataId][0].toString();
					if (picUrl != '')
					{
						pfadToTitlePic = 'img_upload/' + dataId + '/thumb_Title/' + picUrl;
					}
					strHtml += '<center>';
					strHtml += '<a id="modal_' + dataId + '" data-toggle="modal" data-target="#modalReport" style="cursor: pointer;" onclick="loadContentOfModal(this.id);">';
					strHtml += '<img src="' + pfadToTitlePic + '" class="picture-size-small"></img>';
					strHtml += '</a>';
					strHtml += '<br/>' + reportData[i].reportName + ' (' + reportData[i].nickName + ')';
					var indexOfCountry = $.inArray(reportData[i].country, countryIso);
					strHtml += '<br/><span name="ReportCountry">' + getCountryInCorrectLanguage(i) + '</span>';
					strHtml += '</center>'
					strHtml += '</div>';
					strHtml += '</div><br/><br/>';
					break;
				}
				default:
					break;
			}
		}
		if (lastColumn != 2)
		{
			strHtml += '</div>';
		}
		// console.log(reportData); // Debug
		document.getElementById('bigDivForReportTable').innerHTML = strHtml;
	}
	else
	{
		// DB nicht erreichbar - überleg dir was
	}
}

// lädt den Content fürs Modal
function loadContentOfModal(longModalId, loadingPage)
{
	loadingPage = loadingPage || false;
	var LengthLongModalId = longModalId.length;
	var modalId = longModalId.substr(6, LengthLongModalId); // 'modal_' muss abgeschnitten werden
	window.history.pushState('', '', '?Id=' + modalId);
	var indexOfObjectInReportData = $.inArray(modalId, idArray); // auf welches Objekt in den ReportData muss zugegriffen werden
	var modal = document.getElementById('modalReport');
	var currentLanguageIndex = document.getElementById('language').selectedIndex;
	arrayTitle = objectLanguages.ArrayTitle[currentLanguageIndex];
	arrayTitleEdit = objectLanguages.ArrayTitleEdit[currentLanguageIndex];
	arrayContent = new Array(reportData[indexOfObjectInReportData].reportName,
								reportData[indexOfObjectInReportData].nickName,
								'<span id="OneReportCountry">' + getCountryInCorrectLanguage(indexOfObjectInReportData) + '</span>',
								reportData[indexOfObjectInReportData].city,
								reportData[indexOfObjectInReportData].dateRange,
								reportData[indexOfObjectInReportData].highlight,
								reportData[indexOfObjectInReportData].attention,
								reportData[indexOfObjectInReportData].lecture,
								reportData[indexOfObjectInReportData].internship);
	var modalBody =
		'<div class="row">' +
			'<div class="col-md-9"></div>' +
			'<div class="col-md-3">' +
				'<div class="form-group">' +
					'<select class="form-control" id="languageModal" onchange="changeLanguage(this.selectedIndex);"></select>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="list-group">' +
			'<a class="list-group-item">';
	if (ownUser[0] != undefined)
	{
		if (ownUser[0].MemberRole >= 1 || ownUser[0].Id == reportData[indexOfObjectInReportData].userId)
		{
			modalBody +=
				'<div id="modalButtonBasicView">' +
					'<div class="form-group">' +
						'<button type="button" class="btn btn-info" onclick="buttonGeneralInformationEdit();">' +
							'<span class="glyphicon glyphicon-pencil"></span> <span id="Edit" class="trans-innerHTML">Edit</span>' +
						'</button>' +
					'</div>';
		}
	}
		modalBody += '<h4 id="GeneralInformation" class="list-group-item-heading trans-innerHTML">General Information</h4>' +
					'<p class="list-group-item-text">' +
						'<div id="informationFieldsView"></div>' +
					'</p>' +
				'</div>';
		modalBody +=
				'<form method="post" action="" id="formModalGeneralInformationEdit" name="formModalGeneralInformationEdit" onsubmit="return buttonGeneralInformationConfirm()">' +
					'<div id="modalButtonEditView" class="hide">' +
						'<div class="row">' +
							'<div class="col-md-1"></div>' +
							'<div class="col-md-11">' +
								'<div class="form-group">' +
									'<button type="button" class="btn btn-danger" onclick="return buttonGeneralInformationCancel();">' +
										'<span class="glyphicon glyphicon-remove"></span> <span id="Cancel" class="trans-innerHTML">Cancel</span>' +
									'</button>&nbsp;' +
									'<button type="submit" class="btn btn-success">' +
										'<span class="glyphicon glyphicon-ok"></span> <span id="Confirm" class="trans-innerHTML">Confirm</span>' +
									'</button>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<h4 id="GeneralInformation" class="list-group-item-heading trans-innerHTML">General Information</h4>' +
						'<p class="list-group-item-text">' +
						'<div id="informationFieldsEdit"></div>';
			modalBody +=
						'</p>' +
					'</div>' +
				'</form>' +
			'</a>' +
		'</div>';
	if (pictureData[modalId][0].toString() != '')
	{
		modalBody +=
			'<div class="list-group">' +
				'<div class="list-group-item">' +
					'<h4 id="TitlePicture" class="list-group-item-heading trans-innerHTML">Title Picture</h4>' +
					'<p class="list-group-item-text">';
		var picUrl = pictureData[modalId][0].toString();
		var pfadToTitlePicThumb = 'img_upload/' + modalId + '/thumb_Title/' + picUrl;
		var pfadToTitlePicBig = 'img_upload/' + modalId + '/big_Title/' + picUrl;
		modalBody += '<a href="' + pfadToTitlePicBig + '" rel="lightbox" title="' + picUrl + '">' +
						'<img src="' + pfadToTitlePicThumb + '" class="picture-size-small">' +
					'</a>';
		modalBody += '</p>' +
				'</a>' +
			'</div><br/>';
	}
	if (pictureData[modalId][3].toString() != '')
	{
		modalBody +=
			'<div class="list-group">' +
				'<div class="list-group-item">' +
					'<h4 id="PictureGallery" class="list-group-item-heading trans-innerHTML">Picture Gallery</h4>' +
					'<p class="list-group-item-text">';
		var lastColumn = 0;
		for (var i = 0; i < pictureData[modalId][3].length; i++)
		{
			var picUrl = pictureData[modalId][3][i];
			var pfadToGalleryPicThumb = 'img_upload/' + modalId + '/thumb_Gallery/' + picUrl;
			var pfadToGalleryPicBig = 'img_upload/' + modalId + '/big_Gallery/' + picUrl;
			var row = parseInt(i / 4);
			lastColumn = row;
			var column = parseInt(i % 4);
			switch(column)
			{
				case 0:
				{
					modalBody += '<div class="row">' +
									'<div class="col-md-3">' +
										'<a href="' + pfadToGalleryPicBig + '" rel="lightbox" title="' + picUrl + '">' +
											'<img src="' + pfadToGalleryPicThumb + '" class="picture-size-small">' +
										'</a>' +
									'</div>';
					break;
				}
				case 1:
				{
					modalBody += '<div class="col-md-3">' +
									'<a href="' + pfadToGalleryPicBig + '" rel="lightbox" title="' + picUrl + '">' +
										'<img src="' + pfadToGalleryPicThumb + '" class="picture-size-small">' +
									'</a>' +
								'</div>';
					break;
				}
				case 2:
				{
					modalBody += '<div class="col-md-3">' +
									'<a href="' + pfadToGalleryPicBig + '" rel="lightbox" title="' + picUrl + '">' +
										'<img src="' + pfadToGalleryPicThumb + '" class="picture-size-small">' +
									'</a>' +
								'</div>';
					break;
				}
				case 3:
				{
					modalBody += '<div class="col-md-3">' +
									'<a href="' + pfadToGalleryPicBig + '" rel="lightbox" title="' + picUrl + '">' +
										'<img src="' + pfadToGalleryPicThumb + '" class="picture-size-small">' +
									'</a>' +
								'</div>' +
							'</div>';
					break;
				}
				default:
					break;
			}
		}
		if (lastColumn != 3)
		{
			modalBody += '</div>';
		}
		modalBody += '</p>' +
				'</a>' +
			'</div><br/>';
	}
	modalBody +=
		'<div class="list-group">' +
			'<div class="list-group-item">' +
				'<h4 id="Comment" class="list-group-item-heading trans-innerHTML">Comment</h4>' +
				'<p class="list-group-item-text">' +
					reportData[indexOfObjectInReportData].commentBox +
				'</p>' +
			'</div>' +
		'</div>';
	// modalBody = 'This is our modalId: ' + modalId;
	var modalContent =
			'<div class="modal-dialog modal-lg" role="document">' + 
				'<div class="modal-content">' +
					'<div class="modal-header">' +
						'<button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="closeModal();"><span aria-hidden="true">&times;</span></button>' +
					'</div>' +
					'<div class="modal-body">';
					if (loadingPage)
					{
						modalContent += '<div class="alert alert-success alert-dismissable fade in">' +
											'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><span id="ReportSaved" class="trans-innerHTML">Your report has been successfully saved.</span>' +
										'</div>';
					}
					modalContent += modalBody +
					'</div>' +
					'<div class="modal-footer">' +
						'<div class="form-group">';
					if (ownUser[0] != undefined)
					{
						if (ownUser[0].MemberRole >= 1)
						{
							modalContent += '<button type="button" class="btn btn-danger pull-left" onclick="deleteReport(' + modalId + ');">' +
									'<span class="glyphicon glyphicon glyphicon-remove-sign"></span> <span id="DeleteReport" class="trans-innerHTML">Delete Report</span>' +
								'</button>';
						}
					}
					modalContent += '<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="closeModal();">' +
								'<span class="glyphicon glyphicon glyphicon-ok-sign"></span> <span id="Close" class="trans-innerHTML">Close</span>' +
							'</button>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>';
	modal.innerHTML = modalContent;
	prepareLanguageSelection(true);
	fillInformationFieldsView();
	changeLanguage();
	incrementViews(parseInt(modalId));
}

// befüllt generelle Informationen in der Betrachtungsebene
function fillInformationFieldsView()
{
	var strHTML = '';
	for (var i = 0; i < arrayTitle.length; i++)
	{
		strHTML +=
			'<div class="row">' +
				'<div class="col-md-3">' +
					'<label class="trans-innerHTML-array">' + arrayTitle[i] + '</label>' +
				'</div>' +
				'<div class="col-md-9">' +
					arrayContent[i] +
				'</div>' +
			'</div>';
	}
	$('#informationFieldsView')[0].innerHTML = strHTML;
}

// editiert Bericht
function buttonGeneralInformationEdit()
{
	$('#modalButtonBasicView').addClass('hide');
	$('#modalButtonEditView').removeClass('hide');
	// Felder Bearbeitungsmodus
	var strHTML = '';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[0] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-pencil"></i></span>' +
				'<input class="form-control trans-placeholder" name="ReportName" id="ReportName" maxlength="255" placeholder="Title of report*" value="' + arrayContent[0] + '" required />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipReportName" data-toggle="tooltip" data-placement="top" title="Please enter a title for your report." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[1] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>' +
				'<input class="form-control trans-placeholder" name="NickName" id="NickName" maxlength="255" placeholder="NickName (author of report)*" value="' + arrayContent[1] + '" required />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipNickName" data-toggle="tooltip" data-placement="top" title="Please enter a NickName. The NickName will be shown as author of your report." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML += // Überschrift falsch, durch Übersetzung -> wird automatisch richtig, wenn Land eingefügt
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[3] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-road"></i></span>' +
				'<input class="form-control trans-placeholder" name="Input_City" id="Input_City" maxlength="255" placeholder="Destination-City*" value="' + arrayContent[3] + '" required />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipDestinationCity" data-toggle="tooltip" data-placement="top" title="Please enter your destination-city." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[4] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
				'<input class="form-control trans-placeholder" style="background: white;" name="daterange" id="daterange" placeholder="Travel-Period*" value="' + arrayContent[4] + '" readonly />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipDateRange" data-toggle="tooltip" data-placement="top" title="Please select startdate and enddate of your travel." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[5] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-thumbs-up"></i></span>' +
				'<input class="form-control trans-placeholder" name="Input_Highlight" id="Input_Highlight" maxlength="255" placeholder="Your personal highlights*" value="' + arrayContent[5] + '" required />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipHighlight" data-toggle="tooltip" data-placement="top" title="Please enter your personal highlights." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[6] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-warning-sign"></i></span>' +
				'<input class="form-control trans-placeholder" name="Input_Attention" id="Input_Attention" maxlength="255" placeholder="What must be considered?*" value="' + arrayContent[6] + '" required />' +
				'<span class="input-group-addon">' +
					'<a name="Input_Attention" data-toggle="tooltip" data-placement="top" title="What must be considered?" class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[7] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-education"></i></span>' +
				'<input class="form-control trans-placeholder" name="Lecture" id="Lecture" maxlength="255" placeholder="Attended lectures" value="' + arrayContent[7] + '" />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipLecture" data-toggle="tooltip" data-placement="top" title="Please enter your attended lectures." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<label class="trans-innerHTML-arrayEdit">' + arrayTitleEdit[8] + '</label>' +
		'<div class="form-group">' +
			'<div class="input-group">' +
				'<span class="input-group-addon"><i class="glyphicon glyphicon-briefcase"></i></span>' +
				'<input class="form-control trans-placeholder" name="Internship" id="Internship" maxlength="255" placeholder="Attended internships" value="' + arrayContent[8] + '" />' +
				'<span class="input-group-addon">' +
					'<a name="ToolTipInternship" data-toggle="tooltip" data-placement="top" title="Please enter your attended internship." class="trans-name-title">' +
						'<i class="glyphicon glyphicon-question-sign"></i>' +
					'</a>' +
				'</span>' +
			'</div>' +
		'</div>';
	strHTML +=
		'<div id="form-required" class="trans-innerHTML">' +
			'*) required' +
		'</div>';
	$('#informationFieldsEdit')[0].innerHTML = strHTML;
	initializeDateRangePicker();
	
	changeLanguage();
}

// speichert Bericht
function buttonGeneralInformationConfirm()
{
	// DB update
	// Array update
	fillInformationFieldsView();
	buttonGeneralInformationCancel();
	return false;
}

// setzt Felder in Ausgangsstand zurück
function buttonGeneralInformationCancel()
{
	$('#modalButtonBasicView').removeClass('hide');
	$('#modalButtonEditView').addClass('hide');
	changeLanguage();
	return false;
}

// löscht Bericht
function deleteReport(Id)
{
	if (confirm('Are you sure you want to delete this report?'))
	{
		var data =
		{
			action: "deleteReport",
			reportIdToDelete: Id
		}
		$.ajaxSetup({async: false});
		$.post('php/manageBackend.php', data);
		$.ajaxSetup({async: true});
		getReportData();
		createIdArray();
		fillReportTable();
		$("#modalReport").modal("hide");
	}
}

// wird beim Schließen des ReportModals aufgerufen, um die url in der Addresszeile zu ändern
function closeModal()
{
	window.history.pushState('', '', '?');
}

// DateRangePicker
function initializeDateRangePicker()
{
	$('input[name="daterange"]').daterangepicker({
	"autoUpdateInput": false,
	"format": 'DD.MM.YYYY',
    "opens": "right", /* right means: it opens from left to right */
	"buttonClasses": "btn",
    "cancelClass": "btn-danger"
	}, function(){
		$('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
			$(this).val(picker.startDate.format('DD.MM.YYYY') + ' - ' + picker.endDate.format('DD.MM.YYYY'));
		});
	});
	$('#modalReport').scroll(function() {
		if ($('.daterangepicker')[0].style.cssText.indexOf('block') != -1)
		{
			$('.cancelBtn.btn.btn-danger').click();
		}
	});
};

// =============================================
// für Übersetzungen
// =============================================

// liefert den Ländernamen in der richtigen Sprache zurück
function getCountryInCorrectLanguage(id)
{
	var strHtml = '';
	var indexOfCountry = $.inArray(reportData[id].country, countryIso);
	var currentLanguageIndex = $('#language')[0].selectedIndex;
	if (currentLanguageIndex)
	{
		var lang = objectLanguages.languageShort[currentLanguageIndex];
		strHtml += countryData[indexOfCountry].translations[lang];
	}
	else
	{
		strHtml += countryData[indexOfCountry].name;
	}
	return strHtml;
}