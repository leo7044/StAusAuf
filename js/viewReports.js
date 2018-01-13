/* Developer: Leo Brandenburg */
var pictureData = null;
var countryData = null;
var reportData = null;
var ownUser = new Array();

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
	var arrayTitle = objectLanguages.ArrayTitle[currentLanguageIndex];
	var arrayContent = new Array(reportData[indexOfObjectInReportData].reportName,
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
			'<a class="list-group-item">' +
				'<h4 id="GeneralInformation" class="list-group-item-heading trans-innerHTML">General Information</h4>' +
				'<p class="list-group-item-text">';
					for (var i = 0; i < arrayTitle.length; i++)
					{
						modalBody +=
							'<div class="row">' +
								'<div class="col-md-3" text-right>' +
									'<label class="trans-innerHTML-array">' + arrayTitle[i] + '</label>' +
								'</div>' +
								'<div class="col-md-9">' +
									arrayContent[i] +
								'</div>' +
							'</div>';
					}
	modalBody +=
				'</p>' +
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
	changeLanguage();
	incrementViews(parseInt(modalId));
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