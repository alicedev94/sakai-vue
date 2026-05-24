<script setup>
import { useOperacionesStore } from '@/stores/operaciones';
import { useUbicationsStore } from '@/stores/ubications';
import { FilterMatchMode } from '@primevue/core/api';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toast = useToast();
const store = useOperacionesStore();
const ubiStore = useUbicationsStore();
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

const cantidadSurtir = ref(1);
const cantidadMax = ref(1);
const itemEncontrado = ref(null);
const mostrarCantidad = ref(false);
const codigoPendiente = ref('');
const origenFueCamara = ref(false);
const cantidadInput = ref(null);
const cantidadInventarioPiso = ref(null);
const cantidadInventarioAlmacen = ref(null);
const inventarioUbicacion = ref(null);

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
    return store.ordenes;
});

const progresoOrden = (orden) => {
    if (!orden.totalUnidades) return 0;
    return Math.round(((orden.unidadesSurtidas || 0) / orden.totalUnidades) * 100);
};

const progresoItem = (item) => {
    if (!item.cantidad) return 0;
    return Math.round(((item.cantidadSurtida || 0) / item.cantidad) * 100);
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

const getEfectividadColor = (valor) => {
    if (valor >= 100) return 'text-green-600 font-bold';
    if (valor >= 80) return 'text-blue-600 font-bold';
    if (valor >= 50) return 'text-orange-500 font-bold';
    return 'text-red-600 font-bold';
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

const lazyParams = ref({
    page: 0,
    size: 10
});

function onPage(event) {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    cargarDatos();
}

async function cargarDatos() {
    try {
        const params = {
            page: lazyParams.value.page,
            size: lazyParams.value.size
        };
        if (filtroFecha.value) {
            params.fecha = formatDateForApi(filtroFecha.value);
        }
        if (filtroEstado.value) {
            params.estado = filtroEstado.value;
        }
        if (searchQuery.value) {
            params.query = searchQuery.value;
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

        if (ordenSeleccionada.value?.items) {
            const promises = ordenSeleccionada.value.items
                .filter(it => it.codigoBarra)
                .map(async (it) => {
                    try {
                        const inv = await store.obtenerInventarioUbicacion(it.codigoBarra);
                        if (inv) {
                            it.r3Piso = inv.piso ?? 0;
                            it.r3Almacen = inv.almacen ?? 0;
                        }
                    } catch {
                        it.r3Piso = '-';
                        it.r3Almacen = '-';
                    }
                });
            await Promise.all(promises);
        }

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

        if (ordenSeleccionada.value?.items) {
            const promises = ordenSeleccionada.value.items
                .filter(it => it.codigoBarra)
                .map(async (it) => {
                    try {
                        const inv = await store.obtenerInventarioUbicacion(it.codigoBarra);
                        if (inv) {
                            it.r3Piso = inv.piso ?? 0;
                            it.r3Almacen = inv.almacen ?? 0;
                        }
                    } catch {
                        it.r3Piso = '-';
                        it.r3Almacen = '-';
                    }
                });
            await Promise.all(promises);
        }

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

    // Buscar el item en la orden que coincida con el código escaneado
    const items = ordenSeleccionada.value.items || [];

    // DEBUG - revisar en consola del navegador (F12)
    console.log('🔍 Código escaneado:', JSON.stringify(codigo));
    console.log('📦 Items en orden:', items.map(i => ({ codigo: i.codigoBarra, estado: i.estadoItem, cantidad: i.cantidad, cantidadSurtida: i.cantidadSurtida })));

    const item = items.find(
        (i) => (
            i.codigoBarra === codigo ||
            i.barra1 === codigo ||
            i.barra2 === codigo ||
            i.barra3 === codigo ||
            i.barra4 === codigo ||
            i.barra5 === codigo ||
            i.barra6 === codigo ||
            i.barra7 === codigo
        ) && i.estadoItem === 'PENDIENTE'
    );
    console.log('✅ Item encontrado:', item ? item.nombreProducto : 'NINGUNO');

    if (!item) {
        // Si no hay coincidencia pendiente, dejamos que el backend responda
        // (puede ser un código no válido o ya surtido)
        isScanning.value = true;
        try {
            const resultado = await store.escanear(ordenSeleccionada.value.id, codigo, 1);
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
        }
        return;
    }

    // Item encontrado: calcular restante y mostrar panel de cantidad
    const cantidadRestante = item.cantidad - (item.cantidadSurtida || 0);
    if (cantidadRestante <= 0) {
        toast.add({ severity: 'info', summary: 'Ya surtido', detail: `${item.nombreProducto} ya fue surtido completamente`, life: 3000 });
        codigoEscaneado.value = '';
        return;
    }

    itemEncontrado.value = item;
    codigoPendiente.value = codigo;
    cantidadMax.value = cantidadRestante;
    cantidadSurtir.value = cantidadRestante; // Por defecto la cantidad máxima
    origenFueCamara.value = ultimoEscaneoFueCamara.value;
    mostrarCantidad.value = true;
    codigoEscaneado.value = '';
    
    // Consulta dinámica del inventario desglosado por ubicación
    cantidadInventarioPiso.value = 'Calculando...';
    cantidadInventarioAlmacen.value = 'Calculando...';
    inventarioUbicacion.value = null;
    try {
        const inv = await store.obtenerInventarioUbicacion(item.codigoBarra);
        inventarioUbicacion.value = inv;
        cantidadInventarioPiso.value = inv.piso;
        cantidadInventarioAlmacen.value = inv.almacen;
    } catch (e) {
        console.error('Error al consultar inventario por ubicación:', e);
        cantidadInventarioPiso.value = 'Error';
        cantidadInventarioAlmacen.value = 'Error';
    }

    await nextTick();
    cantidadInput.value?.$el?.querySelector('input')?.focus();
}

async function confirmarSurtido() {
    if (!codigoPendiente.value || !ordenSeleccionada.value) return;

    const cantidad = Math.max(1, Math.min(cantidadSurtir.value, cantidadMax.value));

    isScanning.value = true;
    mostrarCantidad.value = false;
    try {
        const resultado = await store.escanear(ordenSeleccionada.value.id, codigoPendiente.value, cantidad);
        lastScanResult.value = resultado;
        ordenSeleccionada.value = store.ordenActiva;

        if (!resultado.encontrado) {
            toast.add({ severity: 'warn', summary: 'No encontrado', detail: resultado.mensaje, life: 3000 });
        } else if (resultado.ordenCompleta) {
            toast.add({ severity: 'success', summary: '¡Orden lista!', detail: resultado.mensaje, life: 4000 });
            scanDialog.value = false;
        } else {
            toast.add({ severity: 'success', summary: 'Surtido', detail: `${itemEncontrado.value?.nombreProducto || 'Producto'} x${cantidad}`, life: 2000 });
        }
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.userMessage || 'Error en el escaneo', life: 4000 });
    } finally {
        isScanning.value = false;
        codigoPendiente.value = '';
        itemEncontrado.value = null;
        cantidadSurtir.value = 1;
        cantidadMax.value = 1;
        const fueCamara = origenFueCamara.value;
        origenFueCamara.value = false;
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

function cancelarSurtido() {
    mostrarCantidad.value = false;
    codigoPendiente.value = '';
    itemEncontrado.value = null;
    cantidadSurtir.value = 1;
    cantidadMax.value = 1;
    origenFueCamara.value = false;
    nextTick(() => {
        scanInput.value?.$el?.focus();
    });
}

// Ordenación de productos por ubicación
function obtenerTextoUbicacion(item) {
    if (!item.ubicaciones || item.ubicaciones.length === 0) {
        return 'zzzzzzzzzz'; // Los que no tienen ubicación se muestran al final
    }
    return item.ubicaciones.map((u) => u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion).join(', ').toLowerCase();
}

function ordenarItemsPorUbicacion(items) {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
        const ubiA = obtenerTextoUbicacion(a);
        const ubiB = obtenerTextoUbicacion(b);
        return ubiA.localeCompare(ubiB, 'es', { sensitivity: 'base', numeric: true });
    });
}

watch(() => ordenSeleccionada.value?.items, (nuevosItems) => {
    if (nuevosItems && nuevosItems.length > 0) {
        const copia = ordenarItemsPorUbicacion(nuevosItems);
        const yaOrdenado = nuevosItems.every((item, idx) => item.id === copia[idx].id && item.cantidad === copia[idx].cantidad && item.cantidadSurtida === copia[idx].cantidadSurtida);
        if (!yaOrdenado) {
            ordenSeleccionada.value.items = copia;
        }
    }
}, { deep: true });

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
        mostrarCantidad.value = false;
        itemEncontrado.value = null;
        codigoPendiente.value = '';
        cantidadSurtir.value = 1;
        cantidadMax.value = 1;
        origenFueCamara.value = false;
    }
});

