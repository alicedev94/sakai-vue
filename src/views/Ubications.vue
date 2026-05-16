<script setup>
import { useAuthStore } from '@/stores/auth';
import { useUbicationsStore } from '@/stores/ubications';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toast = useToast();
const confirm = useConfirm();
const store = useUbicationsStore();
const authStore = useAuthStore();

// ─── Filtros ────────────────────────────────────────────────────────────────
const filtroCodigo = ref('');
const filtroUbicacion = ref('');
const filtroLocalidad = ref('');

// ─── Dialogs ────────────────────────────────────────────────────────────────
const showDialog = ref(false);
const showScannerDialog = ref(false);
const isEditing = ref(false);
const saving = ref(false);

// ─── Escáner de cámara ───────────────────────────────────────────────────────
const CAMARA_HOST_ID = 'camara-codigo-host';
const FORMATOS_BARRAS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE
];

const cameraActiva = ref(false);
const cameraLoading = ref(false);
const cameraError = ref(null);
let html5Scanner = null;
let decodeLock = false;
const scanTarget = ref('codigo'); // 'codigo' o 'ubicacion'

function mensajeFalloCamara(err) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        return 'La cámara requiere HTTPS. Abre la app con https:// desde tu celular.';
    }
    const name = err?.name || '';
    const msg = String(err?.message || err || '');
    if (name === 'NotAllowedError' || /denied|Permission|permi/i.test(msg))
        return 'Permiso de cámara denegado. Permite el acceso en tu navegador.';
    if (name === 'NotFoundError') return 'No se encontró ninguna cámara.';
    if (name === 'NotReadableError' || name === 'TrackStartError')
        return 'La cámara está en uso por otra app.';
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
    try { await scanner.stop(); } catch { /* ya detenido */ }
    try { scanner.clear(); } catch { /* */ }
    cameraActiva.value = false;
    cameraLoading.value = false;
}

async function iniciarCamara(target = 'codigo') {
    scanTarget.value = target;
    if (html5Scanner) await detenerCamara();
    cameraError.value = null;

    if (typeof window !== 'undefined' && !window.isSecureContext) {
        cameraError.value = mensajeFalloCamara({});
        toast.add({ severity: 'warn', summary: 'Cámara', detail: cameraError.value, life: 9000 });
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
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
            if (!codigo || decodeLock) return;
            decodeLock = true;
            try {
                await detenerCamara();
                if (scanTarget.value === 'filtroCodigo') {
                    filtroCodigo.value = codigo;
                    resetMobilePage();
                    showScannerDialog.value = false;
                } else {
                    form.value[scanTarget.value] = codigo;
                }
                toast.add({ severity: 'success', summary: 'Escaneo exitoso', detail: codigo, life: 2500 });
            } finally {
                setTimeout(() => { decodeLock = false; }, 600);
            }
        };

        const attempts = [
            [{ facingMode: 'environment' }, configFull],
            [{ facingMode: 'user' }, configFull],
            [{ facingMode: 'environment' }, configLite],
            [{ facingMode: 'user' }, configLite]
        ];

        let lastErr = null;
        for (const [cam, cfg] of attempts) {
            try {
                if (html5Scanner) {
                    try { await html5Scanner.stop(); } catch { /* */ }
                    try { html5Scanner.clear(); } catch { /* */ }
                    html5Scanner = null;
                }
                html5Scanner = new Html5Qrcode(scanTarget.value === 'filtroCodigo' ? 'camara-filter-host' : CAMARA_HOST_ID);
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

// Detener cámara al cerrar el dialog
watch(showDialog, async (abierto) => {
    if (!abierto) {
        await detenerCamara();
    }
});

watch(showScannerDialog, async (abierto) => {
    if (!abierto) {
        await detenerCamara();
    }
});

async function abrirScannerFiltro() {
    showScannerDialog.value = true;
    await nextTick();
    iniciarCamara('filtroCodigo');
}

const emptyForm = () => ({
    id: null,
    codigo: '',
    ubicacion: '',
    localidad: '',
    usuario: '',
    activo: true
});

const form = ref(emptyForm());

// ─── Filtrado ────────────────────────────────────────────────────────────────
const ubicacionesFiltradas = computed(() => {
    let lista = store.ubications;
    const cod = filtroCodigo.value.trim().toLowerCase();
    const ubi = filtroUbicacion.value.trim().toLowerCase();
    const loc = filtroLocalidad.value.trim().toLowerCase();

    if (cod) lista = lista.filter((u) => u.codigo?.toLowerCase().includes(cod));
    if (ubi) lista = lista.filter((u) => u.ubicacion?.toLowerCase().includes(ubi));
    if (loc) lista = lista.filter((u) => u.localidad?.toLowerCase().includes(loc));
    return lista;
});

// ─── Stats computadas ────────────────────────────────────────────────────────
const totalUbicaciones = computed(() => ubicacionesFiltradas.value.length);
const totalActivas = computed(() => ubicacionesFiltradas.value.filter((u) => u.activo).length);
const totalInactivas = computed(() => ubicacionesFiltradas.value.filter((u) => !u.activo).length);

// ─── Paginado móvil ──────────────────────────────────────────────────────────
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 10;

const mobilePagedItems = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return ubicacionesFiltradas.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() => Math.ceil(ubicacionesFiltradas.value.length / mobileRowsPerPage));

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

// ─── Utilidades ──────────────────────────────────────────────────────────────
const formatFecha = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function clearFilters() {
    filtroCodigo.value = '';
    filtroUbicacion.value = '';
    filtroLocalidad.value = '';
    resetMobilePage();
}

// ─── CRUD ────────────────────────────────────────────────────────────────────
async function cargarDatos() {
    try {
        await store.fetchUbications();
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las ubicaciones', life: 5000 });
    }
}

function abrirCrear() {
    form.value = emptyForm();
    form.value.usuario = authStore.user?.username || 'admin';
    isEditing.value = false;
    showDialog.value = true;
}

function abrirEditar(ubication) {
    form.value = { ...ubication };
    isEditing.value = true;
    showDialog.value = true;
}

async function guardar() {
    if (!form.value.codigo?.trim() || !form.value.ubicacion?.trim()) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'El código y la ubicación son obligatorios', life: 3500 });
        return;
    }

    saving.value = true;
    try {
        if (isEditing.value) {
            await store.updateUbication(form.value.id, form.value);
            toast.add({ severity: 'success', summary: 'Actualizado', detail: 'Ubicación actualizada correctamente', life: 3000 });
        } else {
            await store.createUbication(form.value);
            toast.add({ severity: 'success', summary: 'Creado', detail: 'Ubicación creada correctamente', life: 3000 });
        }
        showDialog.value = false;
    } catch (err) {
        console.log(err);
        if (err.response?.status === 404) {
            toast.add({
                severity: 'warn',
                summary: 'Producto no encontrado',
                detail: `No se encontró un producto con el código "${form.value.codigo}". Verifica el código e intenta nuevamente.`,
                life: 6000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.response?.data?.message || 'No se pudo guardar la ubicación',
                life: 5000
            });
        }
    } finally {
        saving.value = false;
    }
}

