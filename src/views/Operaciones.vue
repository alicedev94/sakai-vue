<script setup>
import { useOperacionesStore } from '@/stores/operaciones';
import { FilterMatchMode } from '@primevue/core/api';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toast = useToast();
const store = useOperacionesStore();
const confirm = useConfirm();

const searchQuery = ref('');
const filtroFecha = ref(new Date());
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

const scanDialog = ref(false);
const detailDialog = ref(false);
const ordenSeleccionada = ref(null);
const codigoEscaneado = ref('');
const scanInput = ref(null);
const isScanning = ref(false);
const lastScanResult = ref(null);

const cameraActiva = ref(false);
const cameraLoading = ref(false);
const cameraError = ref(null);
let html5Scanner = null;
let decodeLock = false;
const ultimoEscaneoFueCamara = ref(false);

const CAMARA_HOST_ID = 'camara-surtido-host';

const FORMATOS_BARRAS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE
];

const ESTADOS = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Proceso', value: 'EN_PROCESO' },
    { label: 'Lista', value: 'LISTA' }
];
const filtroEstado = ref(null);

const ordenesFiltradas = computed(() => {
    let lista = store.ordenes;
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
        await store.fetchOrdenes(params);
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudieron cargar las órdenes', life: 5000 });
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
        ordenSeleccionada.value = store.ordenActiva;
        detailDialog.value = true;
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo cargar el detalle', life: 4000 });
    }
}

async function abrirSurtido(orden) {
    try {
        if (orden.estado === 'PENDIENTE') {
            await store.iniciarOrden(orden.id);
            toast.add({ severity: 'info', summary: 'Iniciado', detail: `Orden ${orden.numeroOrden} en proceso`, life: 2500 });
        } else {
            await store.cargarOrdenDetalle(orden.id);
        }
        ordenSeleccionada.value = store.ordenActiva;
        codigoEscaneado.value = '';
        lastScanResult.value = null;
        scanDialog.value = true;
        await nextTick();
        scanInput.value?.$el?.focus();
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'No se pudo iniciar el surtido', life: 4000 });
    }
}

async function procesarEscaneo(codigoDesdeCamara) {
    const codigo =
        typeof codigoDesdeCamara === 'string' && codigoDesdeCamara.length > 0
            ? codigoDesdeCamara.trim()
            : codigoEscaneado.value?.trim();
    if (!codigo || !ordenSeleccionada.value) return;

    isScanning.value = true;
    try {
        const resultado = await store.escanear(ordenSeleccionada.value.id, codigo);
        lastScanResult.value = resultado;
        ordenSeleccionada.value = store.ordenActiva;

        if (!resultado.encontrado) {
            toast.add({ severity: 'warn', summary: 'No encontrado', detail: resultado.mensaje, life: 3000 });
        } else if (resultado.ordenCompleta) {
            toast.add({ severity: 'success', summary: '¡Orden lista!', detail: resultado.mensaje, life: 4000 });
            scanDialog.value = false;
        } else {
            toast.add({ severity: 'success', summary: 'Surtido', detail: resultado.itemActualizado?.nombreProducto || resultado.mensaje, life: 2000 });
        }
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'Error en el escaneo', life: 4000 });
    } finally {
        isScanning.value = false;
        codigoEscaneado.value = '';
        const fueCamara = ultimoEscaneoFueCamara.value;
        ultimoEscaneoFueCamara.value = false;
        await nextTick();
        if (!scanDialog.value || ordenSeleccionada.value?.estado === 'LISTA') return;
        if (fueCamara) {
            await iniciarCamara();
        } else {
            scanInput.value?.$el?.focus();
        }
    }
}

