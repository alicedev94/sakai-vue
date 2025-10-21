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

// Computed para obtener los totales
const totales = computed(() => {
    const totalRow = items.value.find((item) => item.CLIENTE === 'TOTALES');
    return totalRow || {};
});

// Computed para datos sin la fila de totales
const dataWithoutTotals = computed(() => {
    return items.value.filter((item) => item.CLIENTE !== 'TOTALES');
});

// Función para obtener color del status
const getStatusSeverity = (status) => {
    switch (status) {
        case 'VENCIDO':
            return 'danger';
        case 'AL DIA':
            return 'success';
        default:
            return 'info';
    }
};

// Función para formatear montos con colores
const getAmountSeverity = (amount, fieldName) => {
    if (!amount || amount === '$0.00') return 'secondary';

    if (fieldName.includes('VENCIDO')) {
        return 'danger';
    } else if (fieldName.includes('NO VENCIDO')) {
        return 'success';
    }
    return 'info';
};

async function getItems() {
    try {
        loading.value = true;
        const { data: response } = await axios.get(`/cPanelTestPHP_1/api/index.php`);

        // La respuesta incluye todos los montos acumulados sin filtro de año
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
    <div class="accounts-container">
        <!-- Header con filtros -->
        <Card class="mb-4">
            <template #content>
                <div class="flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-chart-line text-primary text-2xl"></i>
                        <div>
                            <h2 class="text-2xl font-bold text-primary m-0">Cuentas por Cobrar</h2>
                            <p class="text-600 m-0">Análisis por antigüedad - Todos los períodos</p>
                        </div>
                    </div>

                    <div class="flex align-items-center gap-3">
                        <Button label="Actualizar" icon="pi pi-refresh" @click="getItems" :loading="loading" class="p-button-primary" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Resumen de totales -->
        <Card v-if="totales.CLIENTE" class="mb-4 totals-card">
            <template #content>
                <div class="flex align-items-center justify-content-between mb-3">
                    <h3 class="text-xl font-semibold text-800 m-0">
                        <i class="pi pi-calculator mr-2"></i>
                        Resumen General - Acumulado Total
                    </h3>
                    <Tag value="TOTALES" severity="info" class="text-sm font-semibold"></Tag>
                </div>

                <div class="flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="bg-blue-50 border-round p-3 text-center flex-1 min-w-200px">
                        <div class="text-blue-600 font-semibold text-sm mb-1">TOTAL CXC</div>
                        <div class="text-blue-900 font-bold text-xl">{{ totales['TOTAL CXC DÓLARES'] }}</div>
                    </div>
                    <div class="bg-green-50 border-round p-3 text-center flex-1 min-w-200px">
                        <div class="text-green-600 font-semibold text-sm mb-1">NO VENCIDO</div>
                        <div class="text-green-900 font-bold text-xl">{{ totales['NO VENCIDO DÓLARES'] }}</div>
                    </div>
                    <div class="bg-orange-50 border-round p-3 text-center flex-1 min-w-200px">
                        <div class="text-orange-600 font-semibold text-sm mb-1">VENCIDO 1-30 DÍAS</div>
                        <div class="text-orange-900 font-bold text-xl">
                            ${{
                                (
                                    parseFloat((totales['VENCIDO 1-5 DIAS DÓLARES'] || '$0.00').replace('$', '').replace(',', '')) +
                                    parseFloat((totales['VENCIDO 6-15 DIAS DÓLARES'] || '$0.00').replace('$', '').replace(',', '')) +
                                    parseFloat((totales['VENCIDO 16-30 DIAS DÓLARES'] || '$0.00').replace('$', '').replace(',', ''))
                                ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            }}
                        </div>
                    </div>
                    <div class="bg-red-50 border-round p-3 text-center flex-1 min-w-200px">
                        <div class="text-red-600 font-semibold text-sm mb-1">VENCIDO +60 DÍAS</div>
                        <div class="text-red-900 font-bold text-xl">{{ totales['VENCIDO >60 DIAS DÓLARES'] }}</div>
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
                    :value="dataWithoutTotals"
                    dataKey="CODIGO"
                    :paginator="true"
                    :rows="15"
                    :filters="filters"
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[15, 25, 50]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
                    responsiveLayout="scroll"
                    stripedRows
                    :showGridlines="true"
                    class="modern-table"
                >
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <h4 class="m-0 text-primary">Detalle por Cliente</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar cliente, código..." class="search-input" />
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

                    <Column field="CLIENTE" header="Cliente" sortable style="min-width: 15rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-2">
                                <i class="pi pi-building text-600"></i>
                                <span class="font-semibold">{{ slotProps.data.CLIENTE }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="CODIGO" header="Código" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.CODIGO" severity="secondary" class="font-mono"></Tag>
                        </template>
                    </Column>

                    <Column field="STATUS" header="Estado" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.STATUS" :severity="getStatusSeverity(slotProps.data.STATUS)" class="font-semibold">
                                <i :class="slotProps.data.STATUS === 'VENCIDO' ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle'" class="mr-1"></i>
                                {{ slotProps.data.STATUS }}
                            </Tag>
                        </template>
                    </Column>

                    <Column field="TOTAL CXC DÓLARES" header="Total CXC USD" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['TOTAL CXC DÓLARES']" severity="info" class="font-bold text-base"></Tag>
                        </template>
                    </Column>

                    <Column field="NO VENCIDO DÓLARES" header="No Vencido USD" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['NO VENCIDO DÓLARES']" :severity="getAmountSeverity(slotProps.data['NO VENCIDO DÓLARES'], 'NO VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="VENCIDO 1-5 DIAS DÓLARES" header="Vencido 1-5 Días" sortable style="min-width: 14rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['VENCIDO 1-5 DIAS DÓLARES']" :severity="getAmountSeverity(slotProps.data['VENCIDO 1-5 DIAS DÓLARES'], 'VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="VENCIDO 6-15 DIAS DÓLARES" header="Vencido 6-15 Días" sortable style="min-width: 14rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['VENCIDO 6-15 DIAS DÓLARES']" :severity="getAmountSeverity(slotProps.data['VENCIDO 6-15 DIAS DÓLARES'], 'VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="VENCIDO 16-30 DIAS DÓLARES" header="Vencido 16-30 Días" sortable style="min-width: 14rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['VENCIDO 16-30 DIAS DÓLARES']" :severity="getAmountSeverity(slotProps.data['VENCIDO 16-30 DIAS DÓLARES'], 'VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="VENCIDO 31-60 DIAS DÓLARES" header="Vencido 31-60 Días" sortable style="min-width: 14rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['VENCIDO 31-60 DIAS DÓLARES']" :severity="getAmountSeverity(slotProps.data['VENCIDO 31-60 DIAS DÓLARES'], 'VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="VENCIDO >60 DIAS DÓLARES" header="Vencido >60 Días" sortable style="min-width: 14rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data['VENCIDO >60 DIAS DÓLARES']" :severity="getAmountSeverity(slotProps.data['VENCIDO >60 DIAS DÓLARES'], 'VENCIDO')" class="font-semibold"></Tag>
                        </template>
                    </Column>

                    <Column field="TASA PROMEDIO" header="Tasa Promedio" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <div class="text-center">
                                <span class="font-mono text-600 text-sm">{{ slotProps.data['TASA PROMEDIO'] }}</span>
                                <div class="text-xs text-400 italic">Solo informativa</div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.accounts-container {
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
    .accounts-container {
        padding: 0.5rem;
    }

    .search-input {
        width: 200px;
    }
}
</style>
