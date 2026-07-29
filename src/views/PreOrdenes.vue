<script setup>
import { operacionesService } from '@/service/OperacionesService';
import { preOrdenesService } from '@/service/PreOrdenesService';
import { useAuthStore } from '@/stores/auth';
import { usePreOrdenStore } from '@/stores/preOrden';
import { FilterMatchMode } from '@primevue/core/api';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const store = usePreOrdenStore();
const authStore = useAuthStore();

const canWrite = computed(() => {
    const perm = authStore.permissions.find((p) => p.code === 'preorden');
    return perm ? !perm.isReadonly : false;
});

const searchQuery = ref('');
const filtroFecha = ref(new Date());
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

const detailDialog = ref(false);
const preOrdenSeleccionada = ref(null);
const loadingEdit = ref(false);

const ESTADOS = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Proceso', value: 'EN_PROCESO' },
    { label: 'Lista', value: 'LISTA' }
];
const filtroEstado = ref(null);

const preOrdenesFiltradas = computed(() => {
    return store.preOrdenes;
});

// Paginado server-side
const lazyParams = ref({
    page: 0,
    size: 10
});

function onPage(event) {
    lazyParams.value.page = event.page;
    lazyParams.value.size = event.rows;
    cargarDatos();
}

function resetMobilePage() {
    lazyParams.value.page = 0;
    cargarDatos();
}

// REDU-2: busqueda dinamica con debounce.
// Antes: cada keystroke pegaba al backend (fetch en @input directo).
// Ahora: 350ms despues del ultimo keystroke se dispara el fetch.
let searchDebounceTimer = null;
function onSearchInput() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        resetMobilePage();
        searchDebounceTimer = null;
    }, 350);
}

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

// REDU-1: visual para origen
const origenConfig = {
    PICKING: { label: 'Picking', class: 'origen-picking', icon: 'pi pi-hand-pointer' },
    AUTOMATICO: { label: 'Automatico', class: 'origen-automatico', icon: 'pi pi-replay' }
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

        if (preOrdenSeleccionada.value?.items) {
            const promises = preOrdenSeleccionada.value.items
                .filter((it) => it.codigoBarra)
                .map(async (it) => {
                    try {
                        const inv = await operacionesService.obtenerInventarioUbicacion(it.codigoBarra);
                        if (inv) {
                            it.r3Piso = inv.piso ?? 0;
                            it.r3Almacen = inv.almacen ?? 0;
                            it.cedis = inv.cedis ?? 0;
                        }
                    } catch {
                        it.r3Piso = '-';
                        it.r3Almacen = '-';
                        it.cedis = '-';
                    }
                });
            await Promise.all(promises);
        }

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
    items: [],
    origen: 'PICKING' // REDU-1: default picking; puede cambiarse a AUTOMATICO en el dialog
});
const ORIGENES = [
    { label: 'Picking (manual)', value: 'PICKING' },
    { label: 'Automatico (sync)', value: 'AUTOMATICO' }
];
const departamentosList = ref([]);
const productosList = ref([]);
const nuevoProducto = ref({ producto: null, cantidad: 1, atributo: '' });

// ── Barcode scan (texto / pistola) ───────────────────────────────────────────
const codigoScan = ref('');
const scanInputRef = ref(null);
const scanLoading = ref(false);

// ── Barcode scan (cámara) ─────────────────────────────────────────────────────
const cameraActiva = ref(false);
const cameraLoading = ref(false);
const cameraError = ref(null);
let html5Scanner = null;
let decodeLock = false;

const CAMARA_PREORDEN_ID = 'camara-preorden-host';

const FORMATOS_BARRAS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE
];

// Ordenación de productos por ubicación
function obtenerTextoUbicacion(item) {
    if (!item.ubicaciones || item.ubicaciones.length === 0) {
        return 'zzzzzzzzzz'; // Los que no tienen ubicación se muestran al final
    }
    return item.ubicaciones
        .map((u) => (u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion))
        .join(', ')
        .toLowerCase();
}

function ordenarItemsPorUbicacion(items) {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
        const ubiA = obtenerTextoUbicacion(a);
        const ubiB = obtenerTextoUbicacion(b);
        return ubiA.localeCompare(ubiB, 'es', { sensitivity: 'base', numeric: true });
    });
}

watch(preOrdenSeleccionada, (nueva) => {
    if (nueva && nueva.items) {
        const copia = ordenarItemsPorUbicacion(nueva.items);
        const yaOrdenado = nueva.items.every((item, idx) => item.idProducto === copia[idx].idProducto && item.atributo === copia[idx].atributo && item.cantidad === copia[idx].cantidad);
        if (!yaOrdenado) {
            nueva.items = copia;
        }
    }
});

// REDU-3: flag para evitar que el watcher reordene inmediatamente
// despues de un .unshift() en agregarProducto(). Asi el orden de
// insercion (ultimo al inicio) se mantiene mientras el usuario
// sigue agregando productos. La reordenacion por ubicacion SOLO se
// aplica al cargar items desde el backend (abrirEditar), nunca
// durante la edicion del dialog.
let skipNextSortFlag = false;

