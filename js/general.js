/* Developer: Leo Brandenburg */
// Voraussetzung für alle eigenen .js-Dateien

var objectLanguages = null;

$(document).ready(function() {
    try // für den Fall der Fälle, weil direkt aufs DOM durchgegriffen wird
    {
        objectLanguages = getLanguages();
        prepareLanguageSelection();
        changeLanguage();
    }
    catch(e)
    {
        console.log(e);
    }
});

// verändert CSS-Klassen
function changeCss(id, css)
{
	$('#' + id)[0].className = css;
}

// übersetzer
function googleTranslateElementInit()
{
	new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
}

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
    for (var key in objectLanguages.languageShort)
    {
        strHtml += '<option value="' + objectLanguages.languageShort[key] + '">' + objectLanguages.languageLong[key] + '</option>';
    }
    if (!modal)
    {
        $('#language')[0].innerHTML = strHtml;
    }
    else
    {
        $('#languageModal')[0].innerHTML = strHtml;
        $('#languageModal')[0].selectedIndex = $('#language')[0].selectedIndex;
    }
}

// wird beim Wechseln einer Sprache aufgerufen
function changeLanguage(currentLanguageIndex)
{
    if (currentLanguageIndex == undefined)
    {
        currentLanguageIndex = $('#language')[0].selectedIndex;
    }
    else
    {
        $('#language')[0].selectedIndex = currentLanguageIndex;
        if ($('#languageModal')[0])
        {
            $('#languageModal')[0].selectedIndex = currentLanguageIndex;
        }
    }
    translateEachElement(currentLanguageIndex);
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
}