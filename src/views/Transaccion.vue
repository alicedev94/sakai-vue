<script setup>
import { useTransactionStore } from '@/stores/transaction';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';

const transactionStore = useTransactionStore();
const toast = useToast();

const filters = reactive({
    codigo: '',
    barra1: '',
    barra2: '',
    descripcion: '',
    fechaDesde: new Date(),
    fechaHasta: null
});

const pagination = reactive({
    first: 0,
    page: 0,
    size: 10
});

// Paginado móvil
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 8;

const mobilePagedTransactions = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return transactionStore.transactions.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() =>
    Math.ceil(transactionStore.transactions.length / mobileRowsPerPage)
);

const loadData = async () => {
    mobileCurrentPage.value = 0;
    try {
        const params = { page: 0, size: 1000000 };
        if (filters.codigo)     params.codigo     = filters.codigo;
        if (filters.barra1)     params.barra1     = filters.barra1;
        if (filters.barra2)     params.barra2     = filters.barra2;
        if (filters.descripcion) params.descripcion = filters.descripcion;
        if (filters.fechaDesde) params.fechaDesde = formatDateForApi(filters.fechaDesde);
        if (filters.fechaHasta) params.fechaHasta = formatDateForApi(filters.fechaHasta);
        await transactionStore.fetchTransaccionesProductos(params);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: transactionStore.error || 'Ocurrió un error', life: 3000 });
    }
};

const onSearch = () => loadData();

const clearFilters = () => {
    filters.codigo = '';
    filters.barra1 = '';
    filters.barra2 = '';
    filters.descripcion = '';
    filters.fechaDesde = null;
    filters.fechaHasta = null;
    pagination.sortField = null;
    pagination.sortOrder = null;
    transactionStore.transactions = [];
    transactionStore.totalRecords = 0;
    mobileCurrentPage.value = 0;
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="transactions-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">Transacciones de Productos</h2>
                    <p class="subtitle">Consulta los movimientos y transacciones de los productos</p>
                </div>
            </div>

            <!-- Filtros responsive -->
            <div class="filters-toolbar mb-6">
                <div class="filters-grid">
                    <div class="filter-field">
                        <label for="codigo">Código</label>
                        <InputText id="codigo" v-model="filters.codigo" placeholder="Ingrese código" @keydown.enter="onSearch" class="w-full" />
                    </div>
                    <div class="filter-field">
                        <label for="barra1">Barra 1</label>
                        <InputText id="barra1" v-model="filters.barra1" placeholder="Ingrese barra 1" @keydown.enter="onSearch" class="w-full" />
                    </div>
                    <div class="filter-field">
                        <label for="barra2">Barra 2</label>
                        <InputText id="barra2" v-model="filters.barra2" placeholder="Ingrese barra 2" @keydown.enter="onSearch" class="w-full" />
                    </div>
                    <div class="filter-field">
                        <label for="descripcion">Descripción</label>
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText id="descripcion" v-model="filters.descripcion" placeholder="Ingrese descripción" @keydown.enter="onSearch" class="w-full" />
                        </IconField>
                    </div>
                    <div class="filter-field">
                        <label for="fechaDesde">Fecha Desde</label>
                        <Calendar id="fechaDesde" v-model="filters.fechaDesde" dateFormat="yy-mm-dd" placeholder="YYYY-MM-DD" :showIcon="true" class="w-full" />
                    </div>
                    <div class="filter-field">
                        <label for="fechaHasta">Fecha Hasta</label>
                        <Calendar id="fechaHasta" v-model="filters.fechaHasta" dateFormat="yy-mm-dd" placeholder="YYYY-MM-DD" :showIcon="true" class="w-full" />
                    </div>

                    <!-- Botones de acción -->
                    <div class="filter-actions">
                        <Button
                            label="Buscar"
                            icon="pi pi-search"
                            @click="onSearch"
                            :loading="transactionStore.loading"
                            class="w-full md:w-auto"
                        />
                        <Button
                            icon="pi pi-filter-slash"
                            @click="clearFilters"
                            :disabled="transactionStore.loading"
                            outlined
                            severity="secondary"
                            v-tooltip.top="'Limpiar filtros'"
                        />
                    </div>
                </div>
            </div>

            <!-- Tabla (Desktop) -->
            <DataTable
                class="hidden md:block transactions-table"
                :value="transactionStore.transactions"
                :paginator="true"
                :rows="10"
                v-model:sortField="pagination.sortField"
                v-model:sortOrder="pagination.sortOrder"
                :rowsPerPageOptions="[10, 25, 50, 100]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} transacciones"
                responsiveLayout="scroll"
                :loading="transactionStore.loading"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-receipt" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                        <p>No se encontraron transacciones con los filtros seleccionados</p>
                    </div>
                </template>

                <Column field="codigo" header="Código" style="min-width: 9rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="badge-code">{{ data.codigo }}</span>
                    </template>
                </Column>
                <Column field="barra1" header="Barra 1" style="min-width: 8rem" :sortable="true" />
                <Column field="barra2" header="Barra 2" style="min-width: 8rem" :sortable="true" />
                <Column field="descripcion" header="Descripción" style="min-width: 18rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="desc-text">{{ data.descripcion }}</span>
                    </template>
                </Column>
                <Column field="departamento" header="Depto." style="min-width: 6rem" align="center" :sortable="true">
                    <template #body="{ data }">
                        <span class="badge-dept">{{ data.departamento }}</span>
                    </template>
                </Column>
                <Column field="precio1" header="Precio" style="min-width: 8rem" :sortable="true">
                    <template #body="{ data }">
                        <span class="price-text">{{ formatCurrency(data.precio1) }}</span>
                    </template>
                </Column>
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
            </DataTable>

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <div v-if="transactionStore.loading && transactionStore.transactions.length === 0" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                    <p>Cargando transacciones...</p>
                </div>
                <div v-else-if="!transactionStore.loading && transactionStore.transactions.length === 0" class="empty-state">
                    <i class="pi pi-receipt" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p>No se encontraron transacciones con los filtros seleccionados</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="transactionStore.loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)" />
                    </div>

                    <div v-for="data in mobilePagedTransactions" :key="`${data.codigo}-${data.fFecha}`" class="txn-card">
                        <!-- Cabecera -->
                        <div class="txn-card-header">
                            <div class="txn-card-header-left">
                                <span class="badge-code">{{ data.codigo }}</span>
                                <span class="badge-dept">{{ data.departamento }}</span>
                            </div>
                            <div class="txn-card-header-right">
                                <span class="price-text">{{ formatCurrency(data.precio1) }}</span>
                                <span class="date-text">{{ formatDate(data.fFecha) }}</span>
                            </div>
                        </div>

                        <!-- Descripción -->
                        <div class="txn-card-desc">
                            <span class="desc-text">{{ data.descripcion }}</span>
                        </div>

                        <!-- Body: barras y cantidad -->
                        <div class="txn-card-body">
                            <div class="txn-card-row" v-if="data.barra1">
                                <span class="txn-label">Barra 1</span>
                                <span class="txn-value mono">{{ data.barra1 }}</span>
                            </div>
                            <div class="txn-card-row" v-if="data.barra2">
                                <span class="txn-label">Barra 2</span>
                                <span class="txn-value mono">{{ data.barra2 }}</span>
                            </div>
                            <div class="txn-card-row">
                                <span class="txn-label">Cantidad</span>
                                <span class="qty-text">{{ Number(data.cantidad).toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Paginador móvil -->
                    <div v-if="mobileTotalPages > 1" class="flex justify-center items-center gap-3 mt-2">
                        <Button icon="pi pi-chevron-left" outlined rounded size="small" :disabled="mobileCurrentPage === 0" @click="mobileCurrentPage--" />
                        <span class="text-sm" style="color: var(--text-color-secondary)">
                            Página {{ mobileCurrentPage + 1 }} de {{ mobileTotalPages }}
                        </span>
                        <Button icon="pi pi-chevron-right" outlined rounded size="small" :disabled="mobileCurrentPage >= mobileTotalPages - 1" @click="mobileCurrentPage++" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.transactions-container {
    padding: 1rem;
    @media (min-width: 768px) { padding: 1.5rem; }
}

.card {
    background: var(--surface-card);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    @media (min-width: 768px) { padding: 2rem; }
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
    font-size: 1.65rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-color);
}

.subtitle {
    font-size: 0.95rem;
    color: var(--text-color-secondary);
    margin: 0.25rem 0 0 0;
}

/* Filtros */
.filters-toolbar {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 1.25rem;
}

.filters-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr; /* 1 col en mobile */

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr); /* 3 cols en desktop */
    }
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
        font-weight: 600;
        font-size: 0.88rem;
        color: var(--text-color);
    }
}

