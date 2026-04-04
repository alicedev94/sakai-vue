<script setup>
import { preOrdenesService } from '@/service/PreOrdenesService';
import { usePreOrdenStore } from '@/stores/preOrden';
import { useAuthStore } from '@/stores/auth';
import { FilterMatchMode } from '@primevue/core/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const store = usePreOrdenStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filtroFecha = ref(new Date());
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

const detailDialog = ref(false);
const preOrdenSeleccionada = ref(null);



const ESTADOS = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Proceso', value: 'EN_PROCESO' },
    { label: 'Lista', value: 'LISTA' }
];
const filtroEstado = ref(null);

const preOrdenesFiltradas = computed(() => {
    let lista = store.preOrdenes;
    if (filtroEstado.value) {
        lista = lista.filter((o) => o.estado === filtroEstado.value);
    }
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        lista = lista.filter(
            (o) =>
                o.numeroOrden?.toLowerCase().includes(q) ||
                o.departamento?.toLowerCase().includes(q)
        );
    }
    return lista;
});

const progresoOrden = (orden) => {
    if (!orden.totalItems) return 0;
    return Math.round((orden.itemsSurtidos / orden.totalItems) * 100);
};

const estadoConfig = {
    PENDIENTE: { label: 'Pendiente', class: 'estado-pendiente', icon: 'pi pi-clock' },
    EN_PROCESO: { label: 'En Proceso', class: 'estado-proceso', icon: 'pi pi-spin pi-spinner' },
    LISTA: { label: 'Orden Lista', class: 'estado-lista', icon: 'pi pi-check-circle' }
};

const itemEstadoConfig = {
    PENDIENTE: { label: 'Pendiente', class: 'pendiente', icon: 'pi pi-clock' },
    SURTIDO: { label: 'Surtido', class: 'surtido', icon: 'pi pi-check' },
    NO_SURTIDO: { label: 'No Surtido', class: 'no-surtido', icon: 'pi pi-times' }
};

const formatDateForApi = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatFecha = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

async function cargarDatos() {
    try {
        const params = {};
        if (filtroFecha.value) {
            params.fecha = formatDateForApi(filtroFecha.value);
        }
        await store.fetchPreOrdenes(params);
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudieron cargar las pre ordenes', life: 5000 });
    }
}

watch(filtroFecha, () => {
    cargarDatos();
});

function clearFilters() {
    searchQuery.value = '';
    filtroEstado.value = null;
    filtroFecha.value = null;
    cargarDatos();
}

async function verDetalle(orden) {
    try {
        await store.cargarOrdenDetalle(orden.id);
        preOrdenSeleccionada.value = store.preOrdenActiva;
        detailDialog.value = true;
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo cargar el detalle', life: 4000 });
    }
}

onMounted(cargarDatos);

const createDialog = ref(false);
const creando = ref(false);
const newPreOrden = ref({
    departamento: null,
    usuarioSurtidor: '',
    items: []
});
const departamentosList = ref([]);
const productosList = ref([]);
const nuevoProducto = ref({ producto: null, cantidad: 1 });

async function openCreateDialog() {
    newPreOrden.value = { 
        departamento: null, 
        usuarioSurtidor: authStore.user?.email || '', 
        items: [] 
    };
    nuevoProducto.value = { producto: null, cantidad: 1 };
    productosList.value = [];
    
    if (departamentosList.value.length === 0 || !departamentosList.value.some(d => d.descripcion === '00 TODOS')) {
        try {
            const data = await preOrdenesService.obtenerDepartamentos();
            let depts = Array.isArray(data) ? data : data.data || [];
            departamentosList.value = [{ codigo: '', descripcion: '00 TODOS' }, ...depts];
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los departamentos', life: 3000 });
        }
    }
    createDialog.value = true;
}

let skipItemsClear = false;
const isEditing = computed(() => !!newPreOrden.value.id);