function mensajeFalloCamara(err) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        return 'La cámara no funciona con HTTP desde la IP de tu red (ej. http://192.168…). Arranca el front con npm run dev y en el celular abre https://TU-IP:3000/v1/ (acepta la advertencia del certificado).';
    }
    const name = err?.name || '';
    const msg = String(err?.message || err || '');
    if (name === 'NotAllowedError' || /denied|Permission|permi/i.test(msg)) {
        return 'Permiso de cámara denegado. En el navegador del celular, permite el acceso a la cámara para este sitio.';
    }
    if (name === 'NotFoundError') {
        return 'No se encontró ninguna cámara.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
        return 'La cámara está en uso por otra app o no está disponible.';
    }
    if (name === 'OverconstrainedError') {
        return 'La cámara no admite el modo solicitado. Prueba otra cámara o reinicia el navegador.';
    }
    if (name === 'SecurityError') {
        return 'El navegador bloqueó la cámara por seguridad. Usa HTTPS (ver mensaje anterior) o un túnel (ngrok, Cloudflare Tunnel).';
    }
    if (name === 'AbortError') {
        return 'Acceso a la cámara cancelado.';
    }
    return msg ? `No se pudo usar la cámara: ${msg}` : 'No se pudo usar la cámara.';
}

async function detenerCamara() {
    cameraError.value = null;
    if (!html5Scanner) {
        cameraActiva.value = false;
        cameraLoading.value = false;
        return;
    }
    const scanner = html5Scanner;
    html5Scanner = null;
    try {
        await scanner.stop();
    } catch {
        /* ya detenido */
    }
    try {
        scanner.clear();
    } catch {
        /* */
    }
    cameraActiva.value = false;
    cameraLoading.value = false;
}

async function iniciarCamara() {
    if (!ordenSeleccionada.value || ordenSeleccionada.value.estado === 'LISTA') return;
    if (html5Scanner) await detenerCamara();

    cameraError.value = null;

    if (typeof window !== 'undefined' && !window.isSecureContext) {
        cameraActiva.value = false;
        cameraError.value = mensajeFalloCamara({});
        toast.add({ severity: 'warn', summary: 'Cámara', detail: cameraError.value, life: 9000 });
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        cameraActiva.value = false;
        cameraError.value = 'Tu navegador no permite acceder a la cámara desde esta página.';
        toast.add({ severity: 'warn', summary: 'Cámara', detail: cameraError.value, life: 6000 });
        return;
    }

    cameraLoading.value = true;
    decodeLock = false;
    cameraActiva.value = true;

    try {
        await nextTick();

        const qrbox = (vw, vh) => {
            const edge = Math.min(vw, vh);
            const w = Math.floor(edge * 0.92);
            return { width: w, height: Math.max(100, Math.floor(w * 0.42)) };
        };

        const configFull = {
            fps: 10,
            qrbox,
            formatsToSupport: [...FORMATOS_BARRAS]
        };
        const configLite = { fps: 10, qrbox };

        const onDecode = async (texto) => {
            const codigo = texto?.trim();
            if (!codigo || decodeLock || isScanning.value) return;
            decodeLock = true;
            ultimoEscaneoFueCamara.value = true;
            try {
                await detenerCamara();
                await procesarEscaneo(codigo);
            } finally {
                setTimeout(() => {
                    decodeLock = false;
                }, 600);
            }
        };

        const attempts = [
            [{ facingMode: 'environment' }, configFull],
            [{ facingMode: 'user' }, configFull],
            [{ facingMode: 'environment' }, configLite],
            [{ facingMode: 'user' }, configLite],
            [{}, configLite]
        ];

        let lastErr = null;
        for (const [cam, cfg] of attempts) {
            try {
                if (html5Scanner) {
                    try {
                        await html5Scanner.stop();
                    } catch {
                        /* */
                    }
                    try {
                        html5Scanner.clear();
                    } catch {
                        /* */
                    }
                    html5Scanner = null;
                }
                html5Scanner = new Html5Qrcode(CAMARA_HOST_ID);
                await html5Scanner.start(cam, cfg, onDecode, () => {});
                lastErr = null;
                break;
            } catch (e) {
                lastErr = e;
                html5Scanner = null;
            }
        }

        if (lastErr) throw lastErr;
    } catch (e) {
        await detenerCamara();
        cameraError.value = mensajeFalloCamara(e);
        toast.add({ severity: 'warn', summary: 'Cámara', detail: cameraError.value, life: 8000 });
    } finally {
        cameraLoading.value = false;
    }
}