function confirmarEliminar(ubication) {
    confirm.require({
        message: `¿Deseas eliminar la ubicación "${ubication.ubicacion}" (${ubication.codigo})?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-trash',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                await store.deleteUbication(ubication.id);
                toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Ubicación eliminada correctamente', life: 3000 });
            } catch (err) {
                toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'No se pudo eliminar la ubicación', life: 5000 });
            }
        }
    });
}

onMounted(cargarDatos);
onUnmounted(detenerCamara);
</script>

<template>
    <div class="ubications-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">
                        <!-- <i class="pi pi-map-marker ubi-icon" /> -->
                        Gestión de Ubicaciones
                    </h2>
                    <p class="subtitle">Administración de ubicaciones de productos por código de barras</p>
                </div>
                <Button
                    label="Nueva Ubicación"
                    icon="pi pi-plus"
                    class="btn-nueva hidden md:flex"
                    @click="abrirCrear"
                />
            </div>

            <!-- Stats Banner -->
            <div class="stats-banner">
                <div class="stat-item">
                    <span class="stat-value">{{ totalUbicaciones }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-activa">{{ totalActivas }}</span>
                    <span class="stat-label">Activas</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-inactiva">{{ totalInactivas }}</span>
                    <span class="stat-label">Inactivas</span>
                </div>
            </div>

            <!-- Toolbar / Filtros -->
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
                        <!-- Nueva ubicación solo visible en mobile desde toolbar -->
                        <Button
                            icon="pi pi-plus"
                            class="flex-1 md:hidden"
                            v-tooltip.top="'Nueva ubicación'"
                            @click="abrirCrear"
                        />
                    </div>
                </template>
                <template #end>
                    <div class="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
                        <div class="flex gap-2 w-full md:w-auto">
                            <IconField class="w-full md:w-auto">
                                <InputIcon><i class="pi pi-barcode" /></InputIcon>
                                <InputText
                                    v-model="filtroCodigo"
                                    placeholder="Buscar por código..."
                                    class="w-full md:w-44"
                                    @input="resetMobilePage"
                                />
                            </IconField>
                            <Button
                                icon="pi pi-camera"
                                severity="secondary"
                                outlined
                                v-tooltip.top="'Escanear para buscar'"
                                @click="abrirScannerFiltro"
                            />
                        </div>
                        <IconField class="w-full md:w-auto">
                            <InputIcon><i class="pi pi-map" /></InputIcon>
                            <InputText
                                v-model="filtroUbicacion"
                                placeholder="Buscar por ubicación..."
                                class="w-full md:w-44"
                                @input="resetMobilePage"
                            />
                        </IconField>
                        <IconField class="w-full md:w-auto">
                            <InputIcon><i class="pi pi-building" /></InputIcon>
                            <InputText
                                v-model="filtroLocalidad"
                                placeholder="Buscar por localidad..."
                                class="w-full md:w-36"
                                @input="resetMobilePage"
                            />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- Tabla (Desktop) -->
            <DataTable
                class="hidden md:block"
                :value="ubicacionesFiltradas"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ubicaciones"
                responsiveLayout="scroll"
                stripedRows
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-map-marker" style="font-size: 3rem; color: var(--text-color-secondary)" />
                        <p>No hay ubicaciones registradas</p>
                    </div>
                </template>
                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando ubicaciones...</p>
                    </div>
                </template>

                <Column field="codigo" header="Código" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span class="codigo-badge">{{ data.codigo }}</span>
                    </template>
                </Column>

                <Column field="ubicacion" header="Ubicación" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <div class="ubi-info">
                            <i class="pi pi-map-marker ubi-pin" />
                            <span class="font-semibold">{{ data.ubicacion }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="localidad" header="Localidad" :sortable="true" style="min-width: 9rem">
                    <template #body="{ data }">
                        <span v-if="data.localidad" class="localidad-tag">{{ data.localidad }}</span>
                        <span v-else class="text-secondary">—</span>
                    </template>
                </Column>

                <Column field="usuario" header="Usuario" :sortable="true" style="min-width: 9rem">
                    <template #body="{ data }">
                        <span class="fecha-text text-secondary">{{ data.usuario || '—' }}</span>
                    </template>
                </Column>

                <Column field="fechaCreacion" header="Fecha Creación" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text">{{ formatFecha(data.fechaCreacion) }}</span>
                    </template>
                </Column>

                <Column field="activo" header="Estado" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span :class="['activo-badge', data.activo ? 'activo' : 'inactivo']">
                            <i :class="data.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                            {{ data.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                    </template>
                </Column>

                <Column :exportable="false" header="Acciones" style="min-width: 9rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                severity="info"
                                v-tooltip.top="'Editar'"
                                @click="abrirEditar(data)"
                            />
                            <Button
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

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <div v-if="store.isLoading && ubicacionesFiltradas.length === 0" class="loading-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-spin pi-spinner text-primary mb-3" style="font-size: 2rem" />
                    <p class="text-secondary m-0">Cargando ubicaciones...</p>
                </div>
                <div v-else-if="!store.isLoading && ubicacionesFiltradas.length === 0" class="empty-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-map-marker mb-3" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p class="text-secondary m-0">No hay ubicaciones registradas</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner text-primary" style="font-size: 3rem" />
                    </div>

                    <!-- Cards paginadas -->
                    <div v-for="data in mobilePagedItems" :key="data.id" class="card p-4 mb-0 flex flex-col gap-3">
                        <div class="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-3">
                            <span class="codigo-badge text-base">{{ data.codigo }}</span>
                            <span :class="['activo-badge', data.activo ? 'activo' : 'inactivo']">
                                <i :class="data.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                                {{ data.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>

                        <div class="flex flex-col gap-2 text-sm text-surface-700 dark:text-surface-0">
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Ubicación:</span>
                                <div class="ubi-info m-0">
                                    <i class="pi pi-map-marker ubi-pin" />
                                    <span class="font-semibold">{{ data.ubicacion }}</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Localidad:</span>
                                <span v-if="data.localidad" class="localidad-tag">{{ data.localidad }}</span>
                                <span v-else class="text-surface-400">—</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Usuario:</span>
                                <span class="fecha-text">{{ data.usuario || '—' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium text-surface-500 dark:text-surface-400">Fecha Creación:</span>
                                <span class="fecha-text">{{ formatFecha(data.fechaCreacion) }}</span>
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-700">
                            <Button icon="pi pi-pencil" outlined rounded severity="info" v-tooltip.top="'Editar'" @click="abrirEditar(data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmarEliminar(data)" />
                        </div>
                    </div>

                    <!-- Paginador móvil -->
                    <div v-if="mobileTotalPages > 1" class="flex justify-center items-center gap-3 mt-2">
                        <Button
                            icon="pi pi-chevron-left"
                            outlined
                            rounded
                            size="small"
                            :disabled="mobileCurrentPage === 0"
                            @click="mobileCurrentPage--"
                        />
                        <span class="text-sm text-secondary">
                            Página {{ mobileCurrentPage + 1 }} de {{ mobileTotalPages }}
                        </span>
                        <Button
                            icon="pi pi-chevron-right"
                            outlined
                            rounded
                            size="small"
                            :disabled="mobileCurrentPage >= mobileTotalPages - 1"
                            @click="mobileCurrentPage++"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog: Crear / Editar -->
        <Dialog
            v-model:visible="showDialog"
            :style="{ width: '520px' }"
            :breakpoints="{ '1199px': '85vw', '575px': '98vw' }"
            :header="isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'"
            :modal="true"
            :closable="!saving"
        >
            <div class="form-grid">
                <!-- Código -->
                <div class="form-field">
                    <label class="form-label required">
                        <i class="pi pi-barcode" /> Código de producto
                    </label>
                    <div class="scan-row">
                        <InputText
                            v-model="form.codigo"
                            placeholder="Ej. 7501000100011 o escanea..."
                            class="scan-input"
                            :class="{ 'p-invalid': !form.codigo?.trim() && saving }"
                        />
                        <Button
                            v-if="!cameraActiva"
                            icon="pi pi-camera"
                            severity="secondary"
                            outlined
                            :loading="cameraLoading"
                            v-tooltip.top="'Escanear con cámara'"
                            @click="iniciarCamara('codigo')"
                        />
                        <Button
                            v-else
                            icon="pi pi-stop"
                            severity="danger"
                            outlined
                            v-tooltip.top="'Detener cámara'"
                            @click="detenerCamara"
                        />
                    </div>
                    <small class="form-hint">Escribe, escanea con pistola (Enter) o usa la cámara</small>

                    <!-- Panel de cámara -->
                    <div v-if="cameraActiva || cameraLoading" class="camara-panel">
                        <p v-if="cameraError" class="camara-error">
                            <i class="pi pi-exclamation-circle" /> {{ cameraError }}
                        </p>
                        <div :id="CAMARA_HOST_ID" class="camara-host" />
                        <p class="camara-hint">
                            Apunta la cámara al código de barras. El código se llenará automáticamente.
                        </p>
                    </div>
                    <p v-if="cameraError && !cameraActiva" class="camara-error mt-1">
                        <i class="pi pi-exclamation-circle" /> {{ cameraError }}
                    </p>
                </div>

                <!-- Ubicación -->
                <div class="form-field">
                    <label class="form-label required">
                        <i class="pi pi-map-marker" /> Ubicación
                    </label>
                    <div class="scan-row">
                        <InputText
                            v-model="form.ubicacion"
                            placeholder="Ej. Bodega A, Estante 3"
                            class="scan-input"
                            :class="{ 'p-invalid': !form.ubicacion?.trim() && saving }"
                        />
                        <Button
                            v-if="!cameraActiva"
                            icon="pi pi-camera"
                            severity="secondary"
                            outlined
                            :loading="cameraLoading"
                            v-tooltip.top="'Escanear con cámara'"
                            @click="iniciarCamara('ubicacion')"
                        />
                    </div>
                    <small class="form-hint">Descripción de la ubicación física (requerido)</small>
                </div>

                <!-- Localidad -->
                <div class="form-field">
                    <label class="form-label">
                        <i class="pi pi-building" /> Localidad
                    </label>
                    <InputText
                        v-model="form.localidad"
                        placeholder="Ej. CD01"
                        class="w-full"
                        maxlength="10"
                    />
                    <small class="form-hint">Código de localidad (máx. 10 caracteres)</small>
                </div>

                <!-- Usuario -->
                <div class="form-field">
                    <label class="form-label">
                        <i class="pi pi-user" /> Usuario
                    </label>
                    <InputText
                        v-model="form.usuario"
                        placeholder="Ej. admin"
                        class="w-full p-disabled"
                        maxlength="50"
                        readonly
                    />
                    <small class="form-hint">Usuario responsable del registro (poblado automáticamente)</small>
                </div>

                <!-- Activo -->
                <div class="form-field form-field-inline">
                    <label class="form-label">
                        <i class="pi pi-power-off" /> Estado
                    </label>
                    <div class="flex items-center gap-3">
                        <ToggleSwitch v-model="form.activo" inputId="activo-switch" />
                        <label for="activo-switch" class="cursor-pointer select-none text-sm font-medium">
                            {{ form.activo ? 'Activo' : 'Inactivo' }}
                        </label>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    :disabled="saving"
                    @click="showDialog = false"
                />
                <Button
                    :label="isEditing ? 'Actualizar' : 'Crear'"
                    :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
                    :loading="saving"
                    @click="guardar"
                />
            </template>
        </Dialog>

        <!-- Dialog: Escáner Filtro -->
        <Dialog
            v-model:visible="showScannerDialog"
            :style="{ width: '400px' }"
            header="Escanear Código"
            :modal="true"
        >
            <div class="camara-panel mt-3">
                <p v-if="cameraError" class="camara-error">
                    <i class="pi pi-exclamation-circle" /> {{ cameraError }}
                </p>
                <div id="camara-filter-host" class="camara-host" />
                <p class="camara-hint">
                    Apunta la cámara al código de barras para buscar la ubicación.
                </p>
            </div>
        </Dialog>

        <ConfirmDialog />
    </div>
</template>

<style scoped lang="scss">
.ubications-container {
    padding: 1rem;
    @media (min-width: 768px) { padding: 1.5rem; }
}

.card {
    background: var(--surface-card);
    border-radius: 14px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

/* Header */
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

.ubi-icon {
    color: var(--primary-color);
    font-size: 1.5rem;
}

.subtitle {
    font-size: 0.93rem;
    color: var(--text-color-secondary);
    margin: 0.3rem 0 0 2.1rem;
}

.btn-nueva {
    white-space: nowrap;
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
    &.stat-activa { color: var(--green-500); }
    &.stat-inactiva { color: var(--red-400); }
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
        grid-template-columns: repeat(3, 1fr);
        width: 100%;
        padding: 1.2rem;
        gap: 1rem;
    }
    .stat-divider { display: none; }
    .stat-value { font-size: 1.4rem; }
    .stat-label { font-size: 0.7rem; text-align: center; }
}

/* Toolbar */
:deep(.p-toolbar) {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
}

/* Código badge */
.codigo-badge {
    background: var(--surface-100);
    color: var(--primary-color);
    padding: 0.28rem 0.75rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.83rem;
    font-family: monospace;
    border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
    letter-spacing: 0.04em;
}

/* Ubicación con ícono */
.ubi-info {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.ubi-pin {
    color: var(--primary-color);
    font-size: 0.85rem;
}

/* Localidad tag */
.localidad-tag {
    background: color-mix(in srgb, var(--blue-500) 12%, transparent);
    color: var(--blue-600);
    border: 1px solid color-mix(in srgb, var(--blue-500) 25%, transparent);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* Estado activo/inactivo */
.activo-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.75rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;

    &.activo {
        background: color-mix(in srgb, var(--green-500) 12%, transparent);
        color: var(--green-600);
        border: 1px solid color-mix(in srgb, var(--green-500) 30%, transparent);
    }
    &.inactivo {
        background: color-mix(in srgb, var(--red-400) 12%, transparent);
        color: var(--red-500);
        border: 1px solid color-mix(in srgb, var(--red-400) 30%, transparent);
    }
}

/* Fecha */
.fecha-text {
    font-size: 0.9rem;
    color: var(--text-color);
    &.text-secondary { color: var(--text-color-secondary); }
}

/* Acciones */
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
    p { margin: 0.75rem 0; font-size: 1rem; }
}

/* Escáner en dialog */
.scan-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.scan-input {
    flex: 1;
    min-width: 0;
}

.camara-panel {
    margin-top: 0.75rem;
    border-radius: 10px;
    border: 1px solid var(--surface-200);
    background: var(--surface-0);
    overflow: hidden;
    padding: 0.75rem;
}

.camara-host {
    width: 100%;
    min-height: 180px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface-900);
    margin-bottom: 0.5rem;
}

:deep(.camara-host video) {
    width: 100% !important;
    border-radius: 8px;
}

.camara-error {
    color: var(--red-500);
    font-size: 0.82rem;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    i { margin-top: 2px; flex-shrink: 0; }
}

.camara-hint {
    font-size: 0.76rem;
    color: var(--text-color-secondary);
    margin: 0;
}

/* Form dialog */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.5rem 0;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-field-inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
}

.form-label {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &.required::after {
        content: '*';
        color: var(--red-500);
        margin-left: 2px;
    }
}

.form-hint {
    font-size: 0.76rem;
    color: var(--text-color-secondary);
}

/* Detail fields */
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
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
        letter-spacing: 0.05em;
    }
    span {
        font-size: 0.95rem;
        color: var(--text-color);
    }
}
</style>
