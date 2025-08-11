# 📋 EJEMPLO PRÁCTICO PASO A PASO

## Reporte de Cuentas por Cobrar - Caso Real

---

## 🏢 **ESCENARIO DE EJEMPLO**

Supongamos que es **20 de Diciembre de 2024** y queremos generar el reporte para el año 2024.

### **Datos de Clientes:**

```sql
-- Tabla: etl_clientes
| fc_codigo | fc_descripcion        | fc_rif        |
|-----------|----------------------|---------------|
| C001      | EMPRESA ALPHA        | J-12345678-0  |
| C002      | DISTRIBUIDORA BETA   | J-87654321-0  |
| C003      | COMERCIAL GAMMA      | J-11223344-0  |
```

### **Datos de Facturas:**

```sql
-- Tabla: etl_cxc
| rif          | monto_fact | tasa   | fecha_venc (b) | factura  |
|--------------|------------|--------|----------------|----------|
| J-12345678-0 | 3650.00    | 36.50  | 2024-12-15     | FAC-001  |
| J-12345678-0 | 7400.00    | 37.00  | 2024-12-25     | FAC-002  |
| J-12345678-0 | 5400.00    | 36.00  | 2024-11-05     | FAC-003  |
| J-87654321-0 | 1850.00    | 37.20  | 2024-12-22     | FAC-004  |
| J-87654321-0 | 2960.00    | 37.40  | 2024-10-15     | FAC-005  |
| J-11223344-0 | 4440.00    | 37.00  | 2024-12-30     | FAC-006  |
```

---

## 🔍 **PASO 1: ANÁLISIS POR CLIENTE**

### **🏢 EMPRESA ALPHA (C001)**

#### **Facturas Individuales:**

| Factura | Monto Local | Tasa  | Vencimiento | Días | Status             |
| ------- | ----------- | ----- | ----------- | ---- | ------------------ |
| FAC-001 | Bs. 3,650   | 36.50 | 15-Dic-2024 | +5   | VENCIDO 1-5 DÍAS   |
| FAC-002 | Bs. 7,400   | 37.00 | 25-Dic-2024 | -5   | NO VENCIDO         |
| FAC-003 | Bs. 5,400   | 36.00 | 05-Nov-2024 | +45  | VENCIDO 31-60 DÍAS |

#### **Conversión a Dólares:**

```
FAC-001: 3,650 ÷ 36.50 = $100.00
FAC-002: 7,400 ÷ 37.00 = $200.00
FAC-003: 5,400 ÷ 36.00 = $150.00
```

#### **Clasificación por Antigüedad:**

-   **NO VENCIDO**: $200.00 (FAC-002)
-   **VENCIDO 1-5 DÍAS**: $100.00 (FAC-001)
-   **VENCIDO 6-15 DÍAS**: $0.00
-   **VENCIDO 16-30 DÍAS**: $0.00
-   **VENCIDO 31-60 DÍAS**: $150.00 (FAC-003)
-   **VENCIDO >60 DÍAS**: $0.00

#### **Resultado EMPRESA ALPHA:**

```
TOTAL CXC: $450.00
STATUS: VENCIDO (tiene facturas vencidas)
TASA PROMEDIO: (36.50 + 37.00 + 36.00) ÷ 3 = 36.50
```

---

### **🏢 DISTRIBUIDORA BETA (C002)**

#### **Facturas Individuales:**

| Factura | Monto Local | Tasa  | Vencimiento | Días | Status           |
| ------- | ----------- | ----- | ----------- | ---- | ---------------- |
| FAC-004 | Bs. 1,850   | 37.20 | 22-Dic-2024 | -2   | NO VENCIDO       |
| FAC-005 | Bs. 2,960   | 37.40 | 15-Oct-2024 | +66  | VENCIDO >60 DÍAS |

#### **Conversión a Dólares:**

```
FAC-004: 1,850 ÷ 37.20 = $49.73
FAC-005: 2,960 ÷ 37.40 = $79.14
```

#### **Clasificación por Antigüedad:**

-   **NO VENCIDO**: $49.73 (FAC-004)
-   **VENCIDO 1-5 DÍAS**: $0.00
-   **VENCIDO 6-15 DÍAS**: $0.00
-   **VENCIDO 16-30 DÍAS**: $0.00
-   **VENCIDO 31-60 DÍAS**: $0.00
-   **VENCIDO >60 DÍAS**: $79.14 (FAC-005)

#### **Resultado DISTRIBUIDORA BETA:**

```
TOTAL CXC: $128.87
STATUS: VENCIDO (tiene facturas >60 días)
TASA PROMEDIO: (37.20 + 37.40) ÷ 2 = 37.30
```

---

### **🏢 COMERCIAL GAMMA (C003)**

#### **Facturas Individuales:**

