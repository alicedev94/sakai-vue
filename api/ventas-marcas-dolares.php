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
    p.fi_marca AS MARCA,
    $ano AS AÑO,
    CONCAT('$', FORMAT(SUM(dv.monto_us_venta), 2)) AS \"TOTAL AÑO\",
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 1 THEN dv.monto_us_venta ELSE 0 END), 2)) AS ENERO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 2 THEN dv.monto_us_venta ELSE 0 END), 2)) AS FEBRERO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 3 THEN dv.monto_us_venta ELSE 0 END), 2)) AS MARZO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 4 THEN dv.monto_us_venta ELSE 0 END), 2)) AS ABRIL,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 5 THEN dv.monto_us_venta ELSE 0 END), 2)) AS MAYO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 6 THEN dv.monto_us_venta ELSE 0 END), 2)) AS JUNIO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 7 THEN dv.monto_us_venta ELSE 0 END), 2)) AS JULIO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 8 THEN dv.monto_us_venta ELSE 0 END), 2)) AS AGOSTO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 9 THEN dv.monto_us_venta ELSE 0 END), 2)) AS SEPTIEMBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 10 THEN dv.monto_us_venta ELSE 0 END), 2)) AS OCTUBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 11 THEN dv.monto_us_venta ELSE 0 END), 2)) AS NOVIEMBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 12 THEN dv.monto_us_venta ELSE 0 END), 2)) AS DICIEMBRE
FROM
    etl_productos p
INNER JOIN
    etl_detalle_venta dv ON p.fi_modelo = dv.filtro
WHERE
    dv.ano = ?
    AND p.fi_marca IS NOT NULL
    AND p.fi_marca != ''
GROUP BY
    p.fi_marca
HAVING
    SUM(dv.monto_us_venta) > 0

UNION ALL

-- Fila de TOTALES al pie
SELECT
    'TOTALES' AS MARCA,
    $ano AS AÑO,
    CONCAT('$', FORMAT(SUM(dv.monto_us_venta), 2)) AS \"TOTAL AÑO\",
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 1 THEN dv.monto_us_venta ELSE 0 END), 2)) AS ENERO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 2 THEN dv.monto_us_venta ELSE 0 END), 2)) AS FEBRERO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 3 THEN dv.monto_us_venta ELSE 0 END), 2)) AS MARZO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 4 THEN dv.monto_us_venta ELSE 0 END), 2)) AS ABRIL,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 5 THEN dv.monto_us_venta ELSE 0 END), 2)) AS MAYO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 6 THEN dv.monto_us_venta ELSE 0 END), 2)) AS JUNIO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 7 THEN dv.monto_us_venta ELSE 0 END), 2)) AS JULIO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 8 THEN dv.monto_us_venta ELSE 0 END), 2)) AS AGOSTO,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 9 THEN dv.monto_us_venta ELSE 0 END), 2)) AS SEPTIEMBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 10 THEN dv.monto_us_venta ELSE 0 END), 2)) AS OCTUBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 11 THEN dv.monto_us_venta ELSE 0 END), 2)) AS NOVIEMBRE,
    CONCAT('$', FORMAT(SUM(CASE WHEN dv.mes = 12 THEN dv.monto_us_venta ELSE 0 END), 2)) AS DICIEMBRE
FROM
    etl_productos p
INNER JOIN
    etl_detalle_venta dv ON p.fi_modelo = dv.filtro
WHERE
    dv.ano = ?
    AND p.fi_marca IS NOT NULL
    AND p.fi_marca != ''

ORDER BY
    CASE WHEN MARCA = 'TOTALES' THEN 1 ELSE 0 END,
    MARCA;";

// Preparar la consulta para evitar inyección SQL
$stmt = mysqli_prepare($enlace_local, $query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al preparar la consulta: ' . mysqli_error($enlace_local)]);
    mysqli_close($enlace_local);
    exit();
}

// Vincular los parámetros del año (se usa dos veces en la consulta)
mysqli_stmt_bind_param($stmt, "ii", $ano, $ano);

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
    'titulo' => 'VENTAS POR MARCA POR MES DÓLARES',
    'data' => $response
];

echo json_encode($result);

mysqli_stmt_close($stmt);
mysqli_close($enlace_local);
