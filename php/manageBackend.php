<?php
/* Developer: Leo Brandenburg */
// header("Access-Control-Allow-Origin: *"); // von einer anderen Website drauf zugreifen
header("Content-Type: application/json; charset=utf-8"); // JSON-Antwort
include_once('config.php'); // Datenbankanbindung
session_start(); // starten der PHP-Session
$_post = filter_input_array(INPUT_POST); // es werden nur POST-Variablen akzeptiert, damit nicht mittels Link (get-vars) Anderungen an DB vorgenommen werden können
$_tmp = array();
$_tmp['commentBox'] = '';
if (isset($_post['commentBox']))
{
	$_tmp['commentBox'] = $_post['commentBox'];
}
// $_post = array_map ( 'htmlspecialchars' , $_post );
$_post = replaceChars($_post);
if (isset($_post['commentBox']))
{
	$_post['commentBox'] = $_tmp['commentBox'];
	// $_post['commentBox'] = replaceChars($_post['commentBox']);
}
$action = $_post['action'];
if (!$conn->connect_error)
{
	switch ($action)
	{
		case 'login':
		{
			$UserName = $_post['UserName'];
			$Password = md5($_post['Password']);
			$MemberRole = checkLogin($conn, $UserName, $Password);
			if ($MemberRole >= 1)
			{
				echo 'Login erfolgreich';
			}
			else if ($MemberRole == 0)
			{
				echo 'Member permission';
			}
			else
			{
				echo 'Login fehlgeschlagen';
			}
			break;
		}
		case 'getCityList':
		{
			if (isset($_post['iso2']))
			{
				$iso2 = $_post['iso2'];
				$result = $conn->query("SELECT DISTINCT city_ascii FROM `world_cities` WHERE iso2='$iso2' ORDER BY city_ascii ASC");
			}
			else
			{
				$result = $conn->query("SELECT MAX(`Id`) AS maxId FROM `reports`"); // dummy-Abfrage, damit keine Fehler entstehen
			}
			$output = array();
			$output = $result->fetch_all(MYSQLI_ASSOC);
			echo json_encode($output);
			break;
		}
		case 'getOwnUser':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			$result = $conn->query("SELECT `Id`, `UserName`, `MemberRole` FROM `login` WHERE Id='$Id'");
			$output = array();
			$output = $result->fetch_all(MYSQLI_ASSOC);
			echo json_encode($output);
			break;
		}
		case 'getOwnEmail':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			$email = getOwnEmail($conn, $Id);
			if ($email)
			{
				echo $email;
			}
			else
			{
				echo 'no Email';
			}
			break;
		}
		case 'updateProfile':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			$oldPw = md5($_post['oldPw']);
			$newPw = md5($_post['newPw']);
			$email = $_post['email'];
			$response = updateProfile($conn, $Id, $oldPw, $newPw, $email);
			if ($response == "success Change")
			{
				echo 'Profil Aktualisierung erfolgreich';
			}
			else if ($response == "wrongOldPw")
			{
				echo 'Altes Passwort falsch';
			}
			else if ($response == "noProfileChange")
			{
				echo 'Profil Aktualisierung fehlgeschlagen';
			}
			break;
		}
		case 'updateEmail':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			$email = $_post['email'];
			$Id = updateEmail($conn, $Id, $email);
			if ($Id)
			{
				echo 'Email Aktualisierung erfolgreich';
			}
			else
			{
				echo 'Email Aktualisierung fehlgeschlagen'; // tritt praktisch nie auf, es sei denn jemand könnte die PHP-Session faken - deswegen auch nur 1x exemplarisch hier beachtet für den Fall der Fälle
			}
			break;
		}
		case 'saveFormReport':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			if ($Id)
			{
				$reportName = $_post['reportName'];
				$nickName = $_post['nickName'];
				$country = $_post['country'];
				$city = $_post['city'];
				$dateRange = $_post['dateRange'];
				$highlight = $_post['highlight'];
				$attention = $_post['attention'];
				$lecture = $_post['lecture'];
				$internship = $_post['internship'];
				$commentBox = $_post['commentBox'];
				$conn->query("INSERT INTO `reports`(`userId`, `reportName`, `nickName`, `country`, `city`, `dateRange`, `highlight`, `attention`, `lecture`, `internship`, `commentBox`, `showRow`) VALUES ('$Id', '$reportName', '$nickName', '$country', '$city', '$dateRange', '$highlight', '$attention', '$lecture', '$internship', '$commentBox', true);");
				$userAnswer = array();
				if ($conn->affected_rows > 0)
				{
					$userAnswer[0] = mysqli_insert_id($conn);
					$userAnswer[1] = 'ReportSpeicherung erfolgreich';
				}
				else
				{
					$userAnswer[0] = 0;
					$userAnswer[1] = 'ReportSpeicherung fehlgeschlagen';
				}
				echo json_encode($userAnswer);
			}
			break;
		}
		case 'fileAjaxUploadTitle':
		{
			$Id = $_post['id'];
			$allowedFileTypes = array('jpg', 'jpeg', 'png', 'gif'); // diese Dateiendungen werden akzeptiert - ggf. noch anzupassen
			$dirUpload = '../img_upload';
			$pathNewPics = "$dirUpload/$Id";
			mkdir("$pathNewPics", 0755, true);
			$pathThumbTitle = "$pathNewPics/thumb_Title/";
			$pathBigTitle = "$pathNewPics/big_Title/";
			mkdir("$pathThumbTitle", 0755, true);
			mkdir("$pathBigTitle", 0755, true);
			foreach($_FILES as $key => $value)
			{
				$tmpName = $value['tmp_name'];
				$name = $value['name'];
				move_uploaded_file($tmpName, $pathThumbTitle . $name);
				copy($pathThumbTitle . $name, $pathBigTitle . $name);
				resizeImage($pathThumbTitle . $name, 160, 160);
				resizeImage($pathBigTitle . $name, 1920, 1080);
			}
			break;
		}
		case 'fileAjaxUploadGallery':
		{
			$Id = $_post['id'];
			$allowedFileTypes = array('jpg', 'jpeg', 'png', 'gif'); // diese Dateiendungen werden akzeptiert - ggf. noch anzupassen
			$dirUpload = '../img_upload';
			$pathNewPics = "$dirUpload/$Id";
			$pathThumbGallery = "$pathNewPics/thumb_Gallery/";
			$pathBigGallery = "$pathNewPics/big_Gallery/";
			mkdir("$pathThumbGallery", 0755, true);
			mkdir("$pathBigGallery", 0755, true);
			foreach($_FILES as $key => $value)
			{
				$tmpName = $value['tmp_name'];
				$name = $value['name'];
				move_uploaded_file($tmpName, $pathThumbGallery . $name);
				copy($pathThumbGallery . $name, $pathBigGallery . $name);
				resizeImage($pathThumbGallery . $name, 160, 160);
				resizeImage($pathBigGallery . $name, 1920, 1080);
			}
			break;
		}
		case 'getReportData':
		{
			$result = $conn->query("SELECT * FROM `reports` WHERE `showRow`=true ORDER BY `ID` ASC");
			$output = array();
			$output = $result->fetch_all(MYSQLI_ASSOC);
			echo json_encode($output);
			break;
		}
		//unübersichtlich, aber funktioniert -> heißt: nix anfassen, dann geht auch nix kaputt ;)
		case 'getPictureData':
		{
			$dir = '../img_upload/';
			$dirOpen = opendir($dir);
			$files = array();
			while (false !== ($folderName = readdir($dirOpen)))
			{
				if ($folderName != '.' && $folderName != '..')
				{
					$folderNameOpen = opendir($dir . $folderName);
					chdir($dir . $folderName);
					$tmpFolder = array();
					while (false !== ($folderName2 = readdir($folderNameOpen)))
					{
						if ($folderName2 != '.' && $folderName2 != '..')
						{
							$fileNameOpen = opendir($folderName2);
							chdir($folderName2);
							$tmpFiles = array();
							while (false !== ($fileName = readdir($fileNameOpen)))
							{
								if ($fileName != '.' && $fileName != '..')
								{
									$tmpFiles[] = $fileName;
								}
							}
							// $tmpFolder[$folderName2] = $tmpFiles; // mit Ordnername
							$tmpFolder[] = $tmpFiles; // mit Index
							chdir('..');
							closedir($fileNameOpen);
						}
					}
					$files[$folderName] = $tmpFolder; // mit Ordnername // zwingend erforderlich, weil PHP "falsch" sortiert: 1, 10, 2 und nicht 1, 2, ..., 10
					// $files[] = $tmpFolder; // mit Index
					chdir('..');
					closedir($folderNameOpen);
				}
			}
			closedir($dirOpen);
			// print_r(scandir($dir)); // Debug
			// print_r($files); // Debug
			echo json_encode($files);
			break;
		}
		// Admin
		case 'deleteReport':
		{
			$Id = $_SESSION['StAusAuf_Id'];
			$reportIdToDelete = $_post['reportIdToDelete'];
			setMemberRole($conn);
			if ($_SESSION['StAusAuf_memberRole'] >= 1)
			{
				$conn-> query("UPDATE `reports` SET `showRow`=0 WHERE `Id`='$reportIdToDelete'");
				/* Bilder verschieben notwendig? Grund: es wird mit dem Ordnernamen zugegriffen, nicht über den Index */
			}
			break;
		}
		case 'getUserData':
		{
			setMemberRole($conn);
			if ($_SESSION['StAusAuf_memberRole'] >= 1)
			{
				$result = $conn->query("SELECT `Id`, `UserName`, `MemberRole`, `Email` FROM `login` ORDER BY UserName ASC;");
				$output = array();
				$output = $result->fetch_all(MYSQLI_ASSOC);
				echo json_encode($output);
			}
			break;
		}
		case 'deleteUser':
		{
			$userIdToDelete = $_post['userIdToDelete'];
			setMemberRole($conn);
			if ($_SESSION['StAusAuf_memberRole'] >= 1)
			{
				$result = $conn->query("SELECT `MemberRole` FROM `login` WHERE `Id`='$userIdToDelete';");
				while ($zeile = $result->fetch_assoc())
				{
					$otherMemberRole = $zeile['MemberRole'];
					if ($_SESSION['StAusAuf_memberRole'] >= $otherMemberRole)
					{
						$conn->query("DELETE FROM `login` WHERE `Id`='$userIdToDelete';");
					}
				}
			}
			break;
		}
		case 'updateUser':
		{
			$userIdToUpdate = $_post['userIdToUpdate'];
			$userName = $_post['userName'];
			$password = $_post['password'];
			setMemberRole($conn);
			$otherMemberRole = $_post['memberRole'];
			$email = $_post['email'];
			if ($_SESSION['StAusAuf_memberRole'] >= 1)
			{
				$result = $conn->query("SELECT * FROM `login` WHERE `Id`='$userIdToUpdate';");
				while ($zeile = $result->fetch_assoc())
				{
					if ($_SESSION['StAusAuf_memberRole'] >= $otherMemberRole)
					{
						if ($password != '')
						{
							$password = md5($password);
							$conn->query("UPDATE `login` SET `UserName`='$userName', `Password`='$password', `MemberRole`='$otherMemberRole', `Email`='$email' WHERE `Id`='$userIdToUpdate';");
						}
						else
						{
							$conn->query("UPDATE `login` SET `UserName`='$userName', `MemberRole`='$otherMemberRole', `Email`='$email' WHERE `Id`='$userIdToUpdate';");
						}
						if ($conn->affected_rows > 0)
						{
							echo 'UserUpdate erfolgreich';
						}
						else
						{
							echo 'kein Update vorgenommen';
						}
					}
				}
			}
			break;
		}
		case 'createUser':
		{
			$userName = $_post['userName'];
			$password = $_post['password'];
			setMemberRole($conn);
			$otherMemberRole = $_post['memberRole'];
			$email = $_post['email'];
			if ($_SESSION['StAusAuf_memberRole'] >= 1 && $_SESSION['StAusAuf_memberRole'] >= $otherMemberRole)
			{
				$conn->query("INSERT INTO `login`(`UserName`, `Password`, `MemberRole`, `Email`) VALUES ('$userName', '$password', '$otherMemberRole', '$email');");
				$userAnswer = array();
				if ($conn->affected_rows > 0)
				{
					$userAnswer[0] = mysqli_insert_id($conn);
					$userAnswer[1] = 'User erfolgreich angelegt';
				}
				else
				{
					$userAnswer[0] = 0;
					$userAnswer[1] = 'UserName schon vergeben';
				}
				echo json_encode($userAnswer);
			}
			break;
		}
		case 'generateRandomPassword':
		{
			echo md5(time());
			break;
		}
		default:
		{
			echo 'no Action';
			break;
		}
	}
}
else
{
	echo 'noDatabase';
}