watch(scanDialog, async (abierto) => {
    if (!abierto) {
        await detenerCamara();
        ultimoEscaneoFueCamara.value = false;
        store.limpiarOrdenActiva();
        ordenSeleccionada.value = null;
        lastScanResult.value = null;
    }
});

onMounted(cargarDatos);

onUnmounted(detenerCamara);

const exportarPDF = () => {
    const doc = new jsPDF();
    const data = ordenSeleccionada.value;
    
    const primaryColor = [22, 163, 74]; // Verde PrimeVue (green-600)
    
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Detalle Orden', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${formatFecha(new Date())}`, 14, 30);
    
    doc.setDrawColor(230);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text('Información', 14, 45);
    
    const infoGeneral = [
        ['N° Documento:', data.numeroOrden || 'N/A', 'Estado:', data.estado || 'N/A'],
        ['Departamento:', data.departamento || '—', 'Surtidor:', data.usuarioSurtidor || '—'],
        ['Creado:', formatFecha(data.fechaCreacion), 'Actualizado:', formatFecha(data.fechaActualizacion)],
        ['Finalizado:', formatFecha(data.fechaFinalizacion)]
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
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
    }
    
    doc.save(`Doc_${data.numeroOrden || data.id}.pdf`);
};

const finalizarOrden = async () => {
    confirm.require({
        message: '¿Estás seguro de que deseas finalizar esta Orden? Los items no surtidos se marcarán como NO_SURTIDO.',
        header: 'Confirmar Finalización',
        icon: 'pi pi-check-circle',
        acceptClass: 'p-button-success',
        acceptLabel: 'Finalizar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                await store.finalizarOrden(ordenSeleccionada.value.id);
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Orden finalizada correctamente', life: 4000 });
                detailDialog.value = false;
                await cargarDatos();
            } catch (error) {
                console.log(error);
                toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'No se pudo finalizar la orden', life: 4000 });
            }
        }
    });
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
                        Módulo de Operaciones
                    </h2>
                    <p class="subtitle">Gestión de surtido y escaneo de órdenes</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-banner">
                <div class="stat-item">
                    <span class="stat-value">{{ store.totalOrdenes }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-pendiente">{{ store.ordenesPendientes.length }}</span>
                    <span class="stat-label">Pendientes</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-proceso">{{ store.ordenesEnProceso.length }}</span>
                    <span class="stat-label">En Proceso</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-lista">{{ store.ordenesListas.length }}</span>
                    <span class="stat-label">Listas</span>
                </div>
            </div>

            <!-- Toolbar -->
            <Toolbar class="mb-5">
                <template #start>
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
                                placeholder="Buscar orden o departamento..."
                                style="width: clamp(200px, 28vw, 360px)"
                            />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- Tabla -->
            <DataTable
                :value="ordenesFiltradas"
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
                        <p>No hay órdenes de operaciones</p>
                    </div>
                </template>
                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando órdenes...</p>
                    </div>
                </template>

                <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column>

                <Column field="numeroOrden" header="N° Orden" :sortable="true" style="min-width: 12rem">
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

                <Column field="estado" header="Estado" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span :class="['estado-badge', estadoConfig[data.estado]?.class]">
                            <i :class="estadoConfig[data.estado]?.icon" />
                            {{ estadoConfig[data.estado]?.label }}
                        </span>
                    </template>
                </Column>

                <Column field="fechaCreacion" header="Fecha Creación" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text">{{ formatFecha(data.fechaCreacion) }}</span>
                    </template>
                </Column>

                <Column field="fechaFinalizacion" header="Fecha Finalización" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text">{{ formatFecha(data.fechaFinalizacion) }}</span>
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
                                v-if="data.estado !== 'LISTA'"
                                icon="pi pi-barcode"
                                outlined
                                rounded
                                v-tooltip.top="data.estado === 'PENDIENTE' ? 'Iniciar surtido' : 'Continuar surtido'"
                                @click="abrirSurtido(data)"
                            />
                            <Button
                                v-else
                                icon="pi pi-check-circle"
                                outlined
                                rounded
                                severity="success"
                                v-tooltip.top="'Orden completada'"
                                disabled
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog: Surtido / Escaneo -->
        <Dialog
            v-model:visible="scanDialog"
            :style="{ width: '680px' }"
            :breakpoints="{ '1199px': '90vw', '575px': '98vw' }"
            header="Surtido de Orden"
            :modal="true"
        >
            <div v-if="ordenSeleccionada">
                <div class="scan-header">
                    <div class="scan-order-info">
                        <span class="font-bold text-lg">{{ ordenSeleccionada.numeroOrden }}</span>
                        <span :class="['estado-badge ml-2', estadoConfig[ordenSeleccionada.estado]?.class]">
                            <i :class="estadoConfig[ordenSeleccionada.estado]?.icon" />
                            {{ estadoConfig[ordenSeleccionada.estado]?.label }}
                        </span>
                    </div>
                    <span class="scan-progress-label">
                        {{ ordenSeleccionada.itemsSurtidos }}/{{ ordenSeleccionada.totalItems }} surtidos
                    </span>
                </div>

                <ProgressBar
                    :value="progresoOrden(ordenSeleccionada)"
                    style="height: 8px; margin-bottom: 1.25rem"
                    :showValue="false"
                />

                <!-- Input de escaneo -->
                <div class="scan-input-area">
                    <label class="scan-label"><i class="pi pi-barcode" /> Escanear código de barras</label>
                    <div class="scan-row">
                        <InputText
                            ref="scanInput"
                            v-model="codigoEscaneado"
                            placeholder="Escanea o escribe el código..."
                            class="scan-input"
                            @keyup.enter="procesarEscaneo"
                            :disabled="isScanning || (ordenSeleccionada && ordenSeleccionada.estado === 'LISTA')"
                        />
                        <Button
                            icon="pi pi-send"
                            :loading="isScanning"
                            @click="procesarEscaneo"
                            :disabled="!codigoEscaneado || ordenSeleccionada.estado === 'LISTA'"
                        />
                    </div>
                    <small class="scan-hint">Teclado: Enter o el botón. Pistola USB suele escribir aquí y enviar Enter.</small>
                </div>

                <div class="camara-panel">
                    <div class="camara-acciones">
                        <Button
                            v-if="!cameraActiva"
                            label="Escanear con cámara"
                            icon="pi pi-camera"
                            class="btn-camara"
                            :loading="cameraLoading"
                            :disabled="ordenSeleccionada.estado === 'LISTA' || isScanning"
                            @click="iniciarCamara"
                        />
                        <Button
                            v-else
                            label="Detener cámara"
                            icon="pi pi-stop"
                            severity="secondary"
                            outlined
                            class="btn-camara"
                            :disabled="isScanning"
                            @click="detenerCamara"
                        />
                    </div>
                    <p v-if="cameraError" class="camara-error">
                        <i class="pi pi-exclamation-circle" /> {{ cameraError }}
                    </p>
                    <div
                        v-show="cameraActiva || cameraLoading"
                        :id="CAMARA_HOST_ID"
                        class="camara-host"
                    />
                    <p class="camara-hint">
                        Desde el celular abre
                        <strong>https://</strong> más la IP de tu PC y el puerto (ej.
                        <strong>https://192.168.1.10:3000/v1/</strong>), mismo Wi‑Fi.
                        Si el navegador advierte del certificado en desarrollo, elige avanzar / confiar.
                        Pistola lectora o teclado pueden usar el campo de arriba.
                    </p>
                </div>

                <!-- Resultado del último escaneo -->
                <div v-if="lastScanResult" :class="['scan-result', lastScanResult.encontrado ? 'result-ok' : 'result-error']">
                    <i :class="lastScanResult.encontrado ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                    <span>{{ lastScanResult.mensaje }}</span>
                </div>

                <!-- Lista de ítems -->
                <div class="items-list">
                    <div
                        v-for="item in ordenSeleccionada.items"
                        :key="item.id"
                        :class="['item-row', item.estadoItem === 'SURTIDO' ? 'item-surtido' : 'item-pendiente']"
                    >
                        <div class="item-info">
                            <span class="item-name">{{ item.nombreProducto || 'Producto' }}</span>
                            <span class="item-dept">{{ item.departamento }}</span>
                        </div>
                        <div class="item-right">
                            <span class="item-barcode">{{ item.codigoBarra }}</span>
                            <span class="item-qty">x{{ item.cantidad }}</span>
                            <span :class="['item-estado', itemEstadoConfig[item.estadoItem]?.class]">
                                <i :class="itemEstadoConfig[item.estadoItem]?.icon" />
                                {{ itemEstadoConfig[item.estadoItem]?.label }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <!-- <Button label="Cerrar" icon="pi pi-times" text @click="scanDialog = false" /> -->
            </template>
        </Dialog>

        <!-- Dialog: Detalle de producto -->
        <Dialog
            v-model:visible="detailDialog"
            :style="{ width: '620px' }"
            :breakpoints="{ '1199px': '85vw', '575px': '98vw' }"
            header="Detalle de Orden"
            :modal="true"
        >
            <div v-if="ordenSeleccionada">
                <div class="detail-grid">
                    <div class="detail-field">
                        <label>N° Documento</label>
                        <span>{{ ordenSeleccionada.numeroOrden }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Estado</label>
                        <span :class="['estado-badge', estadoConfig[ordenSeleccionada.estado]?.class]">
                            <i :class="estadoConfig[ordenSeleccionada.estado]?.icon" />
                            {{ estadoConfig[ordenSeleccionada.estado]?.label }}
                        </span>
                    </div>
                    <div class="detail-field">
                        <label>Departamento</label>
                        <span>{{ ordenSeleccionada.departamento || '—' }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Surtidor</label>
                        <span>{{ ordenSeleccionada.usuarioSurtidor || '—' }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Fecha Creación</label>
                        <span>{{ formatFecha(ordenSeleccionada.fechaCreacion) }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Fecha Actualización</label>
                        <span>{{ formatFecha(ordenSeleccionada.fechaActualizacion) }}</span>
                    </div>
                    <div class="detail-field">
                        <label>Fecha Finalización</label>
                        <span>{{ formatFecha(ordenSeleccionada.fechaFinalizacion) }}</span>
                    </div>
                    <div class="detail-field full">
                        <label>Progreso</label>
                        <div class="progress-detail">
                            <span>{{ ordenSeleccionada.itemsSurtidos }}/{{ ordenSeleccionada.totalItems }} productos surtidos</span>
                            <ProgressBar :value="progresoOrden(ordenSeleccionada)" style="height: 8px; margin-top: 0.5rem" />
                        </div>
                    </div>
                    <div class="detail-field full">
                        <label>Total unidades</label>
                        <div class="progress-detail">
                            <span>{{ ordenSeleccionada.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0 }}</span>
                        </div>
                    </div>
                </div>

                <Divider />
                <p class="items-title"><i class="pi pi-list" /> Productos de la orden</p>

                <DataTable :value="ordenSeleccionada.items" :rows="10" :paginator="ordenSeleccionada.items?.length > 10" size="small" stripedRows>
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
                <!-- <Button label="Cerrar" icon="pi pi-times" text @click="detailDialog = false" /> -->
                <Button label="Imprimir PDF" icon="pi pi-file-pdf" @click="exportarPDF" />
                <Button 
                    v-if="ordenSeleccionada?.estado !== 'LISTA' && ordenSeleccionada?.estado !== 'PENDIENTE'"
                    label="Finalizar Orden" 
                    icon="pi pi-check" 
                    severity="success"
                    @click="finalizarOrden" 
                />
                <Button
                    v-if="ordenSeleccionada?.estado !== 'LISTA'"
                    label="Surtir Orden"
                    icon="pi pi-barcode"
                    @click="() => { detailDialog = false; abrirSurtido(ordenSeleccionada); }"
                />
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
