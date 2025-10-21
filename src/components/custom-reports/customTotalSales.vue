<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { computed, onMounted, ref } from 'vue';

import axios from 'axios';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

const dt = ref();
const items = ref([]);
const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const loading = ref(false);

// Computed para calcular totales
const totales = computed(() => {
    if (items.value.length === 0) return null;

    let totalUnidades = 0;
    let totalDolares = 0;

    items.value.forEach((item) => {
        // Limpiar y sumar unidades
        const unidades = parseFloat((item['TOTAL UNIDADES'] || '0').replace(/,/g, ''));
        totalUnidades += unidades;

        // Limpiar y sumar dólares
        const dolares = parseFloat((item['TOTAL US$'] || '$0.00').replace('$', '').replace(/,/g, ''));
        totalDolares += dolares;
    });

    return {
        unidades: totalUnidades,
        dolares: totalDolares,
        promedio: totalUnidades > 0 ? totalDolares / totalUnidades : 0
    };
});

async function getItems() {
    try {
        loading.value = true;
        const { data: response } = await axios.get(`/cPanelTestPHP_1/api/ventas-totales-mes.php`);

        items.value = response.data || [];
    } catch (error) {
        console.log('Error al obtener datos:', error.message);
        items.value = [];
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await getItems();
});
</script>

<template>
    <div class="sales-container">
        <!-- Header -->
        <Card class="mb-4">
            <template #content>
                <div class="flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-chart-bar text-primary text-2xl"></i>
                        <div>
                            <h2 class="text-2xl font-bold text-primary m-0">Ventas Totales por Mes</h2>
                            <p class="text-600 m-0">Resumen general de ventas - Unidades y Dólares</p>
                        </div>
                    </div>

                    <div class="flex align-items-center gap-3">
                        <Button label="Actualizar" icon="pi pi-refresh" @click="getItems" :loading="loading" class="p-button-primary" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Resumen de totales -->
        <Card v-if="totales" class="mb-4 totals-card">
            <template #content>
                <div class="flex align-items-center justify-content-between mb-3">
                    <h3 class="text-xl font-semibold text-800 m-0">
                        <i class="pi pi-calculator mr-2"></i>
                        Resumen General - Todos los Períodos
                    </h3>
                    <Tag value="TOTALES" severity="info" class="text-sm font-semibold"></Tag>
                </div>

                <div class="flex flex-wrap align-items-center justify-content-around gap-3">
                    <div class="bg-blue-50 border-round p-3 text-center flex-1 min-w-250px">
                        <div class="text-blue-600 font-semibold text-sm mb-1">TOTAL UNIDADES</div>
                        <div class="text-blue-900 font-bold text-2xl">{{ totales.unidades.toLocaleString('en-US', { minimumFractionDigits: 0 }) }}</div>
                    </div>
                    <div class="bg-green-50 border-round p-3 text-center flex-1 min-w-250px">
                        <div class="text-green-600 font-semibold text-sm mb-1">TOTAL DÓLARES</div>
                        <div class="text-green-900 font-bold text-2xl">${{ totales.dolares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                    </div>
                    <div class="bg-orange-50 border-round p-3 text-center flex-1 min-w-250px">
                        <div class="text-orange-600 font-semibold text-sm mb-1">PROMEDIO POR UNIDAD</div>
                        <div class="text-orange-900 font-bold text-2xl">${{ totales.promedio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Tabla de datos -->
        <Card>
            <template #content>
                <DataTable
                    ref="dt"
                    v-model:selection="selectedItems"
                    :value="items"
                    dataKey="AÑO-MES"
                    :paginator="true"
                    :rows="25"
                    :filters="filters"
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[25, 50, 100]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                    responsiveLayout="scroll"
                    stripedRows
                    :showGridlines="true"
                    class="modern-table"
                >
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <h4 class="m-0 text-primary">Detalle Mensual de Ventas</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="search-input" />
                            </IconField>
                        </div>
                    </template>

                    <template #loading>
                        <div class="flex justify-content-center align-items-center py-6">
                            <i class="pi pi-spinner pi-spin text-primary" style="font-size: 2rem"></i>
                            <span class="ml-2 text-600">Cargando datos...</span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

                    <Column field="AÑO" header="Año" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.AÑO" severity="info" class="font-bold"></Tag>
                        </template>
                    </Column>

                    <Column field="MES" header="Mes" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-calendar text-600"></i>
                                <span class="font-semibold">{{ slotProps.data.MES }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="AÑO-MES" header="Período" sortable style="min-width: 10rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['AÑO-MES']" severity="secondary" class="font-mono font-bold"></Tag>
                        </template>
                    </Column>

                    <Column field="TOTAL UNIDADES" header="Total Unidades" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <div class="text-center">
                                <Tag :value="slotProps.data['TOTAL UNIDADES']" severity="info" class="font-bold text-base"></Tag>
                            </div>
                        </template>
                    </Column>

                    <Column field="TOTAL US$" header="Total US$" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <div class="text-center">
                                <Tag :value="slotProps.data['TOTAL US$']" severity="success" class="font-bold text-base"></Tag>
                            </div>
                        </template>
                    </Column>

                    <Column field="US$ PROMEDIO" header="US$ Promedio" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <div class="text-center">
                                <Tag :value="slotProps.data['US$ PROMEDIO']" severity="warning" class="font-bold text-base"></Tag>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.sales-container {
    padding: 1rem;
}

.totals-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.totals-card :deep(.p-card-content) {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    color: var(--text-color);
}

.modern-table :deep(.p-datatable-thead > tr > th) {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
    border: none;
}

.modern-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
    background: var(--surface-50);
}

.modern-table :deep(.p-datatable-tbody > tr:hover) {
    background: var(--primary-50) !important;
}

.search-input {
    width: 250px;
}

:deep(.p-tag) {
    font-size: 0.875rem;
}

:deep(.p-button) {
    border-radius: 6px;
}

:deep(.p-card) {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.font-mono {
    font-family: 'Courier New', monospace;
}

@media screen and (max-width: 768px) {
    .sales-container {
        padding: 0.5rem;
    }

    .search-input {
        width: 200px;
    }
}
</style>