// ersetzt Sonderzeichen (für schreiben in DB) // ersetzt durch hauseigene Fkt von PHP
function replaceChars($str)
{
	// zu ersetzende zeichen: Leerzeichen, Backslash und '
	// $_post = str_replace(" ", "&nbsp;", $_post); // Leerzeichen // zu entfernen, da sonst html-tags in commentBox kaputt gemacht werden
	$str = str_replace("\\", "&#92;", $str); // Backslash
	$str = str_replace("'", "&#39;", $str); // einfaches Anführungszeichen
	$str = str_replace("`", "&#96;", $str); // schräges einfaches Anführungszeichen links (gravis)
	// $_post = str_replace("´", "&#180;", $_post); // schräges einfaches Anführungszeichen rechts (akut)
	// $_post = str_replace("§", "&#167;", $_post); // Paragraphenzeichen
	return $str;
}

// überprüft immer wieder die MemberRole
function setMemberRole($conn)
{
	$Id = $_SESSION['StAusAuf_Id'];
	$result = $conn->query("SELECT `MemberRole` FROM `login` WHERE `Id`='$Id';");
	while ($zeile = $result->fetch_assoc())
	{
		$_SESSION['StAusAuf_memberRole'] = $zeile['MemberRole'];
	}
}

// login checken (existiert UserName mit PW in DB?)
function checkLogin($conn, $UserName, $Password)
{
	$result = $conn->query("SELECT `Id`, `MemberRole` FROM `login` WHERE `UserName`='$UserName' AND `Password`='$Password';");
	$MemberRole = -1;
	while ($zeile = $result->fetch_assoc())
	{
		$MemberRole = $zeile['MemberRole'];
		$_SESSION['StAusAuf_Id'] = $zeile['Id'];
		setMemberRole($conn);
	}
	return $MemberRole;
}

