<script setup>
import { useMovimientoStore } from '@/stores/movimiento';
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';

const movimientoStore = useMovimientoStore();
const toast = useToast();

const tipoDocumentoOptions = ref([
    { label: 'Todos', value: null },
    { label: 'PreOrden', value: 'preOrden' },
    { label: 'Orden', value: 'Orden' }
]);

const filters = reactive({
    codigo: '',
    barra1: '',
    descripcion: '',
    fechaDesde: null,
    fechaHasta: null,
    tipoDocumento: null
});

const pagination = reactive({
    first: 0,
    page: 0,
    size: 10
});

const loadData = async () => {
    try {
        const params = {
            page: 0,
            size: 1000000
        };

        if (filters.codigo) params.codigo = filters.codigo;
        if (filters.barra1) params.barra1 = filters.barra1;
        if (filters.descripcion) params.descripcion = filters.descripcion;
        if (filters.fechaDesde) params.fechaDesde = formatDateForApi(filters.fechaDesde);
        if (filters.fechaHasta) params.fechaHasta = formatDateForApi(filters.fechaHasta);
        if (filters.tipoDocumento) params.tipoDocumento = filters.tipoDocumento;

        await movimientoStore.fetchMovimientos(params);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: movimientoStore.error || 'Ocurrió un error', life: 3000 });
    }
};

const onSearch = () => {
    loadData();
};

const clearFilters = () => {
    filters.codigo = '';
    filters.barra1 = '';
    filters.descripcion = '';
    filters.fechaDesde = null;
    filters.fechaHasta = null;
    filters.tipoDocumento = null;

    pagination.sortField = null;
    pagination.sortOrder = null;

    movimientoStore.movimientos = [];
    movimientoStore.totalRecords = 0;

    loadData();
};

const formatDateForApi = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString;
};

const formatCurrency = (value) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VEF' }).format(value);
};

const printMovimientoId = (data) => {
    console.log('ID del movimiento capturado:', data.id);
};
</script>

<template>
    <div class="transactions-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">Movimientos</h2>
                    <p class="subtitle">Consulta los movimientos y transacciones de los productos</p>
                </div>
            </div>

            <!-- Toolbar de búsqueda y acciones -->
            <div class="filters-toolbar mb-6">
                <div class="p-fluid grid formgrid">
                    <div class="field col-12 md:col-3">
                        <label for="codigo">Código</label>
                        <InputText id="codigo" v-model="filters.codigo" placeholder="Ingrese código" @keydown.enter="onSearch" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="barra1">Barra 1</label>
                        <InputText id="barra1" v-model="filters.barra1" placeholder="Ingrese barra 1" @keydown.enter="onSearch" />
                    </div>

                    <div class="field col-12 md:col-3">
                        <label for="tipoDocumento">Tipo Documento</label>
                        <Dropdown id="tipoDocumento" v-model="filters.tipoDocumento" :options="tipoDocumentoOptions" optionLabel="label" optionValue="value" placeholder="Seleccione un tipo" showClear />
                    </div>

                    <div class="field col-12 md:col-6 flex align-items-end justify-content-end gap-2 pb-1">
                        <Button label="Buscar" icon="pi pi-search" @click="onSearch" :loading="movimientoStore.loading" class="p-button-primary md:w-auto w-full" />
                        <Button icon="pi pi-filter-slash" @click="clearFilters" :disabled="movimientoStore.loading" outlined v-tooltip.top="'Limpiar filtros'" severity="secondary" />
                    </div>
                </div>
            </div>

            <!-- Tabla de transacciones -->
            <DataTable
                :value="movimientoStore.movimientos"
                :paginator="true"
                :rows="10"
                v-model:sortField="pagination.sortField"
                v-model:sortOrder="pagination.sortOrder"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimientos"
                responsiveLayout="scroll"
                class="transactions-table"
                :loading="movimientoStore.loading"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-receipt" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                        <p>No se encontraron movimientos con los filtros seleccionados</p>
                    </div>
                </template>

                <Column field="codigo" header="Código" style="min-width: 9rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="desc-text">{{ data.codigo }}</span>
                    </template>
                </Column>

                <!-- <Column field="barra1" header="Barra 1" style="min-width: 8rem" :sortable="true"></Column> -->

                <Column field="descripcion" header="Descripción" style="min-width: 18rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="desc-text">{{ data.descripcion }}</span>
                    </template>
                </Column>

                <Column field="tipoDocumento.nombre" header="Tipo Doc." style="min-width: 8rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="badge-dept">{{ data.tipoDocumento?.nombre || '-' }}</span>
                    </template>
                </Column>

                <Column field="departamento" header="Depto." style="min-width: 6rem" align="center" :sortable="true">
                    <template #body="{ data }">
                        <span class="badge-dept">{{ data.departamento }}</span>
                    </template>
                </Column>

                <!-- <Column field="precio1" header="Precio" style="min-width: 8rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="price-text">{{ formatCurrency(data.precio1) }}</span>
                    </template>
                </Column> -->

                <Column field="cantidad" header="Cantidad" style="min-width: 6rem" align="center" :sortable="true">
                    <template #body="{ data }">
                        <span class="qty-text">{{ Number(data.cantidad).toFixed(2) }}</span>
                    </template>
                </Column>

                <Column field="fFecha" header="Fecha" style="min-width: 8rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="date-text">{{ formatDate(data.fFecha) }}</span>
                    </template>
                </Column>

                <Column header="Acciones" style="min-width: 5rem" align="center">
                    <template #body="{ data }">
                        <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-secondary" v-tooltip.top="'Imprimir ID'" @click="printMovimientoId(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped lang="scss">
.transactions-container {
    padding: 1rem;

    @media (min-width: 768px) {
        padding: 1.5rem;
    }
}

.card {
    background: var(--surface-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-color);
}

.subtitle {
    font-size: 0.95rem;
    color: var(--text-color-secondary);
    margin: 0.25rem 0 0 0;
}

.filters-toolbar {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 1.5rem;

    .field {
        margin-bottom: 0;

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-color);
        }
    }
}

.transactions-table {
    :deep(.p-datatable-header) {
        background: transparent;
        border: none;
    }
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);

    p {
        margin-top: 1rem;
        font-size: 1.1rem;
    }
}

.badge-code {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-family: monospace;
    font-weight: 600;
    font-size: 0.9rem;
}

.badge-dept {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    display: inline-block;
    min-width: 3rem;
    white-space: nowrap;
}

.desc-text {
    color: var(--text-color);
    font-weight: 500;
    line-height: 1.4;
    font-size: 0.95rem;
}

.qty-text {
    font-weight: 600;
    color: var(--text-color);
}

.price-text {
    font-weight: 700;
    color: var(--primary-color);
}

.date-text {
    color: var(--text-color-secondary);
    font-size: 0.95rem;
    white-space: nowrap;
}

/* Clases grid de formularios */
.formgrid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
}
</style>
