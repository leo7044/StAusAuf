/* Developer: Leo Brandenburg */
// Voraussetzung für alle eigenen .js-Dateien

var objectLanguages = null;
var currentSelectedCountry = '';

$(document).ready(function() {
    try // für den Fall der Fälle, weil direkt aufs DOM durchgegriffen wird
    {
        objectLanguages = getLanguages();
        prepareLanguageSelection();
        // Vorteil der Ausführung: das JSON wird auch schon beim PageLoad geladen, falls HTML-Quellcode im Original nicht angepasst wurde
        // Nachteil: Wenn HTML-Quellcode aktuell (das sollte er immer sein) ==> Performance-Verlust
        // ==> nicht ausführen
        // changeLanguage();
    }
    catch(e)
    {
        console.log(e);
    }
});

// GET-Paras
function getGetParas()
{
    var s = window.location.search.substring(1).split('&');
    if(!s.length) return;
    var c = {};
    for(var i  = 0; i < s.length; i++)
	{
        var parts = s[i].split('=');
        c[unescape(parts[0])] = unescape(parts[1]);
    }
    window.$_GET = function(name){return name ? c[name] : c;}
}

// Sprachen aus Sprachdatei laden
function getLanguages()
{
	var returnValue = null;
	$.ajaxSetup({async: false});
	$.getJSON
	(
		"js/languages.json",
		function(data)
		{
			returnValue = data;
		}
	)
	$.ajaxSetup({async: true});
	return returnValue;
}

// präpariert die Sprachauswahl
function prepareLanguageSelection(modal)
{
    var strHtml = '';
    for (var key in objectLanguages.LanguageShort)
    {
        strHtml += '<option value="' + objectLanguages.LanguageShort[key] + '">' + objectLanguages.LanguageLong[key] + '</option>';
    }
    if (!modal)
    {
        document.getElementById('language').innerHTML = strHtml;
    }
    else
    {
        document.getElementById('languageModal').innerHTML = strHtml;
        document.getElementById('languageModal').selectedIndex = document.getElementById('language').selectedIndex;
    }
}

// wird beim Wechseln einer Sprache aufgerufen
function changeLanguage(currentLanguageIndex)
{
    if (currentLanguageIndex == undefined)
    {
        currentLanguageIndex = document.getElementById('language').selectedIndex;
    }
    else
    {
        document.getElementById('language').selectedIndex = currentLanguageIndex;
        if (document.getElementById('languageModal'))
        {
            document.getElementById('languageModal').selectedIndex = currentLanguageIndex;
        }
    }
    translateEachElement(currentLanguageIndex);

    // viewReports
    if (document.getElementsByName('ReportCountry') != undefined)
    {
        for (var i = 0; i < document.getElementsByName('ReportCountry').length; i++)
        {
            document.getElementsByName('ReportCountry')[i].innerHTML = getCountryInCorrectLanguage(i);
        }
    }
    getGetParas();
    if ($_GET().Id != undefined)
    {
        var modalId = $_GET().Id;
        var indexOfObjectInReportData = $.inArray(modalId, idArray);
        document.getElementById('OneReportCountry').innerHTML = getCountryInCorrectLanguage(indexOfObjectInReportData);
    }

    // createReport
    if (document.getElementById('dropDownListCountries'))
    {
        var currentSelectedLanguage = objectLanguages.LanguageShort[currentLanguageIndex];
        createDropDownListCountries(currentSelectedLanguage);
    }
}

// translates each Element with special classes
function translateEachElement(currentLanguageIndex)
{
    for (var i = 0; i < $('.trans-innerHTML').length; i++)
    {
        $('.trans-innerHTML')[i].innerHTML = objectLanguages[$('.trans-innerHTML')[i].id][currentLanguageIndex];
    }
    for (var i = 0; i < $('.trans-placeholder').length; i++)
    {
        $('.trans-placeholder')[i].placeholder = objectLanguages[$('.trans-placeholder')[i].id][currentLanguageIndex];
    }
    for (var i = 0; i < $('.trans-innerHTML-array').length; i++)
    {
        $('.trans-innerHTML-array')[i].innerHTML = objectLanguages.ArrayTitle[currentLanguageIndex][i];
    }
    for (var i = 0; i < $('.trans-innerHTML-arrayEdit').length; i++)
    {
        $('.trans-innerHTML-arrayEdit')[i].innerHTML = objectLanguages.ArrayTitleEdit[currentLanguageIndex][i];
    }
    for (var i = 0; i < $('.trans-name-placeholder').length; i++)
    {
        $('.trans-name-placeholder')[i].placeholder = objectLanguages[$('.trans-name-placeholder')[i].name][currentLanguageIndex];
    }
    for (var i = 0; i < $('.trans-name-title').length; i++)
    {
        $('.trans-name-title')[i].title = objectLanguages[$('.trans-name-title')[i].name][currentLanguageIndex];
    }
    for (var i = 0; i < $('.trans-id-title').length; i++)
    {
        $('.trans-id-title')[i].title = objectLanguages[$('.trans-id-title')[i].id][currentLanguageIndex];
    }
    for (var i = 0; i < $('.trans-upload-placeholder').length; i++)
    {
        $('.trans-upload-placeholder')[i]['data-msg-placeholder'] = objectLanguages[$('.trans-upload-placeholder')[i].id][currentLanguageIndex];
        try
        {
            $('.file-caption-name')[i].placeholder = objectLanguages[$('.trans-upload-placeholder')[i].id][currentLanguageIndex];
        }
        catch(e)
        {
            // beim PageLoad wird es beim ersten Mal immer einen Fehler geben.
            // Der Grund ist, dass der FileInput noch nicht aufgebaut ist, wenn das erste Mal übersetzt wird.
            // theoretische Lösungen: if, else-technisch lösen oder dieses eine Problemelement abfangen ==> praktische Lösung: abfangen
            // console.log(e);
        }
    }
}

// erhöht die Zahl der Besucher um 1
function incrementViews(element)
{
    var data = null;
    if (isNaN(element))
    {
        data =
        {
            action: "incrementViews",
            page: element
        }
    }
    else
    {
        data =
        {
            action: "incrementViews",
            Id: element
        }
    }
	$.ajaxSetup({async: false});
    $.post('php/manageBackend.php', data);
	$.ajaxSetup({async: true});
}

// holt Country-Data aus einer externen API
function getCountryData()
{
	$.ajaxSetup({async: false});
	// $.get('https://restcountries.eu/rest/v2/all') // for less traffic but more dependency
	$.post('js/countryApi.json') // in case extern API goes offline
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