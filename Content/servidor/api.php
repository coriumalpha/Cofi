<?php

#######################--DATOS GENÉRICOS Y CONFIGURACIÓN DE API--##################

session_start();
$root = realpath($_SERVER["DOCUMENT_ROOT"]);
date_default_timezone_set('Europe/Madrid');

$action = $_REQUEST['action'];

if($_SESSION['activeSession'] == true)
{
	$sessionUser = $_SESSION["user"];
	$sessionPassword = $_SESSION["pass"];
	$sessionId = $_SESSION["userId"];
}


//CONEXIÓN A BASE DE DATOS
require_once("$root/config.php"); //Importa los datos para la conexión a bbdd
$link = mysqli_connect($dbHost, $dbUsername, $dbPassword, $dbName)or die("Problemas en la conexion.");
mysqli_set_charset($link, 'utf8'); //MUY IMPORTANTE PARA LAS TILDES


#######################--DATA OUTPUT--#####################

function Joutput($outputArray) //printea como JSON un array nativo de entrada
{
	echo json_encode($outputArray);
}

#######################--LOGOUT--##########################

if($action == "logout")
{
	session_unset();
	session_destroy();
	
	$return['status'] = true;
	Joutput($return);
}

########################--LOGIN--##########################

function checkLogin($user, $pass) //Verifica juego de usuario:contraseña (return -> false si error)
{
	global $link;
	$myusername = stripslashes(mysqli_real_escape_string($link, $user));
	$mypassword = stripslashes(mysqli_real_escape_string($link, $pass));
	
	$result = mysqli_query($link, "SELECT passwd, id FROM loginData WHERE user='$myusername'");
	while ($row = mysqli_fetch_assoc($result))
	{
	 $passwd = $row['passwd'];
	 $userId = $row['id'];
	}
	if (password_verify($mypassword, $passwd))
	{
		$_SESSION["activeSession"] = true;
		$_SESSION["user"] = $myusername;
		$_SESSION["pass"] = $mypassword;
		$_SESSION["userId"] = $userId;
		return true;
	}
	else
	{
		return false;
	}
}


if($action == "login") //Llama a checklogin con la información del formulario de logueo y devuelve estado
{
	parse_str($_POST['formData'], $formData);
	$username = $formData['username'];
	$password = $formData['password'];

	if(checkLogin($username, $password))
	{
		$return['status'] = true;
		$return['message'] = "Usuario correcto.";
		Joutput($return);
	}
	else
	{
		$return['status'] = false;
		$return['message'] = "Usuario/Contraseña incorrectos.";
		Joutput($return);
	}
}


#######################--SHOW-LIST--########################

if($action == "showList") //Recoge la lista de la bbdd matcheando user_id y devuelve JSON
{
	$listQuery = "
		SELECT
			id,
			idHost,
			nombre,
			essid,
			wifiPass,
			location,
			plugs
		FROM bares
		WHERE idHost = '$sessionId'
	";

	$listResult = mysqli_query($link, $listQuery);
	while($row = mysqli_fetch_assoc($listResult))
	{
		if($row['plugs'] == 1)
		{
			$plugs = "fa fa-plug";
		}
		else
		{
			$plugs = "fa fa-battery-full";
		}

		$listOutput[] = array(
							'barId' => $row['id'],
							'idHost' => $row['idHost'],
							'nombre' => $row['nombre'],
							'essid' => $row['essid'],
							'wifiPass' => $row['wifiPass'],
							'location' => $row['location'],
							'plugs' => $plugs,
						);
	}
	Joutput($listOutput);

}

########################--INSERT-LOCATION--########################

function insertLocation($insertArray) //Devuelve true si correcto, inserta nuevo bar
{
	global $link, $sessionId;

	$nombre = $insertArray[0];
	$essid = $insertArray[1];
	$wifiPass = $insertArray[2];
	$location = $insertArray[3];
	$plugs = $insertArray[4];

	$insertQuery = "
		INSERT INTO bares
		(
			idHost,
			nombre,
			essid,
			wifiPass,
			location,
			plugs
		)
		VALUES
		(
			'$sessionId',
			'$nombre',
			'$essid',
			'$wifiPass',
			'$location',
			'$plugs'
		)";
	$inserResult = mysqli_query($link, $insertQuery);
	if(!$insertResult)
	{
		return true;
	}
	else
	{
		return false;
	}

}



if($action == "insert")
{
	parse_str($_POST['formData'], $formData);
	$insertArray[0] = $formData['name'];
	$insertArray[1] = $formData['essid'];
	$insertArray[2] = $formData['wifiPass'];
	$insertArray[3] = $formData['location'];
	$insertArray[4] = $formData['plugs'];

	if(insertLocation($insertArray))
	{
		$return['status'] = true;
		$return['message'] = "Todo ha ido bien :3";
	}
	else
	{
		$return['status'] = false;
		$return['message'] = "Algo ha cascado en el insert.";
	}
	Joutput($return);
}





########################--DELETE-LOCATION--########################

if($action == 'deleteLocation')
{
	deleteLocation($_REQUEST['locationId']);
}


function deleteLocation($locationId)
{
	global $link, $sessionId;

	$result = mysqli_query($link, "DELETE FROM bares WHERE id = '$locationId'");
	if(!result)
	{
		$return['status'] = false;
		$return['message'] = "Error al eliminar el registro ".$locationId.".";
		return true;
	}
	else
	{
		$return['status'] = true;
		$return['message'] = "Registro ".$locationId." eliminado.";
		return false;
	}
	Joutput($result);
}


########################--UPDATE-LOCATION--########################

if($action == 'updateLocation')
{
	updateLocation(); //need to fill with data D:
}


function updateLocation($locationArray) //Devuelve true si correcto, inserta nuevo bar
{
	global $link, $sessionId;

	$locationId = $locationArray[0];
	$nombre = $locationArray[1];
	$essid = $locationArray[2];
	$wifiPass = $locationArray[3];
	$location = $locationArray[4];
	$plugs = $locationArray[5];

	$updateQuery = "
		UPDATE bares
		SET
			nombre = '$nombre',
			essid = '$essid',
			wifiPass = '$wifiPass',
			location = '$location',
			plugs = '$plugs'
		WHERE
			id = '$locationArray'
			AND
			idHost = '$sessionId'
		";

	$updateResult = mysqli_query($link, $updateQuery);
	if(!$updateResult)
	{
		return true;
	}
	else
	{
		return false;
	}

}



##########################--SHOW-DETAILS--##########################


if($action == "showDetails") //Recoge la lista de la bbdd matcheando id y devuelve JSON
{
	showDetails($siteId);
}


function showDetails($siteId)
{
	global $link, $sessionId;

	$listQuery = "
		SELECT
			id,
			idHost,
			nombre,
			essid,
			wifiPass,
			location,
			plugs
		FROM bares
		WHERE
			id = '$siteId'
			AND
			idHost = '$sessionId'
	";

	$listResult = mysqli_query($link, $listQuery);
	while($row = mysqli_fetch_assoc($listResult))
	{
		if($row['plugs'] == 1)
		{
			$plugs = "fa fa-plug";
		}
		else
		{
			$plugs = "fa fa-battery-full";
		}

		$listOutput[] = array(
							'barId' => $row['id'],
							'idHost' => $row['idHost'],
							'nombre' => $row['nombre'],
							'essid' => $row['essid'],
							'wifiPass' => $row['wifiPass'],
							'location' => $row['location'],
							'plugs' => $plugs,
						);
	}
	Joutput($listOutput);
}






?>