<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

import axios from 'axios';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

const dt = ref();
const items = ref([]);
const rawItems = ref([]); // Items sin procesar
const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const loading = ref(false);
const selectedYear = ref(0); // 0 = TODOS los años
const consultedYear = ref('TODOS');

// Generar años para el dropdown (desde 2020 hasta año actual + 2)
const availableYears = ref([
    { label: 'Todos los años', value: 0 }
]);
const currentYear = new Date().getFullYear();
for (let year = 2020; year <= currentYear + 2; year++) {
    availableYears.value.push({ label: year.toString(), value: year });
}

// Función para agrupar ventas al detal (en unidades)
function processItems(data) {
    const empresas = []; // J
    const ventasDetalle = []; // E, V
    
    data.forEach(item => {
        const codigo = item.CODIGO || '';
        if (codigo.startsWith('J')) {
            empresas.push(item);
        } else if (codigo.startsWith('E') || codigo.startsWith('V')) {
            ventasDetalle.push(item);
        } else {
            // Si no empieza con J, E o V, lo tratamos como empresa
            empresas.push(item);
        }
    });
    
    // Agrupar ventas al detalle
    let ventasDetalAgrupadas = null;
    if (ventasDetalle.length > 0) {
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                       'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        
        ventasDetalAgrupadas = {
            CLIENTE: 'VENTAS AL DETAL',
            CODIGO: 'DETAL',
            AÑO: ventasDetalle[0]?.AÑO || '',
            'TOTAL AÑO': '0'
        };
        
        let totalAnual = 0;
        
        // Sumar cada mes (unidades)
        meses.forEach(mes => {
            let totalMes = 0;
            ventasDetalle.forEach(item => {
                const valor = item[mes] || '0';
                const numero = parseFloat(valor.toString().replace(/,/g, ''));
                totalMes += numero;
            });
            ventasDetalAgrupadas[mes] = totalMes.toLocaleString('en-US', { minimumFractionDigits: 0 });
            totalAnual += totalMes;
        });
        
        ventasDetalAgrupadas['TOTAL AÑO'] = totalAnual.toLocaleString('en-US', { minimumFractionDigits: 0 });
    }
    
    // Combinar: empresas primero, luego ventas al detal agrupadas
    const resultado = [...empresas];
    if (ventasDetalAgrupadas) {
        resultado.push(ventasDetalAgrupadas);
    }
    
    return resultado;
}

async function getItems(year = selectedYear.value) {
    try {
        loading.value = true;
        const { data: response } = await axios.get(`/cPanelTestPHP_1/api/ventas-unidades.php?ano=${year}`);

        // La respuesta ahora incluye año consultado y datos
        rawItems.value = response.data || [];
        items.value = processItems(rawItems.value);
        consultedYear.value = response.ano_consultado || year;
    } catch (error) {
        console.log('Error al obtener datos:', error.message);
        rawItems.value = [];
        items.value = [];
    } finally {
        loading.value = false;
    }
}

async function filterByYear() {
    await getItems(selectedYear.value);
}

// Función para aplicar clase CSS especial a ventas al detal
function rowClass(data) {
    return data.CODIGO === 'DETAL' ? 'ventas-detal-row' : '';
}

onMounted(async () => {
    await getItems();
});
</script>