async function cargarProductos(newDept) {
    if (newDept !== null && newDept !== undefined) {
        try {
            const code = typeof newDept === 'object'
                ? (newDept.codigo !== undefined ? newDept.codigo : (newDept.id || newDept.descripcion || ''))
                : newDept;
            const data = await preOrdenesService.obtenerProductosPorDepartamento(code);
            let pList = Array.isArray(data) ? data : data.data || [];
            productosList.value = pList.map(p => {
                const cod = p.c_Codigo || p.codigoBarra || p.codigo || '';
                const desc = p.c_Descri || p.nombreProducto || p.name || p.descripcion || '';
                return {
                    ...p,
                    label: `${cod} - ${desc}`,
                    codigoBarra: cod,
                    nombreProducto: desc
                };
            });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos', life: 3000 });
            productosList.value = [];
        }
    } else {
        productosList.value = [];
    }
}

watch(() => newPreOrden.value.departamento, async (newDept) => {
    // Solo limpiamos los items si NO estamos editando y NO estamos saltando la limpieza
    if (!skipItemsClear && !isEditing.value) {
        newPreOrden.value.items = []; 
    }
    await cargarProductos(newDept);
});

function agregarProducto() {
    const p = nuevoProducto.value.producto;
    if (!p || nuevoProducto.value.cantidad <= 0) return;
    
    const existing = newPreOrden.value.items.find(i => 
        (p.codigoBarra && i.codigoBarra === p.codigoBarra) || 
        (p.id !== undefined && i.id === p.id) ||
        (p.idProducto !== undefined && i.idProducto === (p.id || p.codigoBarra))
    );
    if (existing) {
        existing.cantidad += nuevoProducto.value.cantidad;
    } else {
        newPreOrden.value.items.push({
            idProducto: p.id || p.codigoBarra,
            codigoBarra: p.codigoBarra,
            nombreProducto: p.nombreProducto,
            cantidad: nuevoProducto.value.cantidad,
            cantidadSurtida: 0,
            departamento: p.c_Departamento || newPreOrden.value.departamento?.descripcion || newPreOrden.value.departamento?.codigo || newPreOrden.value.departamento
        });
    }
    nuevoProducto.value = { producto: null, cantidad: 1 };
}

function removerProducto(index) {
    newPreOrden.value.items.splice(index, 1);
}


async function abrirEditar(orden) {
    skipItemsClear = true;
    try {
        await store.cargarOrdenDetalle(orden.id);
        const detalle = store.preOrdenActiva;
        newPreOrden.value = { 
            id: detalle.id,
            departamento: detalle.departamento, 
            usuarioSurtidor: detalle.usuarioSurtidor, 
            items: detalle.items ? detalle.items.map(i => ({ ...i })) : []
        };
        nuevoProducto.value = { producto: null, cantidad: 1 };
        productosList.value = [];
        
        if (departamentosList.value.length === 0 || !departamentosList.value.some(d => d.descripcion === '00 TODOS')) {
            const data = await preOrdenesService.obtenerDepartamentos();
            let depts = Array.isArray(data) ? data : data.data || [];
            departamentosList.value = [{ codigo: '', descripcion: '00 TODOS' }, ...depts];
        }
        
        const deptObj = departamentosList.value.find(d => d.descripcion === detalle.departamento);
        if (deptObj) {
            newPreOrden.value.departamento = deptObj;
            // Consultamos los productos inmediatamente al abrir para editar
            await cargarProductos(deptObj);
        }
        
        createDialog.value = true;
        setTimeout(() => { skipItemsClear = false; }, 200);
    } catch (err) {
        skipItemsClear = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la Preorden para edición', life: 3000 });
    }
}

async function guardarPreOrden() {
    const payload = { ...newPreOrden.value };

    payload.departamento = payload.departamento?.descripcion || payload.departamento?.codigo || payload.departamento;
    
    if (!payload.departamento || !payload.usuarioSurtidor || payload.items.length === 0) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos y agregue al menos un producto', life: 3000 });
        return;
    }

    payload.tipoDocumento = { id: 2, nombre: 'PreOrden' };
    
    creando.value = true;
    if (isEditing.value) {
        try {
            const params = {};
            if (filtroFecha.value) {
                params.fecha = formatDateForApi(filtroFecha.value);
            }
            await store.actualizarPreOrden(newPreOrden.value.id, payload, params);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'PreOrden actualizada', life: 3000 });
            createDialog.value = false;
        } catch (err) {
            toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo actualizar', life: 4000 });
        } finally {
            creando.value = false;
        }
    } else {
        try {
            const params = {};
            if (filtroFecha.value) {
                params.fecha = formatDateForApi(filtroFecha.value);
            }
            await store.crearPreOrden(payload, params);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'PreOrden creada', life: 3000 });
            createDialog.value = false;
        } catch (err) {
            toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo crear', life: 4000 });
        } finally {
            creando.value = false;
        }
    }
}

