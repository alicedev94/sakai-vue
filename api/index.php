<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Be cautious with '*' in production environments
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_connect.php'; // Ensure this file correctly connects to your database

$response = array();

// Obtener el año desde los parámetros GET
// Si no se envía o es 0, mostrar todos los años acumulados
$ano = isset($_GET['ano']) ? intval($_GET['ano']) : 0;

if ($ano == 0) {
    // TODOS LOS AÑOS ACUMULADOS (sin filtro de año de emisión)
    // USAR saldo_us DIRECTAMENTE (igual que el reporte de producción)
    $query = "SELECT
    T0.fc_descripcion AS CLIENTE,
    T0.fc_codigo AS CODIGO,
    COALESCE(CONCAT('$', FORMAT(SUM(T1.saldo_us), 2)), '$0.00') AS \"TOTAL CXC DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.b >= CURDATE() THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"NO VENCIDO DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 1-5 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 6-15 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 16-30 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 31-60 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO >60 DIAS DÓLARES\",

    COALESCE(FORMAT(AVG(CASE WHEN T1.tasa > 0 THEN T1.tasa END), 4), '0.0000') AS \"TASA PROMEDIO\",

    CASE
        WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 0 THEN T1.saldo_us ELSE 0 END) > 0
        THEN 'VENCIDO'
        ELSE 'AL DIA'
    END AS STATUS

FROM `etl_cxc` T1
INNER JOIN `etl_clientes` T0 ON T1.rif = T0.fc_codigo
WHERE T1.saldo_fact IS NOT NULL
  AND T1.saldo_fact > 0
GROUP BY T0.fc_codigo, T0.fc_descripcion
HAVING SUM(T1.saldo_us) > 0
ORDER BY T0.fc_codigo";

    $consulta = mysqli_query($enlace_local, $query);
    
    if (!$consulta) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_error($enlace_local)]);
        mysqli_close($enlace_local);
        exit();
    }
    
} else {
    // FILTRAR POR AÑO ESPECÍFICO DE EMISIÓN (campo 'a')
    // USAR saldo_us DIRECTAMENTE (igual que el reporte de producción)
    $query = "SELECT
    T0.fc_descripcion AS CLIENTE,
    T0.fc_codigo AS CODIGO,
    COALESCE(CONCAT('$', FORMAT(SUM(T1.saldo_us), 2)), '$0.00') AS \"TOTAL CXC DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN T1.b >= CURDATE() THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"NO VENCIDO DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 1-5 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 6-15 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 16-30 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO 31-60 DIAS DÓLARES\",

    COALESCE(CONCAT('$', FORMAT(SUM(
        CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 THEN T1.saldo_us ELSE 0 END
    ), 2)), '$0.00') AS \"VENCIDO >60 DIAS DÓLARES\",

    COALESCE(FORMAT(AVG(CASE WHEN T1.tasa > 0 THEN T1.tasa END), 4), '0.0000') AS \"TASA PROMEDIO\",

    CASE
        WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 0 THEN T1.saldo_us ELSE 0 END) > 0
        THEN 'VENCIDO'
        ELSE 'AL DIA'
    END AS STATUS

FROM `etl_cxc` T1
INNER JOIN `etl_clientes` T0 ON T1.rif = T0.fc_codigo
WHERE T1.saldo_fact IS NOT NULL
  AND T1.saldo_fact > 0
  AND YEAR(T1.a) = ?
GROUP BY T0.fc_codigo, T0.fc_descripcion
HAVING SUM(T1.saldo_us) > 0
ORDER BY T0.fc_codigo";

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
        echo json_encode(['error' => 'Error al ejecutar la consulta: ' . mysqli_stmt_error($stmt)]);
        mysqli_stmt_close($stmt);
        mysqli_close($enlace_local);
        exit();
    }
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
    'ano_consultado' => $ano == 0 ? 'TODOS' : $ano,
    'total_registros' => count($data),
    'fecha_consulta' => date('Y-m-d H:i:s'),
    'data' => $data
];

echo json_encode($response);

if (isset($stmt)) {
    mysqli_stmt_close($stmt);
}
mysqli_close($enlace_local);
