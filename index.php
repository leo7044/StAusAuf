<?php
/* Developer: Leo Brandenburg */
session_start();
if (isset($_REQUEST['createReport']))
{
	if (isset($_SESSION['StAusAuf_Id']) && !isset($_REQUEST['logout']))
	{
		include_once('html/createReport.html');
	}
	else
	{
		logout();
	}
}
else if (isset($_REQUEST['edit']))
{
	if (isset($_SESSION['StAusAuf_Id']) && !isset($_REQUEST['logout']))
	{
		include_once('html/viewReports.html');
	}
	else
	{
		logout();
	}
}
else if (isset($_REQUEST['admin']))
{
	if (isset($_SESSION['StAusAuf_Id']) && !isset($_REQUEST['logout']))
	{
		if ($_SESSION['StAusAuf_memberRole'] >= 1)
		{
			include_once('html/admin.html');
		}
		else
		{
			logout();
		}
	}
	else
	{
		logout();
	}
}
else if (isset($_REQUEST['logout']))
{
	unset($_SESSION['StAusAuf_Id']);
	unset($_SESSION['StAusAuf_memberRole']);
	include_once('html/viewReports.html');
}
else
{
	include_once('html/viewReports.html');
}

function logout()
{
	unset($_SESSION['StAusAuf_Id']);
	unset($_SESSION['StAusAuf_memberRole']);
	include_once('html/login.html');
}
?>