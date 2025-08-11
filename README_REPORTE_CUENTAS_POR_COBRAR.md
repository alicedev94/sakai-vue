# 📊 REPORTE DE CUENTAS POR COBRAR POR ANTIGÜEDAD

## Manual Técnico para el Cliente

---

## 🎯 **PROPÓSITO DEL REPORTE**

Este reporte genera un análisis completo de las **cuentas por cobrar** clasificadas por **antigüedad de vencimiento**, permitiendo:

-   ✅ Identificar clientes con pagos pendientes
-   ✅ Clasificar deudas por días de vencimiento
-   ✅ Convertir montos a dólares usando tasas históricas
-   ✅ Priorizar acciones de cobranza
-   ✅ Analizar la salud financiera de la cartera

---

## 🏗️ **ESTRUCTURA DE DATOS**

### **Tablas Involucradas:**

1. **`etl_clientes`** (T0): Maestro de clientes

    - `fc_descripcion`: Nombre del cliente
    - `fc_codigo`: Código único del cliente
    - `fc_rif`: RIF del cliente

2. **`etl_cxc`** (T1): Cuentas por cobrar (facturas pendientes)
    - `rif`: RIF del cliente (para relacionar)
    - `monto_fact`: Monto de la factura en moneda local
    - `tasa`: Tasa de cambio del día de la factura
    - `b`: Fecha de vencimiento de la factura

---

## 🔗 **RELACIÓN ENTRE TABLAS**

```sql
FROM `etl_clientes` T0
LEFT JOIN `etl_cxc` T1 ON T0.fc_codigo = T1.rif
```

**📝 Explicación:**

-   **LEFT JOIN**: Trae TODOS los clientes, aunque no tengan facturas pendientes
-   **Relación**: `fc_codigo` del cliente = `rif` de la factura
-   **Resultado**: Cada cliente se conecta con todas sus facturas pendientes

---

## 🎯 **FILTROS APLICADOS**

```sql
WHERE T1.monto_fact IS NOT NULL     -- Solo facturas con monto válido
  AND T1.monto_fact > 0             -- Solo facturas con monto mayor a cero
  AND YEAR(T1.b) = ?                -- Solo facturas del año seleccionado
```

**📝 Explicación:**

-   Elimina registros con datos incompletos o inválidos
-   El **`?`** es un parámetro que se reemplaza por el año seleccionado (ej: 2024)
-   Garantiza que solo se analicen facturas reales del período solicitado

---

## 💰 **CONVERSIÓN A DÓLARES**

### **Fórmula Base:**

```sql
CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
```

**📝 Explicación:**

-   **Si la tasa es válida (> 0)**: Divide el monto local entre la tasa del día
-   **Si la tasa es inválida**: Asigna cero para evitar errores
-   **Cada factura** se convierte individualmente con su tasa histórica

### **Ejemplo Práctico:**

| Factura   | Monto Local   | Tasa del Día | Cálculo      | Monto USD   |
| --------- | ------------- | ------------ | ------------ | ----------- |
| FAC-001   | Bs. 1,000     | 36.50        | 1000÷36.50   | $27.40      |
| FAC-002   | Bs. 2,000     | 37.20        | 2000÷37.20   | $53.76      |
| FAC-003   | Bs. 1,500     | 35.80        | 1500÷35.80   | $41.90      |
| **TOTAL** | **Bs. 4,500** | **36.50**    | **SUMA USD** | **$123.06** |

> ⚠️ **IMPORTANTE**: NO se divide el total de bolívares entre la tasa promedio. Se suman los dólares ya convertidos individualmente.

---

## 📅 **CLASIFICACIÓN POR ANTIGÜEDAD**

### **Lógica de Vencimiento:**

```sql
DATEDIFF(CURDATE(), T1.b)
```

-   **CURDATE()**: Fecha de hoy
-   **T1.b**: Fecha de vencimiento de la factura
-   **Resultado**: Días transcurridos desde el vencimiento

### **Categorías de Vencimiento:**

#### **✅ NO VENCIDO**

```sql
CASE WHEN T1.b >= CURDATE() AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Fecha de vencimiento >= fecha de hoy
-   **Significado**: Facturas que aún no han vencido
-   **Acción**: Sin urgencia de cobranza

#### **⚠️ VENCIDO 1-5 DÍAS**

```sql
CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 1 AND 5 AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Entre 1 y 5 días vencidos
-   **Significado**: Vencimiento reciente
-   **Acción**: Recordatorio amigable

