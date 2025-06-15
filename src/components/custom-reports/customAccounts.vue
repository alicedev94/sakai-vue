<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const dt = ref();
const items = ref([]);

const selectedItems = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const loading = ref(false);

const api = [
    {
        id: 1,
        name: 'Producto A',
        description: 'Descripción del Producto A',
        category: 'Electrónica',
        status: 'Disponible'
    },
    {
        id: 2,
        name: 'Servicio B',
        description: 'Descripción del Servicio B',
        category: 'Servicios',
        status: 'Activo'
    },
    {
        id: 3,
        name: 'Artículo C',
        description: 'Descripción del Artículo C',
        category: 'Hogar',
        status: 'Agotado'
    },
    {
        id: 4,
        name: 'Material D',
        description: 'Descripción del Material D',
        category: 'Construcción',
        status: 'En Stock'
    }
];

onMounted(() => {
    loading.value = true;
    setTimeout(() => {
        items.value = api;
        loading.value = false;
    }, 500);
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
                    <h4 class="m-0">Cuentas por cobrar</h4>
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
            <Column field="name" header="Nombre del Ítem" sortable style="min-width: 12rem"></Column>
            <Column field="description" header="Descripción" sortable style="min-width: 16rem"></Column>
            <Column field="category" header="Categoría" sortable style="min-width: 10rem"></Column>
            <Column field="status" header="Estado" sortable style="min-width: 12rem"></Column>
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
