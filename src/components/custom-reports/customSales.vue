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
const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const consultedYear = ref(new Date().getFullYear());

// Generar años para el dropdown (desde 2020 hasta año actual + 2)
const availableYears = ref([]);
const currentYear = new Date().getFullYear();
for (let year = 2020; year <= currentYear + 2; year++) {
    availableYears.value.push({ label: year.toString(), value: year });
}

async function getItems(year = selectedYear.value) {
    try {
        loading.value = true;
        const { data: response } = await axios.get(`/cPanelTestPHP_1/api/ventas.php?ano=${year}`);

        // La respuesta ahora incluye año consultado y datos
        items.value = response.data || [];
        consultedYear.value = response.ano_consultado || year;
    } catch (error) {
        console.log('Error al obtener datos:', error.message);
        items.value = [];
    } finally {
        loading.value = false;
    }
}

async function filterByYear() {
    await getItems(selectedYear.value);
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
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[15, 25, 50, 100]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ítems"
            responsiveLayout="scroll"
            stripedRows
            :showGridlines="true"
        >
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <h4 class="m-0">VENTAS POR MES EN DÓLARES - AÑO {{ consultedYear }}</h4>

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
            <Column field="TOTAL AÑO" header="Total Año" sortable style="min-width: 10rem" class="font-bold"></Column>
            <Column field="ENERO" header="Enero" sortable style="min-width: 10rem"></Column>
            <Column field="FEBRERO" header="Febrero" sortable style="min-width: 10rem"></Column>
            <Column field="MARZO" header="Marzo" sortable style="min-width: 10rem"></Column>
            <Column field="ABRIL" header="Abril" sortable style="min-width: 10rem"></Column>
            <Column field="MAYO" header="Mayo" sortable style="min-width: 10rem"></Column>
            <Column field="JUNIO" header="Junio" sortable style="min-width: 10rem"></Column>
            <Column field="JULIO" header="Julio" sortable style="min-width: 10rem"></Column>
            <Column field="AGOSTO" header="Agosto" sortable style="min-width: 10rem"></Column>
            <Column field="SEPTIEMBRE" header="Septiembre" sortable style="min-width: 12rem"></Column>
            <Column field="OCTUBRE" header="Octubre" sortable style="min-width: 10rem"></Column>
            <Column field="NOVIEMBRE" header="Noviembre" sortable style="min-width: 12rem"></Column>
            <Column field="DICIEMBRE" header="Diciembre" sortable style="min-width: 12rem"></Column>
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

@media screen and (max-width: 768px) {
    .flex-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .gap-4 {
        gap: 1rem;
    }
}
</style>