onMounted(cargarDatos);

onUnmounted(detenerCamara);

const exportarPDF = () => {
    const doc = new jsPDF();
    const data = ordenSeleccionada.value;
    console.log(data);
    
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
    
    const totalUnidades = data.totalUnidades || 0;
    doc.text('Resumen de Totales', 14, doc.lastAutoTable.finalY + 10);
    
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        body: [
            ['Total Renglones:', data.totalItems || 0, 'Renglones Surtidos:', data.itemsSurtidos || 0],
            ['Total Unidades:', totalUnidades, 'Unidades Surtidas:', data.unidadesSurtidas || 0],
            ['Efectividad:', `${progresoOrden(data)}%`, 'Pendiente:', totalUnidades - (data.unidadesSurtidas || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 }
    });
    
    doc.text('Lista de Productos', 14, doc.lastAutoTable.finalY + 10);
    
    const tableData = data.items.map(item => [
        item.codigoBarra,
        item.nombreProducto,
        item.atributo || '—',
        item.departamento || '—',
        item.cantidad,
        item.estadoItem,
        item.cantidadSurtida
    ]);
    
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Código', 'Producto', 'Atributo', 'Dpto.', 'Cantidad', 'Estado', 'Cantidad Surtida']],
        body: tableData,
        headStyles: { fillColor: primaryColor },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
        columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' }
        }
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
                        <!-- <i class="pi pi-box ops-icon" /> -->
                        Módulo de Operaciones
                    </h2>
                    <p class="subtitle">Gestión de surtido de órdenes</p>
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
            <Toolbar class="mb-5 flex flex-col md:flex-row gap-4">
                <template #start>
                    <div class="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            v-tooltip.top="'Actualizar'"
                            :loading="store.isLoading"
                            @click="cargarDatos"
                            class="flex-1 md:flex-none"
                        />
                        <Button
                            icon="pi pi-filter-slash"
                            severity="secondary"
                            outlined
                            v-tooltip.top="'Limpiar filtros'"
                            @click="clearFilters"
                            class="flex-1 md:flex-none"
                        />
                    </div>
                </template>
                <template #end>
                    <div class="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
                        <Select
                            v-model="filtroEstado"
                            :options="ESTADOS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los estados"
                            class="w-full md:w-44"
                        />
                        <Calendar 
                            v-model="filtroFecha" 
                            dateFormat="yy-mm-dd" 
                            placeholder="Fecha de consulta" 
                            :showIcon="true"
                            class="w-full md:w-44"
                        />
                        <IconField class="w-full md:w-auto">
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText
                                v-model="searchQuery"
                                placeholder="Orden o Dep..."
                                class="w-full md:w-[20rem]"
                            />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- Tabla (Escritorio) -->
            <DataTable
                class="hidden md:block"
                :value="ordenesFiltradas"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                lazy
                :totalRecords="store.totalOrdenes"
                :first="lazyParams.page * lazyParams.size"
                @page="onPage"
                :rows="lazyParams.size"
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

                <!-- <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column> -->

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
                            <span class="progress-text">
                                {{ data.itemsSurtidos || 0 }}/{{ data.totalItems || 0 }} reng.
                                ({{ data.unidadesSurtidas || 0 }}/{{ data.totalUnidades || 0 }} unid.)
                            </span>
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

            <!-- Vista de Tarjetas (Móvil) -->
            <div class="block md:hidden">
                <div v-if="store.isLoading && (!ordenesFiltradas || ordenesFiltradas.length === 0)" class="loading-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-spin pi-spinner text-primary mb-3" style="font-size: 2rem" />
                    <p class="text-secondary m-0">Cargando órdenes...</p>
                </div>
                <div v-else-if="!store.isLoading && (!ordenesFiltradas || ordenesFiltradas.length === 0)" class="empty-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-inbox mb-3" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p class="text-secondary m-0">No hay órdenes de operaciones</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner text-primary" style="font-size: 3rem" />
                    </div>
                    <div v-for="data in ordenesFiltradas" :key="data.id" class="card p-4 mb-0 flex flex-col gap-3">
                        <div class="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-3">
                            <span class="font-semibold text-primary text-lg">{{ data.numeroOrden }}</span>
                            <span :class="['estado-badge', estadoConfig[data.estado]?.class]">
                                <i :class="estadoConfig[data.estado]?.icon" />
                                {{ estadoConfig[data.estado]?.label }}
                            </span>
                        </div>
                        
                        <div class="flex flex-col gap-2 text-sm text-surface-700 dark:text-surface-0">
                            <!-- <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">ID:</span>
                                <span>#{{ data.id }}</span>
                            </div> -->
                            <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Tipo Documento:</span>
                                <span class="font-semibold">{{ data.tipoDocumento }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Departamento:</span>
                                <div class="dept-info m-0" v-if="data.departamento">
                                    <!-- <Avatar :label="data.departamento?.charAt(0).toUpperCase()" shape="circle" class="w-1rem h-1rem text-xs mr-2 bg-primary text-white" /> -->
                                    <span>{{ data.departamento }}</span>
                                </div>
                                <span v-else class="text-surface-500 dark:text-surface-400">—</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Productos:</span>
                                <div class="progress-cell m-0 items-center">
                                    <span class="progress-text mr-2">
                                        {{ data.itemsSurtidos || 0 }}/{{ data.totalItems || 0 }} reng.
                                        ({{ data.unidadesSurtidas || 0 }}/{{ data.totalUnidades || 0 }} unid.)
                                    </span>
                                    <ProgressBar :value="progresoOrden(data)" style="height: 6px; width: 60px" :showValue="false" />
                                </div>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Fecha Creación:</span>
                                <span class="fecha-text">{{ formatFecha(data.fechaCreacion) }}</span>
                            </div>
                            <div class="flex justify-between" v-if="data.fechaFinalizacion">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Fecha Finalización:</span>
                                <span class="fecha-text">{{ formatFecha(data.fechaFinalizacion) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Surtidor:</span>
                                <span class="fecha-text">{{ data.usuarioSurtidor || '—' }}</span>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-700">
                            <Button icon="pi pi-eye" outlined rounded severity="secondary" v-tooltip.top="'Ver detalle'" @click="verDetalle(data)" />
                            <Button v-if="data.estado !== 'LISTA'" icon="pi pi-barcode" outlined rounded v-tooltip.top="data.estado === 'PENDIENTE' ? 'Iniciar surtido' : 'Continuar surtido'" @click="abrirSurtido(data)" />
                            <Button v-else icon="pi pi-check-circle" outlined rounded severity="success" disabled />
                        </div>
                    </div>
                </div>
                
                <Paginator 
                    v-if="store.totalOrdenes > 0"
                    :first="lazyParams.page * lazyParams.size"
                    :rows="lazyParams.size"
                    :totalRecords="store.totalOrdenes"
                    @page="onPage"
                    template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first}-{last} de {totalRecords}"
                    class="mt-4 border-t border-surface-200 dark:border-surface-700 bg-transparent"
                />
            </div>
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
                        {{ ordenSeleccionada.items?.filter(i => (i.cantidadSurtida || 0) >= (i.cantidad || 0)).length || 0 }}/{{ ordenSeleccionada.items?.length || 0 }} renglones con
                        {{ ordenSeleccionada.items?.reduce((acc, i) => acc + (i.cantidadSurtida || 0), 0) || 0 }}/{{ ordenSeleccionada.items?.reduce((acc, i) => acc + (i.cantidad || 0), 0) || 0 }} unidades surtidas
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
                            :disabled="isScanning || mostrarCantidad || (ordenSeleccionada && ordenSeleccionada.estado === 'LISTA')"
                        />
                        <Button
                            icon="pi pi-send"
                            :loading="isScanning"
                            @click="procesarEscaneo"
                            :disabled="!codigoEscaneado || mostrarCantidad || ordenSeleccionada.estado === 'LISTA'"
                        />
                    </div>
                    <small class="scan-hint">Teclado: Enter o el botón. Pistola USB suele escribir aquí y enviar Enter.</small>
                </div>

                <!-- Panel de cantidad a surtir -->
                <transition name="cantidad-fade">
                    <div v-if="mostrarCantidad && itemEncontrado" class="cantidad-panel">
                        <div class="cantidad-header">
                            <i class="pi pi-box" />
                            <span class="cantidad-title">Confirmar cantidad a surtir</span>
                        </div>
                        <div class="cantidad-producto">
                            <div class="cantidad-producto-info">
                                <span class="cantidad-producto-nombre">{{ itemEncontrado.nombreProducto }}</span>
                                <span class="cantidad-producto-codigo">{{ itemEncontrado.codigoBarra }}</span>
                            </div>
                            <span class="cantidad-producto-solicitado">
                                Solicitado: <strong>{{ itemEncontrado.cantidad }}</strong>
                                <template v-if="itemEncontrado.cantidadSurtida"> · Surtido: <strong>{{ itemEncontrado.cantidadSurtida }}</strong></template>
                                · Restante: <strong>{{ cantidadMax }}</strong>
                            </span>
                        </div>
                        <div class="cantidad-input-row">
                            <label class="cantidad-input-label">Cantidad:</label>
                            <InputNumber
                                ref="cantidadInput"
                                v-model="cantidadSurtir"
                                :min="1"
                                :max="cantidadMax"
                                showButtons
                                buttonLayout="horizontal"
                                :step="1"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                class="cantidad-input-number"
                                @keyup.enter="confirmarSurtido"
                            />
                            <span class="cantidad-max-hint">máx. {{ cantidadMax }}</span>
                        </div>
                        <div class="cantidad-info-row">
                            <span class="cantidad-info-label">Inventario PDV: </span>
                            <span class="cantidad-info-value">{{ cantidadInventarioPiso }}</span>
                        </div>
                        <div class="cantidad-info-row">
                            <span class="cantidad-info-label">Inventario Almacen: </span>
                            <span class="cantidad-info-value">{{ cantidadInventarioAlmacen }}</span>
                        </div>

                        <div class="cantidad-acciones">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                severity="secondary"
                                outlined
                                size="small"
                                @click="cancelarSurtido"
                            />
                            <Button
                                label="Confirmar surtido"
                                icon="pi pi-check"
                                size="small"
                                :loading="isScanning"
                                @click="confirmarSurtido"
                                :disabled="cantidadSurtir < 1 || cantidadSurtir > cantidadMax"
                            />
                        </div>
                    </div>
                </transition>

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

                <!-- Lista de ítems (Tabla con scroll horizontal) -->
                <DataTable 
                    :value="ordenSeleccionada.items" 
                    :rows="10" 
                    :paginator="ordenSeleccionada.items?.length > 10" 
                    size="small" 
                    stripedRows 
                    responsiveLayout="scroll"
                >
                    <Column field="codigoBarra" header="Código" />
                    <Column field="barra1" header="Barra 1" />
                    <Column field="barra2" header="Barra 2" />
                    <Column field="barra3" header="Barra 3" />
                    <Column field="barra4" header="Barra 4" />
                    <Column field="barra5" header="Barra 5" />
                    <Column field="barra6" header="Barra 6" />
                    <Column field="barra7" header="Barra 7" />
                    <Column field="nombreProducto" header="Producto" />
                    <Column field="atributo" header="Atributo" />
                    <Column field="r3Piso" header="Piso" style="min-width: 5rem">
                        <template #body="{ data }">
                            {{ data.r3Piso ?? '-' }}
                        </template>
                    </Column>
                    <Column field="r3Almacen" header="Almacén" style="min-width: 5rem">
                        <template #body="{ data }">
                            {{ data.r3Almacen ?? '-' }}
                        </template>
                    </Column>
                    <Column field="departamento" header="Dpto." />
                    <Column header="Ubicación" style="min-width: 10rem">
                        <template #body="{ data }">
                            <span v-if="data.ubicaciones && data.ubicaciones.length > 0">
                                {{ data.ubicaciones.map((u) => u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion).join(', ') }}
                            </span>
                            <span v-else class="text-surface-500 dark:text-surface-400 italic">
                                Sin ubicación
                            </span>
                        </template>
                    </Column>
                    <Column field="cantidad" header="Cant." style="min-width: 5rem" />
                    <Column field="cantidadSurtida" header="Cant. Surtida" style="min-width: 5rem" />
                    <Column header="Progreso" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <ProgressBar :value="progresoItem(data)" style="height: 6px; flex: 1" :showValue="false" />
                                <span class="text-xs font-semibold">{{ progresoItem(data) }}%</span>
                            </div>
                        </template>
                    </Column>
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
                        <label>Efectividad de Surtido</label>
                        <span :class="getEfectividadColor(progresoOrden(ordenSeleccionada))">
                            {{ progresoOrden(ordenSeleccionada) }}%
                        </span>
                    </div>
                    <div class="detail-field">
                        <label>Fecha Finalización</label>
                        <span>{{ formatFecha(ordenSeleccionada.fechaFinalizacion) }}</span>
                    </div>
                    <div class="detail-field full">
                        <label>Progreso</label>
                        <div class="progress-detail">
                            <span>
                                {{ ordenSeleccionada.items?.filter(i => (i.cantidadSurtida || 0) >= (i.cantidad || 0)).length || 0 }}/{{ ordenSeleccionada.items?.length || 0 }} renglones con
                                {{ ordenSeleccionada.items?.reduce((acc, i) => acc + (i.cantidadSurtida || 0), 0) || 0 }}/{{ ordenSeleccionada.items?.reduce((acc, i) => acc + (i.cantidad || 0), 0) || 0 }} unidades completadas
                            </span>
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
                    <Column field="barra1" header="Barra 1" />
                    <Column field="barra2" header="Barra 2" />
                    <Column field="barra3" header="Barra 3" />
                    <Column field="barra4" header="Barra 4" />
                    <Column field="barra5" header="Barra 5" />
                    <Column field="barra6" header="Barra 6" />
                    <Column field="barra7" header="Barra 7" />
                    <Column field="nombreProducto" header="Producto" />
                    <Column field="atributo" header="Atributo" />
                    <Column field="r3Piso" header="Piso" style="min-width: 5rem">
                        <template #body="{ data }">
                            {{ data.r3Piso ?? '-' }}
                        </template>
                    </Column>
                    <Column field="r3Almacen" header="Almacén" style="min-width: 5rem">
                        <template #body="{ data }">
                            {{ data.r3Almacen ?? '-' }}
                        </template>
                    </Column>
                    <Column field="departamento" header="Dpto." />
                    <Column header="Ubicación" style="min-width: 10rem">
                        <template #body="{ data }">
                            <span v-if="data.ubicaciones && data.ubicaciones.length > 0">
                                {{ data.ubicaciones.map((u) => u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion).join(', ') }}
                            </span>
                            <span v-else class="text-surface-500 dark:text-surface-400 italic">
                                Sin ubicación
                            </span>
                        </template>
                    </Column>
                    <Column field="cantidad" header="Cant." style="min-width: 5rem" />
                    <Column field="cantidadSurtida" header="Cant. Surtida" style="min-width: 5rem" />
                    <Column header="Progreso" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <ProgressBar :value="progresoItem(data)" style="height: 6px; flex: 1" :showValue="false" />
                                <span class="text-xs font-semibold">{{ progresoItem(data) }}%</span>
                            </div>
                        </template>
                    </Column>
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
    flex-shrink: 0;
    line-height: 1;
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
    justify-content: center;
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

@media screen and (max-width: 768px) {
    .card-header {
        justify-content: center;
    }
    .card-header > div {
        text-align: center;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .title {
        justify-content: center;
        gap: 0.35rem; 
    }
    .subtitle {
        margin: 0.3rem 0 0 0;
    }

    .stats-banner {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        width: 100%;
        padding: 1.2rem;
        gap: 1.5rem 1rem;
    }

    .stat-item {
        width: 100%;
    }

    .stat-divider {
        display: none;
    }

    .stat-value {
        font-size: 1.4rem;
    }
    
    .stat-label {
        font-size: 0.7rem;
        text-align: center;
    }
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
    max-width: 65vw;
}

.barcodes-wrapper {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
    max-width: 130px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.barcodes-wrapper::-webkit-scrollbar {
    display: none;
}

.item-barcode {
    font-family: monospace;
    font-size: 0.82rem;
    color: var(--text-color-primary);
    background: var(--surface-100);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
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

/* Cantidad Panel */
.cantidad-panel {
    background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 6%, var(--surface-0)), var(--surface-50));
    border: 1px solid color-mix(in srgb, var(--primary-color) 25%, var(--surface-200));
    border-radius: 12px;
    padding: 1.15rem 1.35rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.cantidad-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.85rem;
    color: var(--primary-color);
    font-weight: 700;
    font-size: 0.95rem;
}

.cantidad-producto {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 1rem;
    padding: 0.65rem 0.85rem;
    background: var(--surface-0);
    border-radius: 8px;
    border: 1px solid var(--surface-200);
}

.cantidad-producto-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.cantidad-producto-nombre {
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--text-color);
}

.cantidad-producto-codigo {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    background: var(--surface-100);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
}

.cantidad-producto-solicitado {
    font-size: 0.82rem;
    color: var(--text-color-secondary);
    strong {
        color: var(--text-color);
        font-weight: 700;
    }
}

.cantidad-input-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.cantidad-input-label {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text-color);
    white-space: nowrap;
}

.cantidad-input-number {
    width: 150px;
    :deep(.p-inputtext) {
        text-align: center;
        font-weight: 700;
        font-size: 1.1rem;
    }
}

.cantidad-max-hint {
    font-size: 0.78rem;
    color: var(--text-color-secondary);
    white-space: nowrap;
}

.cantidad-info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.85rem;
    background: var(--surface-100);
    border-radius: 6px;
}

.cantidad-acciones {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

/* Transition */
.cantidad-fade-enter-active,
.cantidad-fade-leave-active {
    transition: all 0.25s ease;
}
.cantidad-fade-enter-from,
.cantidad-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