<template>
    <div class="card">
        <DataTable
            ref="dt"
            v-model:selection="selectedItems"
            :value="items"
            dataKey="CODIGO"
            :paginator="true"
            :rows="15"
            :filters="filters"
            :loading="loading"
            :rowClass="rowClass"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[15, 25, 50, 100]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ítems"
            responsiveLayout="scroll"
            stripedRows
            :showGridlines="true"
        >
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <h4 class="m-0">VENTAS POR UNIDADES - AÑO {{ consultedYear }}</h4>

                    <div class="flex gap-3 items-center">
                        <!-- Filtro por año -->
                        <div class="flex items-center gap-2">
                            <label for="year-dropdown" class="font-semibold">Año:</label>
                            <Dropdown id="year-dropdown" v-model="selectedYear" :options="availableYears" optionLabel="label" optionValue="value" placeholder="Seleccionar año" class="w-32" />
                            <Button label="Filtrar" icon="pi pi-search" @click="filterByYear" :loading="loading" size="small" />
                        </div>

                        <!-- Búsqueda global -->
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar cliente..." />
                        </IconField>
                    </div>
                </div>
            </template>

            <template #loading>
                <div class="flex justify-content-center align-items-center">
                    <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="CLIENTE" header="Cliente" sortable style="min-width: 15rem" frozen></Column>
            <Column field="CODIGO" header="Código" sortable style="min-width: 8rem" frozen></Column>
            <Column field="AÑO" header="Año" sortable style="min-width: 6rem"></Column>
            <Column field="TOTAL AÑO" header="Total Unidades" sortable style="min-width: 12rem" class="font-bold units-column"></Column>
            <Column field="ENERO" header="Enero" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="FEBRERO" header="Febrero" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="MARZO" header="Marzo" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="ABRIL" header="Abril" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="MAYO" header="Mayo" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="JUNIO" header="Junio" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="JULIO" header="Julio" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="AGOSTO" header="Agosto" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="SEPTIEMBRE" header="Septiembre" sortable style="min-width: 12rem" class="units-column"></Column>
            <Column field="OCTUBRE" header="Octubre" sortable style="min-width: 10rem" class="units-column"></Column>
            <Column field="NOVIEMBRE" header="Noviembre" sortable style="min-width: 12rem" class="units-column"></Column>
            <Column field="DICIEMBRE" header="Diciembre" sortable style="min-width: 12rem" class="units-column"></Column>
        </DataTable>
    </div>
</template>

<style scoped>
.card {
    padding: 1rem;
    background-color: var(--surface-card);
    border-radius: var(--border-radius);
    box-shadow: var(--surface-shadow);
}

.flex {
    display: flex;
}

.flex-wrap {
    flex-wrap: wrap;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.gap-2 {
    gap: 0.5rem;
}

.gap-3 {
    gap: 0.75rem;
}

.gap-4 {
    gap: 1rem;
}

.m-0 {
    margin: 0;
}

.w-32 {
    width: 8rem;
}

.font-semibold {
    font-weight: 600;
}

.font-bold {
    font-weight: bold;
}

.p-fluid .p-inputtext,
.p-fluid .p-inputicon .p-inputtext {
    width: 100%;
}

:deep(.p-inputtext) {
    height: 40px;
    transition: all 0.2s;
}

:deep(.p-dropdown) {
    height: 40px;
}

:deep(.p-button-sm) {
    height: 40px;
    padding: 0.5rem 1rem;
}

.flex.justify-content-center.align-items-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Destacar la columna de total anual */
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(5)) {
    background-color: var(--highlight-bg);
    font-weight: bold;
}

/* Estilo especial para la fila de Ventas al Detal */
:deep(.ventas-detal-row) {
    background: linear-gradient(90deg, #ffeaa7 0%, #fdcb6e 100%) !important;
    border-top: 3px solid #e17055;
    border-bottom: 3px solid #e17055;
}

:deep(.ventas-detal-row td) {
    color: #2d3436 !important;
    font-weight: 700 !important;
    font-size: 1.05em !important;
}

:deep(.ventas-detal-row:hover) {
    background: linear-gradient(90deg, #fdcb6e 0%, #fab1a0 100%) !important;
}

/* Estilo para columnas de unidades - alineación a la derecha */
:deep(.units-column .p-column-title) {
    text-align: center;
}

:deep(.p-datatable .p-datatable-tbody > tr > .units-column) {
    text-align: right;
    font-family: 'Courier New', monospace;
    color: var(--primary-color);
    font-weight: 500;
}

/* Fijar las primeras columnas */
:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(1)),
:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(2)),
:deep(.p-datatable .p-datatable-thead > tr > th:nth-child(3)) {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--surface-card);
}

:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(1)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(2)),
:deep(.p-datatable .p-datatable-tbody > tr > td:nth-child(3)) {
    position: sticky;
    left: 0;
    background: var(--surface-card);
}

/* Efectos hover para filas */
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: var(--surface-hover);
}

/* Estilo especial para valores cero */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    position: relative;
}

@media screen and (max-width: 768px) {
    .flex-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .gap-4 {
        gap: 1rem;
    }

    :deep(.units-column .p-column-title) {
        font-size: 0.85rem;
    }
}
</style>