// get Mailaddress
function getOwnEmail($conn, $Id)
{
	$result = $conn->query("SELECT `Email` FROM `login` WHERE `Id`='$Id';");
	$email = "";
	while ($zeile = $result->fetch_assoc())
	{
		$email = $zeile['Email'];
	}
	return $email;
}

// update Email
function updateEmail($conn, $Id, $email)
{
	$conn->query("UPDATE `login` SET `Email`='$email' WHERE `Id`='$Id';");
	$result = $conn->query("SELECT `Id` FROM `login` WHERE `Id`='$Id';");
	$tmpId = 0;
	while ($zeile = $result->fetch_assoc())
	{
		$tmpId = $zeile['Id'];
	}
	return $tmpId;
}

// update Profile
function updateProfile($conn, $Id, $oldPw, $newPw, $email)
{
	$returnValue = "wrongOldPw";
	$conn->query("UPDATE `login` SET `Password`='$newPw', `Email`='$email' WHERE `Id`='$Id' AND `Password`='$oldPw';");
	if ($conn->affected_rows > 0)
	{
		$returnValue = "success Change";
	}
	else
	{
		$result = $conn->query("SELECT `Id` FROM `login` WHERE `Id`='$Id' AND `Password`='$oldPw';");
		$tmpId = 0;
		while ($zeile = $result->fetch_assoc())
		{
			$tmpId = $zeile['Id'];
		}
		if ($tmpId)
		{
			$returnValue = "noProfileChange";
		}
	}
	return $returnValue;
}

