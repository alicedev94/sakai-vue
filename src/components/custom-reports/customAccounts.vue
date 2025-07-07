<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

import axios from 'axios';

import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
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

async function getItems() {
    try {
        const { data: products } = await axios.get('/cPanelTestPHP_1/api/index.php');
        items.value = products;
    } catch (error) {
        console.log(error.message);
    }
}

onMounted(async () => {
    loading.value = true;
    await getItems();
    loading.value = false;
});
</script>

<template>
    <div class="card">
        <DataTable
            ref="dt"
            v-model:selection="selectedItems"
            :value="items"
            dataKey="id"
            :paginator="true"
            :rows="11"
            :filters="filters"
            :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[11, 25, 50]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ítems"
            responsiveLayout="scroll"
            stripedRows
            :showGridlines="true"
        >
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="m-0">CUENTAS POR COBRAR POR ANTIGÜEDAD</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </IconField>
                </div>
            </template>

            <template #loading>
                <div class="flex justify-content-center align-items-center">
                    <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="CLIENTE" header="Cliente" sortable style="min-width: 12rem"></Column>
            <Column field="CODIGO" header="Código" sortable style="min-width: 8rem"></Column>
            <Column field="AÑO" header="Año" sortable style="min-width: 6rem"></Column>
            <Column field="TOTAL CXC DÓLARES" header="Total CXC USD" sortable style="min-width: 12rem"></Column>
            <Column field="NO VENCIDO DÓLARES" header="No Vencido USD" sortable style="min-width: 12rem"></Column>
            <Column field="VENCIDO 1-5 DIAS DÓLARES" header="Vencido 1-5 Días USD" sortable style="min-width: 14rem"></Column>
            <Column field="VENCIDO 6-15 DIAS DÓLARES" header="Vencido 6-15 Días USD" sortable style="min-width: 14rem"></Column>
            <Column field="VENCIDO 16-30 DIAS DÓLARES" header="Vencido 16-30 Días USD" sortable style="min-width: 14rem"></Column>
            <Column field="VENCIDO 31-60 DIAS DÓLARES" header="Vencido 31-60 Días USD" sortable style="min-width: 14rem"></Column>
            <Column field="VENCIDO >60 DIAS DÓLARES" header="Vencido >60 Días USD" sortable style="min-width: 14rem"></Column>
            <Column field="TASA PROMEDIO" header="Tasa Promedio" sortable style="min-width: 10rem"></Column>
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

.m-0 {
    margin: 0;
}

.p-fluid .p-inputtext,
.p-fluid .p-inputicon .p-inputtext {
    width: 100%;
}

:deep(.p-inputtext) {
    height: 45px;
    transition: all 0.2s;
    width: 100%;
}

.flex.justify-content-center.align-items-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

@media screen and (max-width: 768px) {
    .flex-wrap {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