| Factura | Monto Local | Tasa  | Vencimiento | Días | Status     |
| ------- | ----------- | ----- | ----------- | ---- | ---------- |
| FAC-006 | Bs. 4,440   | 37.00 | 30-Dic-2024 | -10  | NO VENCIDO |

#### **Conversión a Dólares:**

```
FAC-006: 4,440 ÷ 37.00 = $120.00
```

#### **Clasificación por Antigüedad:**

-   **NO VENCIDO**: $120.00 (FAC-006)
-   **VENCIDO 1-5 DÍAS**: $0.00
-   **VENCIDO 6-15 DÍAS**: $0.00
-   **VENCIDO 16-30 DÍAS**: $0.00
-   **VENCIDO 31-60 DÍAS**: $0.00
-   **VENCIDO >60 DÍAS**: $0.00

#### **Resultado COMERCIAL GAMMA:**

```
TOTAL CXC: $120.00
STATUS: AL DIA (no tiene facturas vencidas)
TASA PROMEDIO: 37.00
```

---

## 📊 **PASO 2: CONSOLIDACIÓN GENERAL**

### **Totales por Categoría:**

-   **TOTAL CXC**: $450.00 + $128.87 + $120.00 = $698.87
-   **NO VENCIDO**: $200.00 + $49.73 + $120.00 = $369.73
-   **VENCIDO 1-5 DÍAS**: $100.00 + $0.00 + $0.00 = $100.00
-   **VENCIDO 6-15 DÍAS**: $0.00 + $0.00 + $0.00 = $0.00
-   **VENCIDO 16-30 DÍAS**: $0.00 + $0.00 + $0.00 = $0.00
-   **VENCIDO 31-60 DÍAS**: $150.00 + $0.00 + $0.00 = $150.00
-   **VENCIDO >60 DÍAS**: $0.00 + $79.14 + $0.00 = $79.14

### **Tasa Promedio General:**

```
(36.50 + 37.00 + 36.00 + 37.20 + 37.40 + 37.00) ÷ 6 = 36.85
```

---

## 🖥️ **PASO 3: RESULTADO FINAL DEL QUERY**

### **Salida del Sistema:**

```json
{
    "success": true,
    "ano_consultado": 2024,
    "total_registros": 4,
    "fecha_consulta": "2024-12-20 10:30:00",
    "data": [
        {
            "CLIENTE": "EMPRESA ALPHA",
            "CODIGO": "C001",
            "AÑO": 2024,
            "TOTAL CXC DÓLARES": "$450.00",
            "NO VENCIDO DÓLARES": "$200.00",
            "VENCIDO 1-5 DIAS DÓLARES": "$100.00",
            "VENCIDO 6-15 DIAS DÓLARES": "$0.00",
            "VENCIDO 16-30 DIAS DÓLARES": "$0.00",
            "VENCIDO 31-60 DIAS DÓLARES": "$150.00",
            "VENCIDO >60 DIAS DÓLARES": "$0.00",
            "TASA PROMEDIO": "36.5000",
            "STATUS": "VENCIDO"
        },
        {
            "CLIENTE": "DISTRIBUIDORA BETA",
            "CODIGO": "C002",
            "AÑO": 2024,
            "TOTAL CXC DÓLARES": "$128.87",
            "NO VENCIDO DÓLARES": "$49.73",
            "VENCIDO 1-5 DIAS DÓLARES": "$0.00",
            "VENCIDO 6-15 DIAS DÓLARES": "$0.00",
            "VENCIDO 16-30 DIAS DÓLARES": "$0.00",
            "VENCIDO 31-60 DIAS DÓLARES": "$0.00",
            "VENCIDO >60 DIAS DÓLARES": "$79.14",
            "TASA PROMEDIO": "37.3000",
            "STATUS": "VENCIDO"
        },
        {
            "CLIENTE": "COMERCIAL GAMMA",
            "CODIGO": "C003",
            "AÑO": 2024,
            "TOTAL CXC DÓLARES": "$120.00",
            "NO VENCIDO DÓLARES": "$120.00",
            "VENCIDO 1-5 DIAS DÓLARES": "$0.00",
            "VENCIDO 6-15 DIAS DÓLARES": "$0.00",
            "VENCIDO 16-30 DIAS DÓLARES": "$0.00",
            "VENCIDO 31-60 DIAS DÓLARES": "$0.00",
            "VENCIDO >60 DIAS DÓLARES": "$0.00",
            "TASA PROMEDIO": "37.0000",
            "STATUS": "AL DIA"
        },
        {
            "CLIENTE": "TOTALES",
            "CODIGO": "",
            "AÑO": 2024,
            "TOTAL CXC DÓLARES": "$698.87",
            "NO VENCIDO DÓLARES": "$369.73",
            "VENCIDO 1-5 DIAS DÓLARES": "$100.00",
            "VENCIDO 6-15 DIAS DÓLARES": "$0.00",
            "VENCIDO 16-30 DIAS DÓLARES": "$0.00",
            "VENCIDO 31-60 DIAS DÓLARES": "$150.00",
            "VENCIDO >60 DIAS DÓLARES": "$79.14",
            "TASA PROMEDIO": "36.8500",
            "STATUS": "RESUMEN"
        }
    ]
}
```

