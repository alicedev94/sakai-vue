<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

// QUERY ACTUALIZADO - SIN FILTRO DE AÑO - MUESTRA TODOS LOS MONTOS ACUMULADOS
$query = "SELECT
    T0.fc_descripcion AS CLIENTE,
    T0.fc_codigo AS CODIGO,
    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"TOTAL CXC DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.b >= CURDATE() AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"NO VENCIDO DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 1-5 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 6-15 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 16-30 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 31-60 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO >60 DIAS DÓLARES\",

    COALESCE(FORMAT(AVG(CASE WHEN T1.tasa > 0 THEN T1.tasa END), 4), '0.0000') AS \"TASA PROMEDIO\",

    CASE
        WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 0 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END) > 0
        THEN 'VENCIDO'
        ELSE 'AL DIA'
    END AS STATUS

FROM `etl_clientes` T0
LEFT JOIN `etl_cxc` T1 ON T0.fc_codigo = T1.rif
WHERE T1.monto_fact IS NOT NULL
  AND T1.monto_fact > 0
GROUP BY T0.fc_descripcion, T0.fc_codigo
HAVING SUM(CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END) > 0

UNION ALL

SELECT
    'TOTALES' AS CLIENTE,
    '' AS CODIGO,
    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"TOTAL CXC DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.b >= CURDATE() AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"NO VENCIDO DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 1-5 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 6-15 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 16-30 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 31-60 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 AND T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO >60 DIAS DÓLARES\",

    COALESCE(FORMAT(AVG(CASE WHEN T1.tasa > 0 THEN T1.tasa END), 4), '0.0000') AS \"TASA PROMEDIO\",

    'RESUMEN' AS STATUS

FROM `etl_cxc` T1
WHERE T1.monto_fact IS NOT NULL
  AND T1.monto_fact > 0
  AND T1.tasa > 0";

// Ejecutar la consulta directamente (sin parámetros preparados)
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
