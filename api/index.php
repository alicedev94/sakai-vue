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
    -- Monto en BOLÍVARES
    T1.monto_fact AS \"TOTAL CUENTAS POR COBRAR\",
    -- Clasificación de vencimiento en BOLÍVARES
    CASE WHEN T1.b >= CURDATE() THEN T1.monto_fact ELSE 0 END AS \"NO VENCIDO\",
    CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 THEN T1.monto_fact ELSE 0 END AS \"VENCIDO 1-5 DIAS\",
    CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 THEN T1.monto_fact ELSE 0 END AS \"VENCIDO 6-15 DIAS\",
    CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 THEN T1.monto_fact ELSE 0 END AS \"VENCIDO 16-30 DIAS\",
    CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 THEN T1.monto_fact ELSE 0 END AS \"VENCIDO 31-60 DIAS\",
    CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 THEN T1.monto_fact ELSE 0 END AS \"VENCIDO >60 DIAS\",
    -- Monto en DÓLARES (convertido con la tasa de la transacción)
    ROUND(T1.monto_fact / T1.tasa, 2) AS \"TOTAL DÓLARES\",
    T1.tasa AS \"TASA\"
FROM etl_clientes T0
INNER JOIN etl_cxc T1 ON T0.fc_codigo = T1.rif;";

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

?>      