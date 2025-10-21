<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

// QUERY BASADO EN LA TABLA etl_ventas_mes DEL CLIENTE
// Muestra totales generales por mes (no por cliente)
$query = "SELECT 
    ano AS AÑO,
    mes AS MES,
    CONCAT(ano, '-', LPAD(mes, 2, '0')) AS \"AÑO-MES\",
    FORMAT(total, 0) AS \"TOTAL UNIDADES\",
    CONCAT('$', FORMAT(total_us, 2)) AS \"TOTAL US$\",
    CONCAT('$', FORMAT(total_us / NULLIF(total, 0), 2)) AS \"US$ PROMEDIO\"
FROM etl_ventas_mes 
ORDER BY ano ASC, mes ASC";

// Ejecutar la consulta directamente
$consulta = mysqli_query($enlace_local, $query);

if (!$consulta) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
    mysqli_close($enlace_local);
    exit();
}

$data = [];

if (mysqli_num_rows($consulta) > 0) {
    while ($row = mysqli_fetch_assoc($consulta)) {
        $data[] = $row;
    }
}

// Estructurar respuesta
$response = [
    'success' => true,
    'total_registros' => count($data),
    'fecha_consulta' => date('Y-m-d H:i:s'),
    'data' => $data
];

echo json_encode($response);

mysqli_close($enlace_local);