#### **⚠️ VENCIDO 6-15 DÍAS**

```sql
CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 6 AND 15 AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Entre 6 y 15 días vencidos
-   **Significado**: Vencimiento que requiere atención
-   **Acción**: Llamada de seguimiento

#### **🔶 VENCIDO 16-30 DÍAS**

```sql
CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 16 AND 30 AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Entre 16 y 30 días vencidos
-   **Significado**: Vencimiento preocupante
-   **Acción**: Gestión activa de cobranza

#### **🔴 VENCIDO 31-60 DÍAS**

```sql
CASE WHEN DATEDIFF(CURDATE(), T1.b) BETWEEN 31 AND 60 AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Entre 31 y 60 días vencidos
-   **Significado**: Cartera difícil
-   **Acción**: Medidas formales de cobro

#### **💀 VENCIDO MÁS DE 60 DÍAS**

```sql
CASE WHEN DATEDIFF(CURDATE(), T1.b) > 60 AND T1.tasa > 0
     THEN T1.monto_fact / T1.tasa ELSE 0 END
```

-   **Condición**: Más de 60 días vencidos
-   **Significado**: Cartera de alto riesgo
-   **Acción**: Acciones legales o provisiones

---

## 📊 **CÁLCULO DE TASA PROMEDIO**

```sql
COALESCE(FORMAT(AVG(CASE WHEN T1.tasa > 0 THEN T1.tasa END), 4), '0.0000') AS "TASA PROMEDIO"
```

**📝 Explicación:**

-   **AVG()**: Calcula el promedio de las tasas válidas
-   **CASE**: Solo incluye tasas mayores a cero
-   **FORMAT(,4)**: Muestra 4 decimales
-   **COALESCE**: Si no hay datos, muestra '0.0000'

> ⚠️ **IMPORTANTE**: Esta tasa es **SOLO INFORMATIVA** y NO se usa para ningún cálculo monetario.

---

## 🚦 **DETERMINACIÓN DEL STATUS**

```sql
CASE
    WHEN SUM(CASE WHEN DATEDIFF(CURDATE(), T1.b) > 0 AND T1.tasa > 0
               THEN T1.monto_fact / T1.tasa ELSE 0 END) > 0
    THEN 'VENCIDO'
    ELSE 'AL DIA'
END AS STATUS
```

**📝 Lógica:**

-   **Si el cliente tiene ANY factura vencida** → Status: **"VENCIDO"**
-   **Si todas las facturas están al día** → Status: **"AL DIA"**

---

## 🎨 **FORMATEO DE RESULTADOS**

### **Formato Monetario:**

```sql
COALESCE(CONCAT('$', FORMAT(SUM(...), 2)), '$0.00')
```

-   **CONCAT('$', ...)**: Agrega el símbolo de dólar
-   **FORMAT(..., 2)**: Formatea con 2 decimales y separadores de miles
-   **COALESCE(..., '$0.00')**: Si no hay datos, muestra '$0.00'

### **Ejemplo de Salida:**

-   `$1,234.56` (con separador de miles)
-   `$0.00` (cuando no hay montos)

---

## 📋 **AGRUPACIÓN DE DATOS**

```sql
GROUP BY T0.fc_descripcion, T0.fc_codigo, YEAR(T1.b)
```

**📝 Explicación:**

-   Agrupa todas las facturas de un cliente en una sola fila
-   Considera el año de las facturas
-   Suma todos los montos por categoría de vencimiento

### **Filtro Adicional:**

```sql
HAVING SUM(CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END) > 0
```

-   Solo muestra clientes con saldo mayor a cero en dólares
-   Elimina clientes sin deuda real

---

## 🧮 **FILA DE TOTALES**

```sql
UNION ALL

SELECT
    'TOTALES' AS CLIENTE,
    '' AS CODIGO,
    ? AS AÑO,
    -- Mismos cálculos pero SIN agrupar por cliente
