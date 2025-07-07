<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

// Obtener el año desde los parámetros GET, por defecto el año actual
$ano = isset($_GET['ano']) ? intval($_GET['ano']) : date('Y');

$query = "SELECT
    c.fc_descripcion AS CLIENTE,
    c.fc_codigo AS CODIGO,
    $ano AS AÑO,
    FORMAT(SUM(dv.entregado), 0) AS \"TOTAL AÑO\",
    FORMAT(SUM(CASE WHEN dv.mes = 1 THEN dv.entregado ELSE 0 END), 0) AS ENERO,
    FORMAT(SUM(CASE WHEN dv.mes = 2 THEN dv.entregado ELSE 0 END), 0) AS FEBRERO,
    FORMAT(SUM(CASE WHEN dv.mes = 3 THEN dv.entregado ELSE 0 END), 0) AS MARZO,
    FORMAT(SUM(CASE WHEN dv.mes = 4 THEN dv.entregado ELSE 0 END), 0) AS ABRIL,
    FORMAT(SUM(CASE WHEN dv.mes = 5 THEN dv.entregado ELSE 0 END), 0) AS MAYO,
    FORMAT(SUM(CASE WHEN dv.mes = 6 THEN dv.entregado ELSE 0 END), 0) AS JUNIO,
    FORMAT(SUM(CASE WHEN dv.mes = 7 THEN dv.entregado ELSE 0 END), 0) AS JULIO,
    FORMAT(SUM(CASE WHEN dv.mes = 8 THEN dv.entregado ELSE 0 END), 0) AS AGOSTO,
    FORMAT(SUM(CASE WHEN dv.mes = 9 THEN dv.entregado ELSE 0 END), 0) AS SEPTIEMBRE,
    FORMAT(SUM(CASE WHEN dv.mes = 10 THEN dv.entregado ELSE 0 END), 0) AS OCTUBRE,
    FORMAT(SUM(CASE WHEN dv.mes = 11 THEN dv.entregado ELSE 0 END), 0) AS NOVIEMBRE,
    FORMAT(SUM(CASE WHEN dv.mes = 12 THEN dv.entregado ELSE 0 END), 0) AS DICIEMBRE
FROM
    etl_clientes c
INNER JOIN
    etl_detalle_venta dv ON c.fc_rif = dv.rif
WHERE
    dv.ano = ?
GROUP BY
    c.fc_descripcion, c.fc_codigo
HAVING
    SUM(dv.entregado) > 0
ORDER BY
    c.fc_descripcion;";

// Preparar la consulta para evitar inyección SQL
$stmt = mysqli_prepare($enlace_local, $query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al preparar la consulta: ' . mysqli_error($enlace_local)]);
    mysqli_close($enlace_local);
    exit();
}

// Vincular el parámetro del año
mysqli_stmt_bind_param($stmt, "i", $ano);

// Ejecutar la consulta
mysqli_stmt_execute($stmt);
$consulta = mysqli_stmt_get_result($stmt);

if (!$consulta) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
    mysqli_stmt_close($stmt);
    mysqli_close($enlace_local);
    exit();
}

if (mysqli_num_rows($consulta) > 0) {
    while ($row = mysqli_fetch_assoc($consulta)) {
        $response[] = $row;
    }
}

// Agregar información del año consultado en la respuesta
$result = [
    'ano_consultado' => $ano,
    'data' => $response
];

echo json_encode($result);

mysqli_stmt_close($stmt);
mysqli_close($enlace_local);