const confirmarEliminar = (orden) => {
    confirm.require({
        message: '¿Estás seguro de que deseas eliminar esta PreOrden?',
        header: 'Confirmar Eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                const params = {};
                if (filtroFecha.value) {
                    params.fecha = formatDateForApi(filtroFecha.value);
                }
                await store.eliminarPreOrden(orden.id, params);
                toast.add({ severity: 'success', summary: 'Eliminada', detail: 'PreOrden eliminada correctamente', life: 3000 });
            } catch (err) {
                toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo eliminar la PreOrden', life: 4000 });
            }
        }
    });
};

const confirmarAprobar = (orden) => {
    confirm.require({
        message: '¿Estás seguro de que deseas aprobar esta PreOrden? Se convertirá en una Orden.',
        header: 'Confirmar Aprobación',
        icon: 'pi pi-check-circle',
        acceptClass: 'p-button-success',
        acceptLabel: 'Aprobar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                const params = {};
                if (filtroFecha.value) {
                    params.fecha = formatDateForApi(filtroFecha.value);
                }
                await store.aprobarPreOrden(orden.id, params);
                toast.add({ severity: 'success', summary: 'Aprobada', detail: 'La PreOrden ha sido aprobada', life: 3000 });
            } catch (err) {
                toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo aprobar la PreOrden', life: 4000 });
            }
        }
    });
};