```

**📝 Explicación:**

-   **UNION ALL**: Agrega una fila adicional al final
-   **'TOTALES'**: Identifica la fila de resumen
-   **Misma lógica**: Pero suma TODOS los clientes
-   **SIN GROUP BY**: Para obtener el gran total

---

## 🔄 **FLUJO COMPLETO DEL PROCESO**

### **Paso 1: Obtención de Datos**

1. Conecta clientes con sus facturas
2. Filtra por año y montos válidos
3. Obtiene fechas de vencimiento y tasas

### **Paso 2: Conversión Individual**

1. Cada factura se convierte a dólares con su tasa específica
2. Se valida que la tasa sea mayor a cero
3. Se calculan días de vencimiento

### **Paso 3: Clasificación**

1. Se evalúa cada factura según días vencidos
2. Se asigna a la categoría correspondiente
3. Se suma por cliente y categoría

### **Paso 4: Determinación de Status**

1. Si hay algún monto vencido → "VENCIDO"
2. Si no hay montos vencidos → "AL DIA"

### **Paso 5: Formateo Final**

1. Se aplica formato monetario ($X,XXX.XX)
2. Se calcula tasa promedio (informativa)
3. Se agrega fila de totales

---

## 📊 **EJEMPLO COMPLETO**

### **Datos de Entrada:**

Cliente: **EMPRESA ABC**

-   Factura A: Bs. 1,000 - Tasa: 36.50 - Vence: Hace 3 días
-   Factura B: Bs. 2,000 - Tasa: 37.00 - Vence: En 5 días
-   Factura C: Bs. 1,500 - Tasa: 36.00 - Vence: Hace 45 días

### **Proceso de Cálculo:**

1. **Conversión Individual:**

    - Factura A: 1,000 ÷ 36.50 = $27.40 (3 días vencido)
    - Factura B: 2,000 ÷ 37.00 = $54.05 (no vencido)
    - Factura C: 1,500 ÷ 36.00 = $41.67 (45 días vencido)

2. **Clasificación:**

    - NO VENCIDO: $54.05
    - VENCIDO 1-5 DÍAS: $27.40
    - VENCIDO 31-60 DÍAS: $41.67
    - TOTAL: $123.12

3. **Status:** "VENCIDO" (tiene facturas vencidas)
4. **Tasa Promedio:** (36.50 + 37.00 + 36.00) ÷ 3 = 36.50

### **Resultado Final:**

| Cliente     | Total CXC | No Vencido | Vencido 1-5 | Vencido 31-60 | Status  | Tasa Prom |
| ----------- | --------- | ---------- | ----------- | ------------- | ------- | --------- |
| EMPRESA ABC | $123.12   | $54.05     | $27.40      | $41.67        | VENCIDO | 36.50     |

---

## ✅ **VALIDACIONES Y CONTROLES DE CALIDAD**

### **Protección contra Errores:**

1. **División por cero**: Se valida `tasa > 0`
2. **Datos nulos**: Se filtran con `IS NOT NULL`
3. **Montos negativos**: Se filtran con `> 0`
4. **Fechas inválidas**: Se valida con `DATEDIFF`

### **Consistencia de Datos:**

1. **Todas las conversiones** usan la misma lógica
2. **Los totales** se calculan con la misma fórmula
3. **El formato** es consistente en toda la tabla

---

## 🎯 **INTERPRETACIÓN PARA TOMA DE DECISIONES**

### **Indicadores Clave:**

-   **Total CXC**: Exposición total del cliente
-   **Status VENCIDO**: Requiere acción inmediata
-   **Vencido >60 días**: Considerar provisiones
-   **No Vencido**: Flujo de caja esperado

### **Acciones Recomendadas:**

-   **Verde (No Vencido)**: Monitoreo normal
-   **Amarillo (1-15 días)**: Recordatorios
-   **Naranja (16-30 días)**: Llamadas de seguimiento
-   **Rojo (31-60 días)**: Gestión activa
-   **Morado (+60 días)**: Medidas especiales

---

## 🔧 **PARÁMETROS TÉCNICOS**

### **Entrada:**

-   **Año**: Parámetro obligatorio (ej: 2024)
-   **Validación**: Entre 2000 y 2050

### **Salida:**

-   **Formato JSON** con estructura estándar
-   **Campos monetarios** con formato $X,XXX.XX
-   **Status del cliente** en texto claro
-   **Totales generales** en fila especial

---

## 📞 **SOPORTE Y CONSULTAS**

Para cualquier duda sobre la lógica del reporte:

1. **Revisar este documento** para entender la metodología
2. **Validar datos de entrada** en las tablas base
3. **Verificar parámetros** de año seleccionado
4. **Contactar al desarrollador** para casos especiales

---

_Documento actualizado: Diciembre 2024_
_Versión del sistema: 2.0_