watch(
    () => newPreOrden.value.items,
    (nuevosItems) => {
        if (skipNextSortFlag || !nuevosItems || nuevosItems.length === 0) return;
        // Reordenar por ubicacion SOLO cuando:
        //  - vienen del backend (marcados con _fromBackend=true al cargar), o
        //  - hay 2+ items y el orden actual difiere del orden por ubicacion
        //    (heuristica: si el primero no tiene ubicacion o su ubicacion
        //    lexicograficamente mayor que la del ultimo, probablemente el
        //    usuario agrego recien y quiere el orden de insercion)
        const todosDelBackend = nuevosItems.every((it) => it._fromBackend);
        if (!todosDelBackend) {
            // el usuario esta editando/agregando: respetar el orden actual
            return;
        }
        const copia = ordenarItemsPorUbicacion(nuevosItems);
        const yaOrdenado = nuevosItems.every((item, idx) => item.idProducto === copia[idx].idProducto && item.atributo === copia[idx].atributo && item.cantidad === copia[idx].cantidad);
        if (!yaOrdenado) {
            newPreOrden.value.items = copia;
        }
    },
    { deep: true }
);

function mensajeFalloCamara(err) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        return 'La cámara no funciona con HTTP desde la IP de tu red. Usa HTTPS (npm run dev con --https o ngrok).';
    }
    const name = err?.name || '';
    const msg = String(err?.message || err || '');
    if (name === 'NotAllowedError' || /denied|Permission|permi/i.test(msg)) return 'Permiso de cámara denegado. Permite el acceso en el navegador.';
    if (name === 'NotFoundError') return 'No se encontró ninguna cámara.';
    if (name === 'NotReadableError' || name === 'TrackStartError') return 'La cámara está en uso por otra app.';
    if (name === 'OverconstrainedError') return 'La cámara no admite el modo solicitado.';
    if (name === 'SecurityError') return 'El navegador bloqueó la cámara por seguridad. Usa HTTPS.';
    if (name === 'AbortError') return 'Acceso a la cámara cancelado.';
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
    if (!newPreOrden.value.departamento) return;
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

        const configFull = { fps: 10, qrbox, formatsToSupport: [...FORMATOS_BARRAS] };
        const configLite = { fps: 10, qrbox };

        const onDecode = async (texto) => {
            const codigo = texto?.trim();
            if (!codigo || decodeLock || scanLoading.value) return;
            decodeLock = true;
            try {
                await detenerCamara();
                codigoScan.value = codigo;
                await buscarProductoPorCodigo();
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
                html5Scanner = new Html5Qrcode(CAMARA_PREORDEN_ID);
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

async function openCreateDialog() {
    newPreOrden.value = {
        departamento: null,
        usuarioSurtidor: authStore.user?.email || '',
        items: [],
        origen: 'PICKING'
    };
    nuevoProducto.value = { producto: null, cantidad: 1 };
    productosList.value = [];

    if (departamentosList.value.length === 0 || !departamentosList.value.some((d) => d.descripcion === '00 TODOS')) {
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
            const code = typeof newDept === 'object' ? (newDept.codigo !== undefined ? newDept.codigo : newDept.id || newDept.descripcion || '') : newDept;
            const data = await preOrdenesService.obtenerProductosPorDepartamento(code);
            let pList = Array.isArray(data) ? data : data.data || [];
            productosList.value = pList.map((p) => {
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

watch(
    () => newPreOrden.value.departamento,
    async (newDept) => {
        // Solo limpiamos los items si NO estamos editando y NO estamos saltando la limpieza
        if (!skipItemsClear && !isEditing.value) {
            newPreOrden.value.items = [];
        }
        await cargarProductos(newDept);
    }
);

async function agregarProducto() {
    const p = nuevoProducto.value.producto;
    if (!p || nuevoProducto.value.cantidad <= 0) return;

    const codBarra = p.codigoBarra || p.barra1 || '';

    const existing = newPreOrden.value.items.find((i) => (codBarra && i.codigoBarra === codBarra) || (p.id !== undefined && i.id === p.id) || (p.idProducto !== undefined && i.idProducto === (p.id || codBarra)));

    let r3Piso = 0;
    let r3Almacen = 0;
    let cedis = 0;
    try {
        const inv = await operacionesService.obtenerInventarioUbicacion(codBarra);
        if (inv) {
            r3Piso = inv.piso ?? 0;
            r3Almacen = inv.almacen ?? 0;
            cedis = inv.cedis ?? 0;
        }
    } catch {
        // fallo consulta inventario
    }

    if (existing) {
        existing.cantidad += nuevoProducto.value.cantidad;
        existing.r3Piso = r3Piso;
        existing.r3Almacen = r3Almacen;
        existing.cedis = cedis;
    } else {
        // REDU-3: nuevo producto va al inicio (ultimo agregado primero).
        // Antes: .push() lo dejaba al final y el watcher de reorden lo
        // movia por ubicacion, sobreescribiendo el orden de insercion.
        // Ahora: .unshift() y un flag evita que el watcher reordene
        // inmediatamente (ver skipNextSortFlag).
        const nuevo = {
            idProducto: p.id || codBarra,
            codigoBarra: codBarra,
            nombreProducto: p.nombreProducto,
            cantidad: nuevoProducto.value.cantidad,
            cantidadSurtida: 0,
            departamento: p.c_Departamento || newPreOrden.value.departamento?.descripcion || newPreOrden.value.departamento?.codigo || newPreOrden.value.departamento,
            barra1: p.barra1,
            barra2: p.barra2,
            barra3: p.barra3,
            barra4: p.barra4,
            barra5: p.barra5,
            barra6: p.barra6,
            barra7: p.barra7,
            atributo: nuevoProducto.value.atributo,
            r3Piso,
            r3Almacen,
            cedis,
            ubicaciones: p.ubicaciones || []
        };
        skipNextSortFlag = true;
        newPreOrden.value.items.unshift(nuevo);
        setTimeout(() => {
            skipNextSortFlag = false;
        }, 0);
    }
    nuevoProducto.value = { producto: null, cantidad: 1, atributo: '' };
}

function removerProducto(index) {
    const item = newPreOrden.value.items[index];
    confirm.require({
        message: `¿Estás seguro de que deseas quitar "${item.nombreProducto}" de la lista?`,
        header: 'Quitar Producto',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Quitar',
        rejectLabel: 'Cancelar',
        accept: () => {
            newPreOrden.value.items.splice(index, 1);
            toast.add({ severity: 'info', summary: 'Quitado', detail: 'Producto quitado de la lista', life: 2000 });
        }
    });
}

/** Busca el código escaneado en cualquiera de los 7 campos de barra */
async function buscarProductoPorCodigo() {
    const codigo = codigoScan.value?.trim();
    if (!codigo) return;

    scanLoading.value = true;
    try {
        // Asegurarse de que haya productos cargados
        if (productosList.value.length === 0 && newPreOrden.value.departamento) {
            await cargarProductos(newPreOrden.value.departamento);
        }

        const normalizar = (v) => (v ?? '').toString().trim();

        const encontrado = productosList.value.find(
            (p) =>
                normalizar(p.barra1) === codigo ||
                normalizar(p.barra2) === codigo ||
                normalizar(p.barra3) === codigo ||
                normalizar(p.barra4) === codigo ||
                normalizar(p.barra5) === codigo ||
                normalizar(p.barra6) === codigo ||
                normalizar(p.barra7) === codigo ||
                normalizar(p.codigoBarra) === codigo
        );

        if (!encontrado) {
            toast.add({ severity: 'warn', summary: 'No encontrado', detail: `Código "${codigo}" no coincide con ningún producto del departamento seleccionado`, life: 4000 });
            codigoScan.value = '';
            return;
        }

        // Pre-seleccionar en el Select y agregar directamente con la cantidad actual
        nuevoProducto.value.producto = encontrado;
        codigoScan.value = '';

        agregarProducto();

        toast.add({ severity: 'success', summary: 'Producto agregado', detail: encontrado.nombreProducto, life: 2000 });

        await nextTick();
        scanInputRef.value?.focus();
    } finally {
        scanLoading.value = false;
    }
}

// Detener cámara al cerrar el dialog
watch(createDialog, async (abierto) => {
    if (!abierto) {
        await detenerCamara();
        codigoScan.value = '';
    }
});

onUnmounted(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    detenerCamara();
});

async function abrirEditar(orden) {
    console.log('🔥 [abrirEditar] NUEVA version con loading + inventario');
    skipItemsClear = true;
    loadingEdit.value = true;
    createDialog.value = true;
    try {
        console.log('[abrirEditar] loadingEdit=', loadingEdit.value, 'createDialog=', createDialog.value);
        const [detalle] = await Promise.all([
            store.cargarOrdenDetalle(orden.id),
            departamentosList.value.length === 0 || !departamentosList.value.some((d) => d.descripcion === '00 TODOS')
                ? preOrdenesService.obtenerDepartamentos().then((data) => {
                      let depts = Array.isArray(data) ? data : data.data || [];
                      departamentosList.value = [{ codigo: '', descripcion: '00 TODOS' }, ...depts];
                  })
                : Promise.resolve()
        ]);

        const det = store.preOrdenActiva;
        console.log('[abrirEditar] det.items:', det.items?.length, JSON.parse(JSON.stringify(det.items?.map((i) => ({ codigoBarra: i.codigoBarra, r3Piso: i.r3Piso, r3Almacen: i.r3Almacen })))));
        newPreOrden.value = {
            id: det.id,
            departamento: det.departamento,
            usuarioSurtidor: det.usuarioSurtidor,
            items: det.items ? det.items.map((i) => ({ ...i, _fromBackend: true })) : [],
            origen: det.origen || 'PICKING'
        };
        nuevoProducto.value = { producto: null, cantidad: 1 };
        productosList.value = [];

        const deptObj = departamentosList.value.find((d) => d.descripcion === det.departamento);
        if (deptObj) {
            newPreOrden.value.departamento = deptObj;
            await cargarProductos(deptObj);
        }

        const itemsConCodigo = (newPreOrden.value.items || []).filter((it) => it.codigoBarra);
        console.log(`[abrirEditar] items con codigoBarra: ${itemsConCodigo.length}/${newPreOrden.value.items?.length}`);
        const promises = itemsConCodigo.map(async (it) => {
            try {
                console.log('[abrirEditar] consultando inventario para:', it.codigoBarra);
                const inv = await operacionesService.obtenerInventarioUbicacion(it.codigoBarra);
                console.log('[abrirEditar] inventario respuesta:', it.codigoBarra, inv);
                if (inv) {
                    it.r3Piso = inv.piso ?? 0;
                    it.r3Almacen = inv.almacen ?? 0;
                    it.cedis = inv.cedis ?? 0;
                    console.log(`[abrirEditar] item actualizado: ${it.codigoBarra} → piso=${it.r3Piso} almacen=${it.r3Almacen} cedis=${it.cedis}`);
                }
            } catch (e) {
                console.log('[abrirEditar] error inventario para', it.codigoBarra, e);
                it.r3Piso = '-';
                it.r3Almacen = '-';
                it.cedis = '-';
            }
        });
        await Promise.all(promises);
        console.log('[abrirEditar] inventario cargado para todos los items');

        setTimeout(() => {
            skipItemsClear = false;
        }, 200);
    } catch (err) {
        console.log('[abrirEditar] ERROR:', err);
        skipItemsClear = false;
        createDialog.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la Preorden para edición', life: 3000 });
    } finally {
        console.log('[abrirEditar] finally → loadingEdit=false');
        loadingEdit.value = false;
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
    const totalUnidades = data.totalUnidades || 0;
    doc.text('Resumen de Totales', 14, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        body: [
            ['Total Productos:', data.totalItems || 0, 'Productos Surtidos:', data.itemsSurtidos || 0],
            ['Total Unidades:', totalUnidades, 'Unidades Surtidas:', data.unidadesSurtidas || 0],
            ['Efectividad:', `${progresoOrden(data)}%`, 'Pendiente:', totalUnidades - (data.unidadesSurtidas || 0)]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 }
    });

    // Tabla de Productos
    doc.text('Lista de Productos', 14, doc.lastAutoTable.finalY + 10);

    const tableData = data.items.map((item) => [item.codigoBarra, item.nombreProducto, item.atributo || '—', item.departamento || '—', item.cantidad, item.estadoItem]);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Código', 'Producto', 'Atributo', 'Dpto.', 'Cant.', 'Estado']],
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
                        <!-- <i class="pi pi-box ops-icon" /> -->
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

            <Toolbar class="mb-5 toolbar-responsive">
                <template #start>
                    <!-- Desktop: botones de acción -->
                    <div class="hidden md:flex gap-2">
                        <Button label="Nueva PreOrden" icon="pi pi-plus" severity="primary" @click="openCreateDialog" :disabled="!canWrite" />
                        <Button icon="pi pi-refresh" severity="secondary" outlined v-tooltip.top="'Actualizar'" :loading="store.isLoading" @click="cargarDatos" />
                        <Button
                            icon="pi pi-filter-slash"
                            severity="secondary"
                            outlined
                            v-tooltip.top="'Limpiar filtros'"
                            @click="
                                () => {
                                    clearFilters();
                                    resetMobilePage();
                                }
                            "
                        />
                    </div>
                    <!-- Mobile: botón Nueva PreOrden -->
                    <div class="block md:hidden w-full">
                        <Button label="Nueva PreOrden" icon="pi pi-plus" severity="primary" class="w-full" @click="openCreateDialog" :disabled="!canWrite" />
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-end">
                        <!-- <Select
                            v-model="filtroEstado"
                            :options="ESTADOS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los estados"
                            class="filter-select w-full md:w-auto"
                            @change="resetMobilePage"
                        /> -->
                        <Calendar v-model="filtroFecha" dateFormat="yy-mm-dd" placeholder="Fecha de consulta" :showIcon="true" class="w-full md:w-auto" style="min-width: 160px" />
                        <IconField class="w-full md:w-auto">
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="searchQuery" placeholder="Buscar N° Documento o departamento..." class="w-full" style="min-width: 0" @input="onSearchInput" />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- Tabla (Desktop) -->
            <DataTable
                class="hidden md:block"
                :value="preOrdenesFiltradas"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                lazy
                :totalRecords="store.totalPreOrdenes"
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
                        <p>No hay preordenes</p>
                    </div>
                </template>
                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando preordenes...</p>
                    </div>
                </template>

                <!-- <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column> -->

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
                            <Avatar :label="data.departamento?.charAt(0).toUpperCase()" shape="circle" class="dept-avatar" />
                            <span>{{ data.departamento }}</span>
                        </div>
                        <span v-else class="text-secondary">—</span>
                    </template>
                </Column>

                <Column header="Productos" style="min-width: 11rem">
                    <template #body="{ data }">
                        <div class="progress-cell">
                            <span class="progress-text">{{ data.itemsSurtidos ?? 0 }} / {{ data.totalItems ?? 0 }}</span>
                            <ProgressBar :value="progresoOrden(data)" style="height: 6px; width: 90px" :showValue="false" />
                        </div>
                    </template>
                </Column>

                <!-- REDU-1: badge de origen (Picking vs Automatico) -->
                <Column header="Origen" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span :class="['origen-badge', origenConfig[data.origen]?.class]">
                            <i :class="origenConfig[data.origen]?.icon" />
                            {{ origenConfig[data.origen]?.label || '—' }}
                        </span>
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
                            <Button icon="pi pi-eye" outlined rounded severity="secondary" v-tooltip.top="'Ver detalle'" @click="verDetalle(data)" />
                            <Button v-if="data.estado !== 'LISTA' && data.estado !== 'EN_PROCESO'" icon="pi pi-pencil" outlined rounded severity="info" v-tooltip.top="'Editar'" @click="abrirEditar(data)" :disabled="!canWrite" />
                            <Button v-if="data.estado === 'PENDIENTE'" icon="pi pi-check" outlined rounded severity="success" v-tooltip.top="'Aprobar (Convertir a Orden)'" @click="confirmarAprobar(data)" :disabled="!canWrite" />
                            <Button v-if="data.estado === 'PENDIENTE'" icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmarEliminar(data)" :disabled="!canWrite" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <!-- Botones secundarios mobile -->
                <div class="mobile-actions">
                    <Button icon="pi pi-refresh" severity="secondary" outlined size="small" :loading="store.isLoading" @click="cargarDatos" label="Actualizar" />
                    <Button
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        outlined
                        size="small"
                        @click="
                            () => {
                                clearFilters();
                                resetMobilePage();
                            }
                        "
                        label="Limpiar"
                    />
                </div>

                <div v-if="store.isLoading && preOrdenesFiltradas.length === 0" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                    <p>Cargando preordenes...</p>
                </div>
                <div v-else-if="!store.isLoading && preOrdenesFiltradas.length === 0" class="empty-state">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p>No hay preordenes</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)" />
                    </div>

                    <div v-for="data in preOrdenesFiltradas" :key="data.id" :class="['preorden-card', data.origen === 'PICKING' && 'preorden-card-picking']">
                        <!-- Header -->
                        <div class="preorden-card-header">
                            <div class="preorden-card-header-left">
                                <span class="font-semibold text-primary" style="font-size: 0.95rem">{{ data.numeroOrden }}</span>
                                <span class="id-badge">#{{ data.id }}</span>
                                <span v-if="origenConfig[data.origen]" :class="['origen-badge', 'origen-badge-sm', origenConfig[data.origen].class]">
                                    <i :class="origenConfig[data.origen].icon" />
                                    {{ origenConfig[data.origen].label }}
                                </span>
                            </div>
                            <span :class="['estado-badge', estadoConfig[data.estado]?.class]">
                                <i :class="estadoConfig[data.estado]?.icon" />
                                {{ estadoConfig[data.estado]?.label }}
                            </span>
                        </div>

                        <!-- Body -->
                        <div class="preorden-card-body">
                            <div class="preorden-card-row">
                                <span class="preorden-label">Departamento</span>
                                <div class="dept-info" v-if="data.departamento">
                                    <Avatar :label="data.departamento?.charAt(0).toUpperCase()" shape="circle" class="dept-avatar" style="width: 1.6rem !important; height: 1.6rem !important; font-size: 0.72rem !important" />
                                    <span style="font-size: 0.9rem">{{ data.departamento }}</span>
                                </div>
                                <span v-else class="text-secondary">—</span>
                            </div>
                            <div class="preorden-card-row">
                                <span class="preorden-label">Surtidor</span>
                                <span class="preorden-value">{{ data.usuarioSurtidor || '—' }}</span>
                            </div>
                            <div class="preorden-card-row">
                                <span class="preorden-label">Creado</span>
                                <span class="preorden-value">{{ formatFecha(data.fechaCreacion) }}</span>
                            </div>
                            <!-- Progreso -->
                            <div class="preorden-progress">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem">
                                    <span class="preorden-label">Progreso</span>
                                    <span class="progress-text">{{ data.itemsSurtidos ?? 0 }} / {{ data.totalItems ?? 0 }} productos</span>
                                </div>
                                <ProgressBar :value="progresoOrden(data)" style="height: 6px" :showValue="false" />
                            </div>
                        </div>

                        <!-- Footer acciones -->
                        <div class="preorden-card-footer">
                            <Button icon="pi pi-eye" outlined rounded severity="secondary" size="small" v-tooltip.top="'Ver detalle'" @click="verDetalle(data)" />
                            <Button v-if="data.estado !== 'LISTA' && data.estado !== 'EN_PROCESO'" icon="pi pi-pencil" outlined rounded severity="info" size="small" v-tooltip.top="'Editar'" @click="abrirEditar(data)" :disabled="!canWrite" />
                            <Button v-if="data.estado === 'PENDIENTE'" icon="pi pi-check" outlined rounded severity="success" size="small" v-tooltip.top="'Aprobar'" @click="confirmarAprobar(data)" :disabled="!canWrite" />
                            <Button v-if="data.estado === 'PENDIENTE'" icon="pi pi-trash" outlined rounded severity="danger" size="small" v-tooltip.top="'Eliminar'" @click="confirmarEliminar(data)" :disabled="!canWrite" />
                        </div>
                    </div>

                    <!-- Paginador móvil -->
                    <Paginator
                        v-if="store.totalPreOrdenes > 0"
                        :first="lazyParams.page * lazyParams.size"
                        :rows="lazyParams.size"
                        :totalRecords="store.totalPreOrdenes"
                        @page="onPage"
                        template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        currentPageReportTemplate="{first}-{last} de {totalRecords}"
                        class="mt-4 border-t border-surface-200 dark:border-surface-700 bg-transparent"
                    />
                </div>
            </div>
        </div>

        <!-- Dialog: Detalle de producto -->
        <Dialog v-model:visible="detailDialog" :style="{ width: '620px' }" :breakpoints="{ '1199px': '85vw', '575px': '98vw' }" header="Detalle de PreOrden" :modal="true">
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

                <DataTable class="hidden md:block" :value="preOrdenSeleccionada.items" :rows="10" :paginator="preOrdenSeleccionada.items?.length > 10" size="small" stripedRows>
                    <Column field="codigoBarra" header="Código" />
                    <Column field="nombreProducto" header="Producto" />
                    <Column field="atributo" header="Atributo" />
                    <Column field="departamento" header="Dpto." />
                    <Column header="Ubicación" style="min-width: 10rem">
                        <template #body="{ data }">
                            <span v-if="data.ubicaciones && data.ubicaciones.length > 0">
                                {{ data.ubicaciones.map((u) => (u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion)).join(', ') }}
                            </span>
                            <span v-else class="text-surface-500 dark:text-surface-400 italic"> Sin ubicación </span>
                        </template>
                    </Column>
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
                    <Column field="cedis" header="Cedis" style="min-width: 5rem">
                        <template #body="{ data }">
                            {{ data.cedis ?? '-' }}
                        </template>
                    </Column>
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

                <!-- Mobile cards display instead of table -->
                <div class="block md:hidden mt-4">
                    <div v-if="!preOrdenSeleccionada.items || preOrdenSeleccionada.items.length === 0" class="text-center p-3 text-secondary text-sm">No hay productos en esta PreOrden</div>
                    <div v-else class="flex flex-col gap-3" style="max-height: 400px; overflow-y: auto">
                        <div v-for="(item, index) in preOrdenSeleccionada.items" :key="index" class="product-mobile-card flex flex-col gap-2">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-bold text-base" style="word-break: break-word; color: var(--text-color)">{{ item.nombreProducto }}</div>
                                    <div class="text-sm text-secondary mt-1">Cód: {{ item.codigoBarra }}</div>
                                </div>
                                <span :class="['item-estado text-sm', itemEstadoConfig[item.estadoItem]?.class]">
                                    <i :class="itemEstadoConfig[item.estadoItem]?.icon" />
                                    {{ itemEstadoConfig[item.estadoItem]?.label }}
                                </span>
                            </div>

                            <div class="grid p-fluid gap-2 mt-1">
                                <div class="col-6 mb-0">
                                    <span class="text-sm font-semibold text-secondary">Atributo:</span>
                                    <div class="text-base font-semibold" style="color: var(--text-color)">{{ item.atributo || '—' }}</div>
                                </div>
                                <div class="col-6 mb-0">
                                    <span class="text-sm font-semibold text-secondary">Cantidad:</span>
                                    <div class="text-base font-semibold" style="color: var(--text-color)">{{ item.cantidad }}</div>
                                </div>
                            </div>

                            <div class="text-sm text-secondary mt-1 flex flex-col gap-1 border-t border-surface-200 dark:border-surface-700 pt-2">
                                <div>
                                    <span class="font-semibold">Dpto:</span>
                                    <span class="ml-1">{{ item.departamento || '—' }}</span>
                                </div>
                                <div>
                                    <span class="font-semibold">Ubicación:</span>
                                    <span v-if="item.ubicaciones && item.ubicaciones.length > 0" class="ml-1">
                                        {{ item.ubicaciones.map((u) => (u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion)).join(', ') }}
                                    </span>
                                    <span v-else class="ml-1 italic">Sin ubicación</span>
                                </div>
                                <div class="flex gap-4">
                                    <span><strong>Piso:</strong> {{ item.r3Piso ?? '-' }}</span>
                                    <span><strong>Almacén:</strong> {{ item.r3Almacen ?? '-' }}</span>
                                    <span><strong>Cedis:</strong> {{ item.cedis ?? '-' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Imprimir PDF" icon="pi pi-file-pdf" @click="exportarPDF" />
                <!-- <Button label="Cerrar" icon="pi pi-times" text @click="detailDialog = false" /> -->
            </template>
        </Dialog>

        <!-- Dialog: Crear / Editar PreOrden -->
        <Dialog v-model:visible="createDialog" :style="{ width: '800px' }" :breakpoints="{ '1199px': '85vw', '575px': '96vw' }" :header="isEditing ? 'Editar PreOrden' : 'Crear Nueva PreOrden'" :modal="true">
            <div v-if="loadingEdit" class="loading-overlay">
                <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--primary-color)" />
                <p style="margin-top: 1rem; color: var(--text-color-secondary)">Cargando datos de la PreOrden...</p>
            </div>
            <div v-else class="p-fluid grid">
                <div class="col-12 md:col-6 mb-3">
                    <label>Departamento</label>
                    <Select v-model="newPreOrden.departamento" :options="departamentosList" optionLabel="descripcion" dataKey="descripcion" placeholder="Seleccione departamento" class="w-full mt-2" :filter="true" appendTo="body" />
                </div>
                <div class="col-12 md:col-6 mb-3">
                    <label>Surtidor</label>
                    <InputText v-model="newPreOrden.usuarioSurtidor" placeholder="Nombre o ID del surtidor" class="w-full mt-2" disabled />
                </div>
                <div class="col-12 md:col-6 mb-3">
                    <label>Origen</label>
                    <Select v-model="newPreOrden.origen" :options="ORIGENES" optionLabel="label" optionValue="value" placeholder="Seleccione origen" class="w-full mt-2" appendTo="body" />
                    <small class="text-secondary">Define si la pre-orden es de picking (manual) o automática (generada por sync).</small>
                </div>

                <div class="col-12 mt-2">
                    <Divider align="left">
                        <b>Productos</b>
                    </Divider>

                    <!-- Scan de código de barras -->
                    <div class="scan-row mb-3">
                        <label class="scan-label">
                            <i class="pi pi-barcode" style="margin-right: 0.4rem"></i>
                            Escanear código de barras
                        </label>
                        <div class="scan-input-group">
                            <IconField class="flex-grow-1">
                                <InputIcon><i class="pi pi-qrcode" /></InputIcon>
                                <InputText ref="scanInputRef" v-model="codigoScan" placeholder="Escanea o escribe el código..." class="w-full" :disabled="!newPreOrden.departamento || scanLoading" @keydown.enter.prevent="buscarProductoPorCodigo" />
                            </IconField>
                            <Button icon="pi pi-search" :loading="scanLoading" :disabled="!codigoScan || !newPreOrden.departamento" @click="buscarProductoPorCodigo" v-tooltip.top="'Buscar por código'" />
                            <!-- Botón cámara -->
                            <Button v-if="!cameraActiva" icon="pi pi-camera" :loading="cameraLoading" :disabled="!newPreOrden.departamento" @click="iniciarCamara" v-tooltip.top="'Escanear con cámara'" severity="secondary" outlined />
                            <Button v-else icon="pi pi-stop" severity="danger" outlined @click="detenerCamara" v-tooltip.top="'Detener cámara'" />
                        </div>
                        <small class="scan-hint" v-if="!newPreOrden.departamento">Seleccione un departamento primero</small>
                        <small class="scan-hint" v-else>Presione <kbd>Enter</kbd>, haga clic en buscar o use la <kbd>📷</kbd> cámara</small>

                        <!-- Host del escáner de cámara -->
                        <div v-show="cameraActiva || cameraLoading" :id="CAMARA_PREORDEN_ID" class="camara-host mt-2" />
                        <p v-if="cameraError" class="camara-error"><i class="pi pi-exclamation-circle" /> {{ cameraError }}</p>
                    </div>

                    <!-- Selector manual -->
                    <div class="grid mb-3 align-items-end">
                        <div class="col-12 md:col-4">
                            <label>Producto <small class="text-secondary">(selección manual)</small></label>
                            <Select
                                v-model="nuevoProducto.producto"
                                :options="productosList"
                                optionLabel="label"
                                placeholder="Seleccione un producto"
                                class="w-full mt-2 product-select"
                                :filter="true"
                                :virtualScrollerOptions="{ itemSize: 48 }"
                                :disabled="!newPreOrden.departamento"
                                appendTo="body"
                            >
                                <template #option="slotProps">
                                    <div class="product-item-content">
                                        {{ slotProps.option.label }}
                                    </div>
                                </template>
                            </Select>
                        </div>
                        <div class="col-12 md:col-4 mt-2">
                            <label>Atributo</label>
                            <InputText v-model="nuevoProducto.atributo" placeholder="Color, talla, etc." class="w-full mt-2" :disabled="!newPreOrden.departamento" />
                        </div>
                        <div class="col-12 md:col-4 mt-2">
                            <label>Cantidad</label>
                            <div class="flex gap-2 mt-2">
                                <InputNumber v-model="nuevoProducto.cantidad" :min="1" showButtons class="flex-auto" inputClass="w-full" />
                                <Button icon="pi pi-plus" label="Agregar" @click="agregarProducto" :disabled="!nuevoProducto.producto || !newPreOrden.departamento" class="white-space-nowrap" />
                            </div>
                        </div>
                    </div>

                    <DataTable class="hidden md:block mt-4" :value="newPreOrden.items" :rows="5" :paginator="newPreOrden.items.length > 5" size="small" stripedRows scrollable scrollHeight="400px">
                        <template #empty>
                            <div class="text-center p-3 text-secondary">No se han agregado productos</div>
                        </template>
                        <Column field="codigoBarra" header="Código" class="hidden sm:table-cell" headerClass="hidden sm:table-cell" />
                        <Column field="nombreProducto" header="Producto">
                            <template #body="{ data }">
                                <div style="white-space: normal; word-break: break-word">
                                    <div class="font-bold sm:font-normal">{{ data.nombreProducto }}</div>
                                    <div class="text-xs text-secondary sm:hidden">{{ data.codigoBarra }}</div>
                                </div>
                            </template>
                        </Column>
                        <Column field="atributo" header="Atributo" style="min-width: 120px">
                            <template #body="{ data }">
                                <InputText v-model="data.atributo" placeholder="Atributo..." class="w-full" />
                            </template>
                        </Column>
                        <Column header="Ubicación" style="min-width: 10rem">
                            <template #body="{ data }">
                                <span v-if="data.ubicaciones && data.ubicaciones.length > 0">
                                    {{ data.ubicaciones.map((u) => (u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion)).join(', ') }}
                                </span>
                                <span v-else class="text-surface-500 dark:text-surface-400 italic"> Sin ubicación </span>
                            </template>
                        </Column>
                        <Column field="r3Piso" header="Piso" style="width: 80px; text-align: center">
                            <template #body="{ data }">
                                {{ data.r3Piso ?? '-' }}
                            </template>
                        </Column>
                        <Column field="r3Almacen" header="Almacén" style="width: 80px; text-align: center">
                            <template #body="{ data }">
                                {{ data.r3Almacen ?? '-' }}
                            </template>
                        </Column>
                        <Column field="cedis" header="Cedis" style="width: 80px; text-align: center">
                            <template #body="{ data }">
                                {{ data.cedis ?? '-' }}
                            </template>
                        </Column>
                        <Column field="cantidad" header="Cant." style="width: 140px; text-align: center">
                            <template #body="{ data }">
                                <InputNumber v-model="data.cantidad" :min="1" showButtons class="w-full" inputClass="text-center" />
                            </template>
                        </Column>
                        <Column :exportable="false" header="" style="width: 60px">
                            <template #body="{ index }">
                                <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Eliminar" @click="removerProducto(index)" />
                            </template>
                        </Column>
                    </DataTable>

                    <!-- Mobile cards display instead of table -->
                    <div class="block md:hidden mt-4">
                        <div v-if="newPreOrden.items.length === 0" class="text-center p-3 text-secondary text-sm">No se han agregado productos</div>
                        <div v-else class="flex flex-col gap-3" style="max-height: 400px; overflow-y: auto">
                            <div v-for="(item, index) in newPreOrden.items" :key="index" class="product-mobile-card flex flex-col gap-3">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="font-bold text-base" style="word-break: break-word; color: var(--text-color)">{{ item.nombreProducto }}</div>
                                        <div class="text-sm text-secondary mt-1">Cód: {{ item.codigoBarra }}</div>
                                    </div>
                                    <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Eliminar" @click="removerProducto(index)" />
                                </div>

                                <div class="grid p-fluid gap-2 mt-1">
                                    <div class="col-6 mb-0">
                                        <label class="text-sm font-semibold">Atributo</label>
                                        <InputText v-model="item.atributo" placeholder="Color, talla..." class="w-full mt-1 p-inputtext-sm" />
                                    </div>
                                    <div class="col-6 mb-0">
                                        <label class="text-sm font-semibold">Cantidad</label>
                                        <InputNumber v-model="item.cantidad" :min="1" showButtons class="w-full mt-1 p-inputnumber-sm" inputClass="text-center" />
                                    </div>
                                </div>

                                <div class="text-sm text-secondary mt-1 flex flex-col gap-1 border-t border-surface-200 dark:border-surface-700 pt-2">
                                    <div>
                                        <span class="font-semibold">Ubicación:</span>
                                        <span v-if="item.ubicaciones && item.ubicaciones.length > 0" class="ml-1">
                                            {{ item.ubicaciones.map((u) => (u.localidad ? `${u.ubicacion} (${u.localidad})` : u.ubicacion)).join(', ') }}
                                        </span>
                                        <span v-else class="ml-1 italic">Sin ubicación</span>
                                    </div>
                                    <div class="flex gap-4">
                                        <span><strong>Piso:</strong> {{ item.r3Piso ?? '-' }}</span>
                                        <span><strong>Almacén:</strong> {{ item.r3Almacen ?? '-' }}</span>
                                        <span><strong>Cedis:</strong> {{ item.cedis ?? '-' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <!-- <Button label="Cancelar" icon="pi pi-times" text @click="createDialog = false" :disabled="creando" /> -->
                <Button label="Guardar" icon="pi pi-save" @click="guardarPreOrden" :loading="creando" :disabled="!canWrite" />
            </template>
        </Dialog>
        <ConfirmDialog />
    </div>
</template>

<style scoped lang="scss">
.ops-container {
    padding: 1rem;
    @media (min-width: 768px) {
        padding: 1.5rem;
    }
}

/* ── Scan row ──────────────────────────────────────────────────────────────── */
.scan-row {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.scan-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
}

.scan-input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;

    .flex-grow-1 {
        flex: 1;
        min-width: 200px;
    }
}

.scan-hint {
    font-size: 0.78rem;
    color: var(--text-color-secondary);

    kbd {
        background: var(--surface-200);
        border: 1px solid var(--surface-300);
        border-radius: 4px;
        padding: 1px 5px;
        font-size: 0.75rem;
        font-family: monospace;
    }
}

.camara-host {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
    min-height: 220px;
}

.camara-error {
    color: var(--red-500);
    font-size: 0.85rem;
    margin-top: 0.4rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
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
        margin: 0 auto 1.5rem;
        gap: 1.5rem 1rem;
        justify-content: center;
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
    &.stat-pendiente {
        color: var(--orange-400);
    }
    &.stat-proceso {
        color: var(--blue-500);
    }
    &.stat-lista {
        color: var(--green-500);
    }
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

/* Toolbar responsive */
@media screen and (max-width: 767px) {
    :deep(.toolbar-responsive.p-toolbar) {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 1rem;
    }
    :deep(.toolbar-responsive .p-toolbar-start),
    :deep(.toolbar-responsive .p-toolbar-end) {
        width: 100%;
        justify-content: center;
    }
    :deep(.toolbar-responsive .p-toolbar-end .toolbar-end) {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    }
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
    &.text-secondary {
        color: var(--text-color-secondary);
    }
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

/* ── Origen (REDU-1) ──────────────────────────────────────────────────── */
.origen-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem;
    border-radius: 14px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;

    &.origen-picking {
        background: color-mix(in srgb, var(--purple-500) 15%, transparent);
        color: var(--purple-700);
        border: 1px solid color-mix(in srgb, var(--purple-500) 40%, transparent);
    }
    &.origen-automatico {
        background: color-mix(in srgb, var(--teal-500) 12%, transparent);
        color: var(--teal-700);
        border: 1px solid color-mix(in srgb, var(--teal-500) 30%, transparent);
    }

    &.origen-badge-sm {
        padding: 0.12rem 0.45rem;
        font-size: 0.62rem;
    }
}

/* Borde distintivo en cards de picking (mobile) */
.preorden-card.preorden-card-picking {
    border-left: 4px solid var(--purple-500);
    background: linear-gradient(90deg, color-mix(in srgb, var(--purple-500) 4%, transparent) 0%, transparent 30%);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

/* Empty / Loading */
.empty-state,
.loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
    p {
        margin: 0.75rem 0;
        font-size: 1rem;
    }
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

    &.surtido {
        color: var(--green-500);
    }
    &.pendiente {
        color: var(--orange-400);
    }
    &.no-surtido {
        color: var(--red-500);
    }
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

    span {
        font-size: 0.92rem;
        color: var(--text-color);
    }

    &.full {
        grid-column: 1 / -1;
    }
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

.ml-2 {
    margin-left: 0.5rem;
}
.text-primary {
    color: var(--primary-color);
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
}

/* Mobile actions bar */
.mobile-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
}

/* PreOrden Cards mobile */
.preorden-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.preorden-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--surface-200);
    background: color-mix(in srgb, var(--primary-color) 4%, var(--surface-card));
    gap: 0.5rem;
}

.preorden-card-header-left {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.preorden-card-body {
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.preorden-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    gap: 0.5rem;
}

.preorden-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
}

.preorden-value {
    color: var(--text-color);
    font-size: 0.88rem;
    text-align: right;
    word-break: break-word;
}

.preorden-progress {
    margin-top: 0.25rem;
}

.preorden-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    border-top: 1px solid var(--surface-200);
    background: var(--surface-50);
}

:deep(.product-select) {
    .p-select-label {
        white-space: normal !important;
        word-break: break-word;
    }
}

:deep(.p-select-option) {
    white-space: normal !important;
    word-break: break-word;
    line-height: 1.3;
}

.product-item-content {
    width: 100%;
}

.product-mobile-card {
    background: var(--surface-50);
    border: 1px solid var(--surface-300);
    border-left: 4px solid var(--primary-color);
    border-radius: 8px;
    padding: 0.85rem 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
</style>
