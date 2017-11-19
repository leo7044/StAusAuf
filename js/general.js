/* Developer: Leo Brandenburg */
// Voraussetzung für alle eigenen .js-Dateien

// verändert CSS-Klassen
function changeCss(id, css)
{
	$('#' + id)[0].className = css;
}

// Übersetzer
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