---

## 📈 **PASO 4: INTERPRETACIÓN GERENCIAL**

### **🎯 Análisis por Cliente:**

#### **🔴 EMPRESA ALPHA - ATENCIÓN REQUERIDA**

-   **Exposición**: $450.00 (64% del total)
-   **Riesgo**: $250.00 vencidos ($100 + $150)
-   **Acción**: Contactar inmediatamente por FAC-003 (45 días)

#### **⚠️ DISTRIBUIDORA BETA - RIESGO ALTO**

-   **Exposición**: $128.87 (18% del total)
-   **Riesgo**: $79.14 en cartera incobrable (+60 días)
-   **Acción**: Evaluar provisión para FAC-005

#### **✅ COMERCIAL GAMMA - CLIENTE SANO**

-   **Exposición**: $120.00 (17% del total)
-   **Riesgo**: $0.00 (todo al día)
-   **Acción**: Monitoreo normal

### **📊 Resumen Ejecutivo:**

-   **Cartera Total**: $698.87
-   **Cartera Sana**: $369.73 (53%)
-   **Cartera Vencida**: $329.14 (47%)
-   **Cartera de Alto Riesgo**: $79.14 (11%)

---

## 🔍 **VALIDACIÓN DE CÁLCULOS**

### **Verificación Manual:**

#### **1. Conversión Individual Correcta:**

```
✅ FAC-001: 3,650 ÷ 36.50 = 100.00 ✓
✅ FAC-002: 7,400 ÷ 37.00 = 200.00 ✓
✅ FAC-003: 5,400 ÷ 36.00 = 150.00 ✓
✅ FAC-004: 1,850 ÷ 37.20 = 49.73 ✓
✅ FAC-005: 2,960 ÷ 37.40 = 79.14 ✓
✅ FAC-006: 4,440 ÷ 37.00 = 120.00 ✓
```

#### **2. Suma de Totales:**

```
✅ 100.00 + 200.00 + 150.00 + 49.73 + 79.14 + 120.00 = 698.87 ✓
```

#### **3. Clasificación por Días:**

```
✅ NO VENCIDO: 200.00 + 49.73 + 120.00 = 369.73 ✓
✅ VENCIDO 1-5: 100.00 ✓
✅ VENCIDO 31-60: 150.00 ✓
✅ VENCIDO >60: 79.14 ✓
```

#### **4. Status por Cliente:**

```
✅ EMPRESA ALPHA: Tiene vencidos → "VENCIDO" ✓
✅ DISTRIBUIDORA BETA: Tiene vencidos → "VENCIDO" ✓
✅ COMERCIAL GAMMA: Sin vencidos → "AL DIA" ✓
```

---

## 💡 **CASOS ESPECIALES MANEJADOS**

### **1. Tasa Cero o Nula:**

```sql
-- Si una factura tiene tasa = 0 o NULL
CASE WHEN T1.tasa > 0 THEN T1.monto_fact / T1.tasa ELSE 0 END
-- Resultado: $0.00 (no genera error)
```

### **2. Montos Negativos:**

```sql
WHERE T1.monto_fact > 0
-- Se excluyen automáticamente del reporte
```

### **3. Fechas Futuras:**

```sql
CASE WHEN T1.b >= CURDATE() THEN ...
-- Se clasifican como "NO VENCIDO"
```

### **4. Clientes sin Facturas:**

```sql
LEFT JOIN ... HAVING SUM(...) > 0
-- Se excluyen del reporte final
```

---

## 🚨 **ALERTAS AUTOMÁTICAS SUGERIDAS**

Basado en este ejemplo, el sistema podría generar:

### **🔴 Alertas Críticas:**

-   DISTRIBUIDORA BETA: $79.14 en cartera >60 días
-   EMPRESA ALPHA: $150.00 en rango 31-60 días

### **⚠️ Alertas de Seguimiento:**

-   EMPRESA ALPHA: $100.00 vencido hace 5 días

### **📞 Acciones Recomendadas:**

1. **Inmediata**: Llamar a EMPRESA ALPHA por FAC-003
2. **Esta semana**: Revisar política de crédito para DISTRIBUIDORA BETA
3. **Mensual**: Provisión del 50% para facturas >60 días

---

_Este ejemplo demuestra cómo el sistema convierte, clasifica y presenta la información de manera transparente y accionable para la gestión de cobranzas._
