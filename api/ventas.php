<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

// Obtener el año desde los parámetros GET
// Si no se envía o es 0, mostrar todos los años
$ano = isset($_GET['ano']) ? intval($_GET['ano']) : 0;

// CONSULTA CORREGIDA - LEFT JOIN para no perder datos
// Relación: etl_detalle_venta.rif = etl_clientes.fc_codigo
if ($ano == 0) {
    $query = "SELECT
        COALESCE(c.fc_codigo, dv.rif, 'SIN RIF') AS CODIGO,
        COALESCE(c.fc_descripcion, dv.rif, 'SIN CLIENTE') AS CLIENTE,
        'TODOS' AS AÑO,
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
        etl_detalle_venta dv
    LEFT JOIN
        etl_clientes c ON dv.rif = c.fc_codigo
    GROUP BY
        dv.rif, c.fc_codigo, c.fc_descripcion
    HAVING
        SUM(dv.monto_us_venta) > 0
    ORDER BY
        COALESCE(c.fc_descripcion, dv.rif)";
    
    $consulta = mysqli_query($enlace_local, $query);
    
    if (!$consulta) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
        mysqli_close($enlace_local);
        exit();
    }
    
} else {
    // Consultar por año específico
    $query = "SELECT
        COALESCE(c.fc_codigo, dv.rif, 'SIN RIF') AS CODIGO,
        COALESCE(c.fc_descripcion, dv.rif, 'SIN CLIENTE') AS CLIENTE,
        ? AS AÑO,
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
        etl_detalle_venta dv
    LEFT JOIN
        etl_clientes c ON dv.rif = c.fc_codigo
    WHERE
        dv.ano = ?
    GROUP BY
        dv.rif, c.fc_codigo, c.fc_descripcion
    HAVING
        SUM(dv.monto_us_venta) > 0
    ORDER BY
        COALESCE(c.fc_descripcion, dv.rif)";
    
    $stmt = mysqli_prepare($enlace_local, $query);
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al preparar la consulta: ' . mysqli_error($enlace_local)]);
        mysqli_close($enlace_local);
        exit();
    }
    
    mysqli_stmt_bind_param($stmt, "ii", $ano, $ano);
    mysqli_stmt_execute($stmt);
    $consulta = mysqli_stmt_get_result($stmt);
    
    if (!$consulta) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
        mysqli_stmt_close($stmt);
        mysqli_close($enlace_local);
        exit();
    }
}

if (mysqli_num_rows($consulta) > 0) {
    while ($row = mysqli_fetch_assoc($consulta)) {
        $response[] = $row;
    }
}

// Agregar información del año consultado en la respuesta
$result = [
    'ano_consultado' => $ano == 0 ? 'TODOS' : $ano,
    'data' => $response
];

echo json_encode($result);

if (isset($stmt)) {
    mysqli_stmt_close($stmt);
}
mysqli_close($enlace_local);
