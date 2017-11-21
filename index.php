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
		session_destroy();
		include_once('html/login.html');
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
			session_destroy();
			include_once('html/login.html');
		}
	}
	else
	{
		session_destroy();
		include_once('html/login.html');
	}
}
else
{
	include_once('html/viewReports.html');
}
?>