// verkleinert ggf. hochgeladene Bilder
function resizeImage($filePath, $maxWidth, $maxHeight)
{
	$imageInfo = getimagesize($filePath); 
	$width = $widthOrig = $imageInfo[0];
	$height = $heightOrig = $imageInfo[1];
	switch ($imageInfo['mime'])
	{
		case 'image/jpeg':
		{
			$imageCreateFunction = 'imagecreatefromjpeg';
			$imageSaveFunction = 'imagejpeg';
			break;
		}
		case 'image/png':
		{
			$imageCreateFunction = 'imagecreatefrompng';
			$imageSaveFunction = 'imagepng';
			break;
		}
		case 'image/gif':
		{
			$imageCreateFunction = 'imagecreatefromgif';
			$imageSaveFunction = 'imagegif';
			break;
		}
		default:
		{
			return 'not touched because wrong FileType'; // tritt aber nie auf, weil in if-Zweig abgefragt, aber man weiß nie, wozu es noch gut ist
			break;
		}
	}
	$origImage = $imageCreateFunction($filePath);
	if ($widthOrig > $maxWidth|| $heightOrig > $maxHeight)
	{
		$ratioWidth = $widthOrig / $maxWidth;
		$ratioHeight = $heightOrig / $maxHeight;
		if ($ratioWidth >= $ratioHeight)
		{
			$width = $widthOrig / $ratioWidth;
			$height = $heightOrig / $ratioWidth;
		}
		else
		{
			$width = $widthOrig / $ratioHeight;
			$height = $heightOrig / $ratioHeight;
		}
	}
	$destinationImage = imagecreatetruecolor($width, $height);
	imagecopyresampled($destinationImage, $origImage, 0, 0, 0, 0, $width, $height, $widthOrig, $heightOrig);
	$imageSaveFunction($destinationImage, $filePath);
}
?>