const exportarPDF = () => {
    const doc = new jsPDF();
    const data = preOrdenSeleccionada.value;
    
    // Configuración de colores y fuentes
    const primaryColor = [22, 163, 74]; // Verde PrimeVue (green-600)
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Detalle PreOrden', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${formatFecha(new Date())}`, 14, 30);
    
    // Línea divisoria
    doc.setDrawColor(230);
    doc.line(14, 35, 196, 35);
    
    // Información General
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text('Información', 14, 45);
    
    const infoGeneral = [
        ['N° Documento:', data.numeroOrden || 'N/A', 'Estado:', data.estado || 'N/A'],
        ['Departamento:', data.departamento || '—', 'Surtidor:', data.usuarioSurtidor || '—'],
        ['Creado:', formatFecha(data.fechaCreacion), 'Actualizado:', formatFecha(data.fechaActualizacion)]
    ];
    
    autoTable(doc, {
        startY: 50,
        body: infoGeneral,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 35 },
            2: { fontStyle: 'bold', width: 35 }
        }
    });
    
    // Resumen de cantidades
    const totalUnidades = data.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0;
    doc.text('Resumen de Totales', 14, doc.lastAutoTable.finalY + 10);
    
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        body: [
            ['Total Productos:', data.totalItems || 0, 'Productos Surtidos:', data.itemsSurtidos || 0],
            ['Total Unidades:', totalUnidades, 'Progreso:', `${progresoOrden(data)}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 }
    });
    
    // Tabla de Productos
    doc.text('Lista de Productos', 14, doc.lastAutoTable.finalY + 10);
    
    const tableData = data.items.map(item => [
        item.codigoBarra,
        item.nombreProducto,
        item.departamento || '—',
        item.cantidad,
        item.estadoItem
    ]);
    
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Código', 'Producto', 'Dpto.', 'Cant.', 'Estado']],
        body: tableData,
        headStyles: { fillColor: primaryColor },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 }
    });
    
    // Footer del PDF
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
    }
    
    doc.save(`Doc_${data.numeroOrden || data.id}.pdf`);
};
</script>

<template>
    <div class="ops-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">
                        <i class="pi pi-box ops-icon" />
                        Módulo de PreOrdenes
                    </h2>
                    <p class="subtitle">Gestión de pre ordenes</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-banner">
                <div class="stat-item">
                    <span class="stat-value">{{ store.totalPreOrdenes }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-pendiente">{{ store.preOrdenesPendientes.length }}</span>
                    <span class="stat-label">Pendientes</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-proceso">{{ store.preOrdenesEnProceso.length }}</span>
                    <span class="stat-label">En Proceso</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-lista">{{ store.preOrdenesListas.length }}</span>
                    <span class="stat-label">Listas</span>
                </div>
            </div>

            <Toolbar class="mb-5">
                <template #start>
                    <Button
                        label="Nueva PreOrden"
                        icon="pi pi-plus"
                        severity="primary"
                        class="mr-2"
                        @click="openCreateDialog"
                    />
                    <Button
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        v-tooltip.top="'Actualizar'"
                        :loading="store.isLoading"
                        @click="cargarDatos"
                    />
                    <Button
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        outlined
                        v-tooltip.top="'Limpiar filtros'"
                        @click="clearFilters"
                        class="ml-2"
                    />
                </template>
                <template #end>
                    <div class="toolbar-end">
                        <Select
                            v-model="filtroEstado"
                            :options="ESTADOS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los estados"
                            class="filter-select"
                        />
                        <Calendar 
                            v-model="filtroFecha" 
                            dateFormat="yy-mm-dd" 
                            placeholder="Fecha de consulta" 
                            :showIcon="true"
                            style="width: 160px"
                            class="date-filter"
                        />
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText
                                v-model="searchQuery"
                                placeholder="Buscar N° Documento o departamento..."
                                style="width: clamp(200px, 28vw, 360px)"
                            />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- Tabla -->
            <DataTable
                :value="preOrdenesFiltradas"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} órdenes"
                responsiveLayout="scroll"
                stripedRows
                v-model:filters="filters"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                        <p>No hay preordenes</p>
                    </div>
                </template>
                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando preordenes...</p>
                    </div>
                </template>

                <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column>

                <Column field="numeroOrden" header="N° Documento" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <span class="font-semibold text-primary">{{ data.numeroOrden }}</span>
                    </template>
                </Column>

                <Column field="tipoDocumento" header="Tipo Documento" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="font-semibold text-secondary">{{ data.tipoDocumento }}</span>
                    </template>
                </Column>

                <Column field="departamento" header="Departamento" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <div class="dept-info" v-if="data.departamento">
                            <Avatar
                                :label="data.departamento?.charAt(0).toUpperCase()"
                                shape="circle"
                                class="dept-avatar"
                            />
                            <span>{{ data.departamento }}</span>
                        </div>
                        <span v-else class="text-secondary">—</span>
                    </template>
                </Column>

                <Column header="Productos" style="min-width: 11rem">
                    <template #body="{ data }">
                        <div class="progress-cell">
                            <span class="progress-text">{{ data.itemsSurtidos ?? 0 }} / {{ data.totalItems ?? 0 }}</span>
                            <ProgressBar
                                :value="progresoOrden(data)"
                                style="height: 6px; width: 90px"
                                :showValue="false"
                            />
                        </div>
                    </template>
                </Column>

                <!-- <Column field="estado" header="Estado" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span :class="['estado-badge', estadoConfig[data.estado]?.class]">
                            <i :class="estadoConfig[data.estado]?.icon" />
                            {{ estadoConfig[data.estado]?.label }}
                        </span>
                    </template>
                </Column> -->

                <Column field="fechaCreacion" header="Creado" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text">{{ formatFecha(data.fechaCreacion) }}</span>
                    </template>
                </Column>

                <Column field="usuarioSurtidor" header="Surtidor" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span class="fecha-text text-secondary">{{ data.usuarioSurtidor || '—' }}</span>
                    </template>
                </Column>

                <Column :exportable="false" header="Acciones" style="min-width: 10rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button
                                icon="pi pi-eye"
                                outlined
                                rounded
                                severity="secondary"
                                v-tooltip.top="'Ver detalle'"
                                @click="verDetalle(data)"
                            />
                            <Button
                                v-if="data.estado !== 'LISTA' && data.estado !== 'EN_PROCESO'"
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                severity="info"
                                v-tooltip.top="'Editar'"
                                @click="abrirEditar(data)"
                            />
                            <Button
                                v-if="data.estado === 'PENDIENTE'"
                                icon="pi pi-check"
                                outlined
                                rounded
                                severity="success"
                                v-tooltip.top="'Aprobar (Convertir a Orden)'"
                                @click="confirmarAprobar(data)"
                            />
                            <Button
                                v-if="data.estado === 'PENDIENTE'"
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                v-tooltip.top="'Eliminar'"
                                @click="confirmarEliminar(data)"
                            />

                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

    

        <!-- Dialog: Detalle de producto -->
        <Dialog
            v-model:visible="detailDialog"
            :style="{ width: '620px' }"
            :breakpoints="{ '1199px': '85vw', '575px': '98vw' }"
            header="Detalle de PreOrden"
            :modal="true"
        >
            <div v-if="preOrdenSeleccionada">
                <div class="detail-grid">
                    <div class="detail-field">
                        <label>N° Documento</label>
                        <span>{{ preOrdenSeleccionada.numeroOrden }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Estado</label>
                        <span :class="['estado-badge', estadoConfig[preOrdenSeleccionada.estado]?.class]">
                            <i :class="estadoConfig[preOrdenSeleccionada.estado]?.icon" />
                            {{ estadoConfig[preOrdenSeleccionada.estado]?.label }}
                        </span>
                    </div>
                    <div class="detail-field">
                        <label>Departamento</label>
                        <span>{{ preOrdenSeleccionada.departamento || '—' }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Surtidor</label>
                        <span>{{ preOrdenSeleccionada.usuarioSurtidor || '—' }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Creado</label>
                        <span>{{ formatFecha(preOrdenSeleccionada.fechaCreacion) }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Actualizado</label>
                        <span>{{ formatFecha(preOrdenSeleccionada.fechaActualizacion) }}</span>
                    </div>
                    <div class="detail-field full">
                        <label>Progreso</label>
                        <div class="progress-detail">
                            <span>{{ preOrdenSeleccionada.itemsSurtidos }}/{{ preOrdenSeleccionada.totalItems }} productos surtidos</span>
                            <ProgressBar :value="progresoOrden(preOrdenSeleccionada)" style="height: 8px; margin-top: 0.5rem" />
                        </div>
                    </div>
                    <div class="detail-field full">
                        <label>Total Unidades</label>
                        <div class="progress-detail">
                            <span>{{ preOrdenSeleccionada.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0 }}</span>
                        </div>
                    </div>
                </div>

                <Divider />
                <p class="items-title"><i class="pi pi-list" /> Productos de la PreOrden</p>

                <DataTable :value="preOrdenSeleccionada.items" :rows="10" :paginator="preOrdenSeleccionada.items?.length > 10" size="small" stripedRows>
                    <Column field="codigoBarra" header="Código" />
                    <Column field="nombreProducto" header="Producto" />
                    <Column field="departamento" header="Dpto." />
                    <Column field="cantidad" header="Cant." style="min-width: 5rem" />
                    <Column field="estadoItem" header="Estado" style="min-width: 8rem">
                        <template #body="{ data }">
                            <span :class="['item-estado', itemEstadoConfig[data.estadoItem]?.class]">
                                <i :class="itemEstadoConfig[data.estadoItem]?.icon" />
                                {{ itemEstadoConfig[data.estadoItem]?.label }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <template #footer>
                <Button label="Imprimir PDF" icon="pi pi-file-pdf" @click="exportarPDF" />
                <!-- <Button label="Cerrar" icon="pi pi-times" text @click="detailDialog = false" /> -->
            </template>
        </Dialog>

        <!-- Dialog: Crear / Editar PreOrden -->
        <Dialog
            v-model:visible="createDialog"
            :style="{ width: '800px' }"
            :breakpoints="{ '1199px': '85vw', '575px': '98vw' }"
            :header="isEditing ? 'Editar PreOrden' : 'Crear Nueva PreOrden'"
            :modal="true"
        >
            <div class="p-fluid grid">
                <div class="col-12 md:col-6 mb-3">
                    <label>Departamento</label>
                    <Select
                        v-model="newPreOrden.departamento"
                        :options="departamentosList"
                        optionLabel="descripcion"
                        placeholder="Seleccione departamento"
                        class="w-full mt-2"
                        :filter="true"
                    />
                </div>
                <div class="col-12 md:col-6 mb-3">
                    <label>Surtidor</label>
                    <InputText
                        v-model="newPreOrden.usuarioSurtidor"
                        placeholder="Nombre o ID del surtidor"
                        class="w-full mt-2"
                        disabled
                    />
                </div>
                
                <div class="col-12 mt-2">
                    <Divider align="left">
                        <b>Productos</b>
                    </Divider>
                    
                    <div class="flex gap-2 mb-3" style="align-items: flex-end;">
                        <div style="flex-grow: 1;">
                            <label>Producto</label>
                            <Select
                                v-model="nuevoProducto.producto"
                                :options="productosList"
                                optionLabel="label"
                                placeholder="Seleccione un producto"
                                class="w-full mt-2"
                                :filter="true"
                                :virtualScrollerOptions="{ itemSize: 38 }"
                                :disabled="!newPreOrden.departamento"
                            />
                        </div>
                        <div style="width: 120px;">
                            <label>Cantidad</label>
                            <InputNumber
                                v-model="nuevoProducto.cantidad"
                                :min="1"
                                showButtons
                                class="w-full mt-2"
                            />
                        </div>
                        <div>
                            <Button
                                icon="pi pi-plus"
                                label="Agregar"
                                class="mt-2"
                                @click="agregarProducto"
                                :disabled="!nuevoProducto.producto || !newPreOrden.departamento"
                            />
                        </div>
                    </div>

                    <DataTable :value="newPreOrden.items" :rows="5" :paginator="newPreOrden.items.length > 5" size="small" stripedRows>
                        <template #empty>
                            <div class="text-center p-3 text-secondary">No se han agregado productos</div>
                        </template>
                        <Column field="codigoBarra" header="Código" />
                        <Column field="nombreProducto" header="Producto" />
                        <Column field="cantidad" header="Cant." style="width: 140px; text-align: center;">
                            <template #body="{ data }">
                                <InputNumber
                                    v-model="data.cantidad"
                                    :min="1"
                                    showButtons
                                    class="w-full"
                                    inputClass="text-center"
                                />
                            </template>
                        </Column>
                        <Column :exportable="false" header="" style="width: 60px">
                            <template #body="{ index }">
                                <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Eliminar" @click="removerProducto(index)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <template #footer>
                <!-- <Button label="Cancelar" icon="pi pi-times" text @click="createDialog = false" :disabled="creando" /> -->
                <Button label="Guardar" icon="pi pi-save" @click="guardarPreOrden" :loading="creando" />
            </template>
        </Dialog>
        <ConfirmDialog />
    </div>
</template>

<style scoped lang="scss">
.ops-container {
    padding: 1rem;
    @media (min-width: 768px) { padding: 1.5rem; }
}

.card {
    background: var(--surface-card);
    border-radius: 14px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.title {
    font-size: 1.65rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.ops-icon {
    color: var(--primary-color);
    font-size: 1.5rem;
}

.subtitle {
    font-size: 0.93rem;
    color: var(--text-color-secondary);
    margin: 0.3rem 0 0 2.1rem;
}

/* Stats Banner */
.stats-banner {
    display: flex;
    align-items: center;
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    gap: 1.5rem;
    width: fit-content;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1;
    &.stat-pendiente { color: var(--orange-400); }
    &.stat-proceso { color: var(--blue-500); }
    &.stat-lista { color: var(--green-500); }
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

.stat-divider {
    width: 1px;
    height: 2.5rem;
    background: var(--surface-300);
}

/* Toolbar */
:deep(.p-toolbar) {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
}

.toolbar-end {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.filter-select {
    min-width: 160px;
}

/* Cells */
.id-badge {
    background: var(--surface-100);
    color: var(--text-color-secondary);
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.82rem;
    font-family: monospace;
}

.dept-info {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}

.dept-avatar {
    background: var(--primary-color) !important;
    color: white !important;
    font-weight: 700;
    width: 2rem !important;
    height: 2rem !important;
    font-size: 0.85rem !important;
    flex-shrink: 0;
}

.progress-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.progress-text {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
    white-space: nowrap;
}

.fecha-text {
    font-size: 0.9rem;
    color: var(--text-color);
    &.text-secondary { color: var(--text-color-secondary); }
}

/* Estado Badges */
.estado-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.75rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;

    &.estado-pendiente {
        background: color-mix(in srgb, var(--orange-400) 12%, transparent);
        color: var(--orange-500);
        border: 1px solid color-mix(in srgb, var(--orange-400) 30%, transparent);
    }
    &.estado-proceso {
        background: color-mix(in srgb, var(--blue-500) 12%, transparent);
        color: var(--blue-600);
        border: 1px solid color-mix(in srgb, var(--blue-500) 30%, transparent);
    }
    &.estado-lista {
        background: color-mix(in srgb, var(--green-500) 12%, transparent);
        color: var(--green-600);
        border: 1px solid color-mix(in srgb, var(--green-500) 30%, transparent);
    }
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

/* Empty / Loading */
.empty-state, .loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
    p { margin: 0.75rem 0; font-size: 1rem; }
}

/* Scan Dialog */
.scan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.scan-progress-label {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    font-weight: 600;
}

.scan-input-area {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
}

.scan-label {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
    color: var(--text-color);
}

.scan-row {
    display: flex;
    gap: 0.5rem;
}

.scan-input {
    flex: 1;
}

.scan-hint {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.77rem;
    color: var(--text-color-secondary);
}

.camara-panel {
    margin-bottom: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid var(--surface-200);
    background: var(--surface-0);
}

.camara-acciones {
    margin-bottom: 0.75rem;
}

.btn-camara {
    width: 100%;
    @media (min-width: 768px) {
        width: auto;
        min-width: 220px;
    }
}

.camara-host {
    width: 100%;
    min-height: 220px;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-900);
    margin-bottom: 0.5rem;
}

:deep(.camara-host video) {
    width: 100% !important;
    border-radius: 10px;
}

.camara-error {
    font-size: 0.88rem;
    color: var(--red-500);
    margin: 0 0 0.75rem;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
}

.camara-hint {
    font-size: 0.77rem;
    color: var(--text-color-secondary);
    margin: 0;
    line-height: 1.45;
}

.scan-result {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    font-weight: 600;

    &.result-ok {
        background: color-mix(in srgb, var(--green-500) 10%, transparent);
        color: var(--green-600);
        border: 1px solid color-mix(in srgb, var(--green-500) 25%, transparent);
    }
    &.result-error {
        background: color-mix(in srgb, var(--red-400) 10%, transparent);
        color: var(--red-500);
        border: 1px solid color-mix(in srgb, var(--red-400) 25%, transparent);
    }
}

/* Items List */
.items-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 260px;
    overflow-y: auto;
}

.item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.9rem;
    border-radius: 8px;
    border: 1px solid var(--surface-200);
    gap: 0.5rem;

    &.item-surtido {
        background: color-mix(in srgb, var(--green-500) 7%, transparent);
        border-color: color-mix(in srgb, var(--green-500) 25%, transparent);
    }
    &.item-pendiente {
        background: var(--surface-50);
    }
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
    min-width: 0;
}

.item-name {
    font-weight: 600;
    font-size: 0.88rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-dept {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
}

.item-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.item-barcode {
    font-family: monospace;
    font-size: 0.82rem;
    color: var(--text-color-secondary);
}

.item-qty {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-color);
}

.item-estado {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;

    &.surtido { color: var(--green-500); }
    &.pendiente { color: var(--orange-400); }
    &.no-surtido { color: var(--red-500); }
}

/* Detail Dialog */
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.detail-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    span { font-size: 0.92rem; color: var(--text-color); }

    &.full { grid-column: 1 / -1; }
}

.progress-detail span {
    font-size: 0.88rem;
    color: var(--text-color-secondary);
}

.items-title {
    font-size: 0.92rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.ml-2 { margin-left: 0.5rem; }
.text-primary { color: var(--primary-color); }
</style>
