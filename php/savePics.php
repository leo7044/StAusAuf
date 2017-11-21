<?php
/* Developer: Leo Brandenburg */
// gespeicherte Bildergröße ist noch anzupassen
include_once('config.php'); // Datenbankanbindung
session_start(); // starten der PHP-Session
if (isset($_SESSION['StAusAuf_Id']))
{
	$userId = $_SESSION['StAusAuf_Id'];
	$result = $conn->query("SELECT MAX(Id) AS Id FROM `reports` WHERE userId='$userId';");
	$Id = 0;
	while ($zeile = $result->fetch_assoc())
	{
		$Id = $zeile['Id'];
	}
	/*if(isset($_FILES["FileInputUploadAvatar"]) || isset($_FILES["FileInputUploadGallery"]))
	{*/
	$allowedFileTypes = array('jpg', 'png', 'gif'); // diese Dateiendungen werden akzeptiert - ggf. noch anzupassen
	$dirUpload = '../img_upload';
	$pathNewPics = "$dirUpload/$Id";
	mkdir("$pathNewPics", 0755, true);
	$pathThumbAvatar = "$pathNewPics/thumb_Avatar";
	$pathBigAvatar = "$pathNewPics/big_Avatar";
	mkdir("$pathThumbAvatar", 0755, true);
	mkdir("$pathBigAvatar", 0755, true);
	if(isset($_FILES["FileInputUploadAvatar"]))
	{
		foreach ($_FILES["FileInputUploadAvatar"]["error"] as $key => $error)
		{
			if ($error == UPLOAD_ERR_OK)
			{
				$tmp_name = $_FILES["FileInputUploadAvatar"]["tmp_name"][$key];
				$name = $_FILES["FileInputUploadAvatar"]["name"][$key];
				$extension = pathinfo($name, PATHINFO_EXTENSION);
				if(in_array($extension,$allowedFileTypes))
				{
					move_uploaded_file($tmp_name, "$pathThumbAvatar/$name");
					copy("$pathThumbAvatar/$name", "$pathBigAvatar/$name");
					resizeImage("$pathThumbAvatar/$name", 160, 160);
					resizeImage("$pathBigAvatar/$name", 1920, 1080);
				}
			}
		}
	}
	$pathBigGallery = "$pathNewPics/big_Gallery";
	$pathThumbGallery = "$pathNewPics/thumb_Gallery";
	mkdir("$pathBigGallery", 0755, true);
	mkdir("$pathThumbGallery", 0755, true);
	if(isset($_FILES["FileInputUploadGallery"]))
	{
		foreach ($_FILES["FileInputUploadGallery"]["error"] as $key => $error)
		{
			if ($error == UPLOAD_ERR_OK)
			{
				$tmp_name = $_FILES["FileInputUploadGallery"]["tmp_name"][$key];
				$name = $_FILES["FileInputUploadGallery"]["name"][$key];
				$extension = pathinfo($name, PATHINFO_EXTENSION);
				if(in_array($extension,$allowedFileTypes))
				{
					move_uploaded_file($tmp_name, "$pathBigGallery/$name");
					copy("$pathBigGallery/$name", "$pathThumbGallery/$name");
					resizeImage("$pathBigGallery/$name", 1920, 1080);
					resizeImage("$pathThumbGallery/$name", 160, 160);
				}
			}
		}
	}
	/*}*/
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
// Meldung, dass Speichern erfogreich war bzw. zu Seite weiterleiten, wo Report zu sehen mit Modal-Meldung
header('Location: ../?Id=' . $Id . '&success=true');
?>