.filter-actions {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding-top: 0.1rem;

    @media (max-width: 767px) {
        justify-content: center;
        flex-direction: row;
        /* El botón Buscar ya tiene w-full en mobile */
        .p-button:first-child { flex: 1; }
    }

    @media (min-width: 768px) {
        justify-content: flex-end;
        grid-column: span 3;
    }
}

/* Tabla */
.transactions-table {
    :deep(.p-datatable-header) { background: transparent; border: none; }
}

/* Empty / Loading */
.empty-state,
.loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
    p { margin-top: 1rem; font-size: 1.05rem; }
}

/* Badges / texto compartidos */
.badge-code {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.3rem 0.65rem;
    border-radius: 6px;
    font-family: monospace;
    font-weight: 600;
    font-size: 0.88rem;
    white-space: nowrap;
}

.badge-dept {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.3rem 0.65rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.82rem;
    white-space: nowrap;
}

.desc-text {
    color: var(--text-color);
    font-weight: 500;
    line-height: 1.4;
    font-size: 0.95rem;
}

.qty-text {
    font-weight: 700;
    color: var(--text-color);
}

.price-text {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 1rem;
}

.date-text {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    white-space: nowrap;
}

/* Cards mobile */
.txn-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.txn-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--surface-200);
    background: color-mix(in srgb, var(--primary-color) 4%, var(--surface-card));
    gap: 0.5rem;
}

.txn-card-header-left {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.txn-card-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
}

.txn-card-desc {
    padding: 0.75rem 1rem 0.5rem;
}

.txn-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 1rem 0.85rem;
}

.txn-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
}

.txn-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.txn-value {
    color: var(--text-color);
    font-size: 0.9rem;
    &.mono { font-family: monospace; }
}
</style>
