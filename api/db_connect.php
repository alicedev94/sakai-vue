<?php

ini_set('display_errors', 'Off');

$sql_host = "localhost";
$sql_usuario = "aaglobalcarg_admin";
$sql_pass = "Palmira8/*1";
$sql_db = "aaglobalcarg_bi";

$enlace_local = mysqli_connect($sql_host, $sql_usuario, $sql_pass, $sql_db);

if (!$enlace_local) {
    die("Error de conexión a la base de datos: " . mysqli_connect_error());
}

?>