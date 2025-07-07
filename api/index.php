<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

$query = "SELECT
    T0.fc_descripcion AS CLIENTE,
    T0.fc_codigo AS CODIGO,
    YEAR(T1.b) AS AÑO,
    COALESCE(CONCAT('$', FORMAT(SUM(T1.monto_fact / T1.tasa), 2)), '$0.00') AS \"TOTAL CXC DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN T1.b >= CURDATE() THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"NO VENCIDO DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"VENCIDO 1-5 DIAS DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"VENCIDO 6-15 DIAS DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"VENCIDO 16-30 DIAS DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"VENCIDO 31-60 DIAS DÓLARES\",
    COALESCE(CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)), '$0.00') AS \"VENCIDO >60 DIAS DÓLARES\",
    COALESCE(FORMAT(AVG(T1.tasa), 4), '') AS \"TASA PROMEDIO\"
FROM `etl_clientes` T0
LEFT JOIN `etl_cxc` T1 ON T0.fc_codigo = T1.rif
GROUP BY
    T0.fc_descripcion, T0.fc_codigo, YEAR(T1.b)

UNION ALL

-- Fila de TOTALES al pie
SELECT
    'TOTALES' AS CLIENTE,
    '' AS CODIGO,
    '' AS AÑO,
    CONCAT('$', FORMAT(SUM(T1.monto_fact / T1.tasa), 2)) AS \"TOTAL CXC DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN T1.b >= CURDATE() THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"NO VENCIDO DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"VENCIDO 1-5 DIAS DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"VENCIDO 6-15 DIAS DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"VENCIDO 16-30 DIAS DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"VENCIDO 31-60 DIAS DÓLARES\",
    CONCAT('$', FORMAT(SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 THEN T1.monto_fact / T1.tasa ELSE 0 END), 2)) AS \"VENCIDO >60 DIAS DÓLARES\",
    CONCAT('$', FORMAT(AVG(T1.tasa), 4)) AS \"TASA PROMEDIO\"
FROM `etl_cxc` T1;";

$consulta = mysqli_query($enlace_local, $query);

if (!$consulta) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
    mysqli_close($enlace_local);
    exit();
}

if (mysqli_num_rows($consulta) > 0) {
    while ($row = mysqli_fetch_assoc($consulta)) {
        $response[] = $row;
    }
}

echo json_encode($response);

mysqli_close($enlace_local);
