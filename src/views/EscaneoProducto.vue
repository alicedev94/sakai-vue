<script setup>
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';

import { useAuthStore } from '@/stores/auth';
import apiClient from '@/service/apiClient';

const toast = useToast();
const authStore = useAuthStore();

const code = ref('');
const loading = ref(false);
const product = ref(null);
const tiendas = ref([]);
const totales = ref({ piso: 0, almacen: 0, cedis: 0, total: 0 });
const cameraVisible = ref(false);
const cameraLoading = ref(false);
const cameraSupported = ref(true);

const totalLabel = computed(() => `TOTAL (${tiendas.value.length} tienda${tiendas.value.length === 1 ? '' : 's'})`);

let html5Scanner = null;
// timeout de 6s para detectar cuando la camara no se inicializa
// (algunos navegadores quedan en silencio con un container negro sin
// nunca terminar de reproducir el video).
const SCANNER_START_TIMEOUT_MS = 6000;

const FORMATOS_BARRAS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE
];

function fmtMoney(n) {
    if (n == null) return '—';
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function showError(t) {
    toast.add({ severity: 'error', summary: 'Error', detail: t, life: 4000 });
}
function showWarn(t) {
    toast.add({ severity: 'warn', summary: 'Atención', detail: t, life: 4000 });
}
function showInfo(t) {
    toast.add({ severity: 'info', summary: 'Info', detail: t, life: 3000 });
}

/**
 * Normaliza lo que llega del scanner o de tipeo manual.
 *  - trim
 *  - strip de prefijos de simbologia AIM (]C0, ]C1, [C, etc.)
 *  - strip de prefijos de Code 39 (]A0..]A6)
 *  - strip de brackets residuales al inicio
 */
function normalizarCodigo(texto) {
    if (!texto) return '';
    let limpio = String(texto).trim();
    // AIM identifiers: ]X, ]XN, [X, [XN donde X es letra y N opcional
    limpio = limpio.replace(/^[\[\]][A-Za-z]\d*\s*/, '');
    // Brackets residuales tipo [C], [01], etc.
    limpio = limpio.replace(/^\[[A-Za-z0-9]+\]\s*/, '');
    return limpio.trim();
}

async function buscar() {
    if (!authStore.token) {
        showWarn('No hay sesión activa. Inicia sesión en /v1/.');
        return;
    }
    const value = normalizarCodigo(code.value);
    if (!value) {
        showWarn('Ingresa un código o código de barras.');
        return;
    }
    code.value = value; // reflejar normalizado en el input
    product.value = null;
    tiendas.value = [];
    totales.value = { piso: 0, almacen: 0, cedis: 0, total: 0 };
    loading.value = true;

    try {
        const r = await apiClient.get('/escaneo-producto/' + encodeURIComponent(value));
        const data = r.data;
        product.value = data;
        tiendas.value = data.tiendas || [];
        let tPiso = 0,
            tAlm = 0,
            tCedis = 0,
            tTotal = 0;
        for (const t of tiendas.value) {
            tPiso += t.piso || 0;
            tAlm += t.almacen || 0;
            tCedis += t.cedis || 0;
            tTotal += t.total || 0;
        }
        totales.value = { piso: tPiso, almacen: tAlm, cedis: tCedis, total: tTotal };
    } catch (e) {
        // Axios rechaza la promesa en 4xx/5xx con error.response poblado
        if (e.response) {
            const status = e.response.status;
            if (status === 401 || status === 403) {
                showError('Sesión expirada o sin permisos. Vuelve a iniciar sesión.');
            } else if (status === 404) {
                showWarn('No se encontró ningún producto con código ' + value + '.');
            } else {
                showError('Error del servidor: HTTP ' + status);
            }
        } else {
            showError('No se pudo conectar: ' + e.message);
        }
    } finally {
        loading.value = false;
    }
}

async function toggleScanner() {
    if (cameraVisible.value) {
        // El scanner esta activo. Limpiar ANTES de cambiar el state
        // para que Vue no desmonte el <div> mientras html5-qrcode lo
        // sigue usando.
        await stopScanner();
        return;
    }
    if (typeof Html5Qrcode === 'undefined') {
        showError('Libreria de camara no disponible en este navegador.');
        return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraSupported.value = false;
        showError('Tu navegador no expone la API de camara (getUserMedia). Usa el boton "Subir imagen" para escanear desde un archivo.');
        return;
    }

    // Mostrar el container PRIMERO (con v-if, Vue lo monta) y luego
    // esperar un tick antes de inicializar html5-qrcode, asi el nodo
    // ya esta en el DOM cuando la libreria intenta hacer appendChild.
    cameraLoading.value = true;
    cameraVisible.value = true;
    await nextTick();

    const hostId = 'escaneo-qr-host';
    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        showWarn('La camara tarda en inicializar. Si sigue en negro, usa el boton "Subir imagen" abajo.');
    }, SCANNER_START_TIMEOUT_MS);

    try {
        html5Scanner = new Html5Qrcode(hostId);
        await html5Scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250, formatsToSupport: FORMATOS_BARRAS },
            (txt) => {
                code.value = txt;
                stopScanner();
                buscar();
            },
            () => {}
        );
        clearTimeout(timeoutId);
        cameraLoading.value = false;
    } catch (e) {
        clearTimeout(timeoutId);
        await stopScanner();
        cameraLoading.value = false;
        const msg = String(e?.message || e || '');
        if (/Permission|NotAllowedError|denied/i.test(msg)) {
            showError('El navegador bloqueo el acceso a la camara. Habilita los permisos de camara para este sitio y reintenta. Tambien puedes usar "Subir imagen".');
        } else if (/NotFoundError|device|not.*found/i.test(msg)) {
            cameraSupported.value = false;
            showError('No se detecto ninguna camara en este dispositivo. Usa "Subir imagen" para escanear un barcode desde un archivo.');
        } else {
            showError('No se pudo abrir la camara: ' + (msg || 'error desconocido') + '. Prueba con "Subir imagen".');
        }
    } finally {
        if (!html5Scanner || (html5Scanner && !html5Scanner.isScanning)) {
            cameraLoading.value = false;
        }
        if (timedOut) cameraLoading.value = false;
    }
}

async function stopScanner() {
    if (html5Scanner) {
        try {
            await html5Scanner.stop();
        } catch (_) {
            /* noop */
        }
        try {
            await html5Scanner.clear();
        } catch (_) {
            /* noop */
        }
        html5Scanner = null;
    }
    cameraVisible.value = false;
    cameraLoading.value = false;
}

async function escanearArchivo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
        // Asegurar que el scanner de camara este cerrado antes de usar el
        // container para scanFile (html5-qrcode necesita el container libre)
        if (html5Scanner) await stopScanner();

        // Crear un container temporal separado para que html5-qrcode no
        // manipule nuestro <div id="escaneo-qr-host"> (que puede estar
        // siendo controlado por Vue).
        const tempId = 'escaneo-file-temp-' + Date.now();
        const tempHost = document.createElement('div');
        tempHost.id = tempId;
        tempHost.style.display = 'none';
        document.body.appendChild(tempHost);

        try {
            const scanner = new Html5Qrcode(tempId);
            const result = await scanner.scanFile(file, true);
            code.value = result;
            buscar();
        } finally {
            try {
                await scanner.clear();
            } catch (_) {
                /* noop */
            }
            document.body.removeChild(tempHost);
        }
    } catch (e) {
        showError('No se pudo leer el codigo de la imagen: ' + (e?.message || e));
    } finally {
        event.target.value = '';
    }
}

onBeforeUnmount(async () => {
    if (html5Scanner) {
        try {
            await html5Scanner.stop();
        } catch (_) {
            /* noop */
        }
        try {
            await html5Scanner.clear();
        } catch (_) {
            /* noop */
        }
        html5Scanner = null;
    }
});
</script>

<template>
    <div class="escaneo-wrap">
        <section class="escaneo-card">
            <div class="escaneo-header">
                <h2 class="escaneo-title">Escaneo de producto</h2>
            </div>

            <!-- form con @submit.prevent para que Enter dispare buscar
                 de forma confiable cross-browser (Safari/iOS a veces no
                 propaga keydown.enter desde InputText). Ademas dejamos
                 keyup.enter como red de seguridad. -->
            <form class="escaneo-search" @submit.prevent="buscar">
                <InputText v-model="code" placeholder="Escanea o escribe el código (Enter para buscar)" class="escaneo-input" @keyup.enter.prevent="buscar" />
                <Button type="submit" label="Buscar" />
                <Button type="button" :label="cameraVisible ? 'Detener cámara' : 'Escanear'" :severity="cameraVisible ? 'danger' : 'secondary'" :loading="cameraLoading" @click="toggleScanner" />
            </form>

            <!-- wrapper con position:relative. adentro:
                 - el spinner mientras carga (no lo mete Vue dentro del
                   host porque html5-qrcode va a hacer appendChild al
                   mismo nodo y se pierde la referencia -> nextSibling null)
                 - el host del scanner (vacia, html5-qrcode la controla) -->
            <div v-if="cameraVisible" class="escaneo-camera-wrap">
                <div v-if="cameraLoading" class="escaneo-qr-loading">
                    <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                    <span>Inicializando camara...</span>
                </div>
                <div id="escaneo-qr-host" class="escaneo-qr-host"></div>
            </div>

            <div class="escaneo-upload-row">
                <label for="escaneo-file" class="escaneo-upload-label"> <i class="pi pi-image" /> Escanear desde imagen (si la camara no funciona) </label>
                <input id="escaneo-file" type="file" accept="image/*" capture="environment" class="escaneo-upload-input" @change="escanearArchivo" />
            </div>

            
        </section>

        <section v-if="loading" class="escaneo-card escaneo-loading">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <p style="margin-top: 1rem">
                Buscando <code>{{ code }}</code
                >…
            </p>
        </section>

        <section v-else-if="product" class="escaneo-card">
            <div class="escaneo-product-header">
                <div class="escaneo-product-info">
                    <h3 class="escaneo-product-title">{{ product.descripcion || '(sin descripción)' }}</h3>
                    <div class="escaneo-product-meta">
                        <span
                            ><strong>Código:</strong> <code>{{ product.codigo || '—' }}</code></span
                        >
                        <span v-if="product.codigoBarra">
                            <strong>Barra:</strong> <code>{{ product.codigoBarra }}</code>
                        </span>
                    </div>
                </div>
                <div class="escaneo-price-block">
                    <div v-if="product.enOferta && product.precioOferta && product.precio1" class="escaneo-price-offer-wrap">
                        <div class="escaneo-price-old">
                            <s>{{ fmtMoney(product.precio1) }}</s>
                        </div>
                        <div class="escaneo-price-offer">
                            {{ fmtMoney(product.precioOferta) }}
                            <span class="escaneo-badge">Oferta</span>
                        </div>
                    </div>
                    <div v-else class="escaneo-price-main">
                        {{ fmtMoney(product.precio1) }}
                    </div>
                </div>
            </div>

            <Divider />

            <h4 class="escaneo-section-title">Disponibilidad por tienda</h4>

            <Message v-if="tiendas.length === 0" severity="info" :closable="false"> El producto existe pero no se encontró inventario desglosado en la vista R3. </Message>

            <DataTable v-else :value="tiendas" class="escaneo-tiendas">
                <Column field="departamento" header="Tienda" header-style="text-align:left"></Column>
                <Column field="piso" header="Piso" header-style="text-align:right" body-style="text-align:right"></Column>
                <Column field="almacen" header="Almacén" header-style="text-align:right" body-style="text-align:right"></Column>
                <Column field="cedis" header="Cedis" header-style="text-align:right" body-style="text-align:right"></Column>
                <Column field="total" header="Total" header-style="text-align:right;font-weight:700" body-style="text-align:right;font-weight:700"></Column>
                <ColumnGroup type="footer">
                    <Row>
                        <Column :footer="totalLabel" footer-style="text-align:left;font-weight:700" />
                        <Column :footer="fmt(totales.piso)" footer-style="text-align:right" />
                        <Column :footer="fmt(totales.almacen)" footer-style="text-align:right" />
                        <Column :footer="fmt(totales.cedis)" footer-style="text-align:right" />
                        <Column :footer="fmt(totales.total)" footer-style="text-align:right;font-weight:700" />
                    </Row>
                </ColumnGroup>
            </DataTable>
        </section>
    </div>
</template>

<style scoped>
.escaneo-wrap {
    max-width: 1100px;
    margin: 0 auto;
}
.escaneo-card {
    background: var(--surface-card, #fff);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.06),
        0 1px 2px rgba(0, 0, 0, 0.04);
    margin-bottom: 1rem;
}
.escaneo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
}
.escaneo-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}
.escaneo-search {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    align-items: center;
}
.escaneo-search :deep(.escaneo-input) {
    flex: 1;
}
.escaneo-camera-wrap {
    position: relative;
    margin: 0.75rem 0;
    width: 100%;
}
.escaneo-qr-host {
    position: relative;
    min-height: 320px;
    max-width: 100%;
    width: 100%;
    border: 1px dashed var(--surface-300, #d1d5db);
    border-radius: 8px;
    padding: 8px;
    background: #000;
    overflow: hidden;
}
.escaneo-qr-host :deep(video) {
    max-width: 100% !important;
    height: auto !important;
}
.escaneo-qr-host :deep(#escaneo-qr-host__dashboard_section_csr button),
.escaneo-qr-host :deep(#escaneo-qr-host__dashboard_section_swaplink) {
    color: #fff;
}
.escaneo-qr-loading {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    color: #fff;
    font-size: 0.875rem;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
}
.escaneo-upload-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0 0.5rem 0;
    padding: 0.5rem 0.75rem;
    background: var(--surface-50, #f9fafb);
    border-radius: 6px;
    border: 1px dashed var(--surface-300, #d1d5db);
}
.escaneo-upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8125rem;
    color: var(--text-muted-color, #6b7280);
    cursor: pointer;
}
.escaneo-upload-label i {
    color: var(--primary-color, #2563eb);
}
.escaneo-upload-input {
    display: none;
}
.escaneo-upload-label::after {
    content: 'Elegir archivo';
    margin-left: auto;
    padding: 4px 10px;
    background: var(--primary-color, #2563eb);
    color: #fff;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}
.escaneo-upload-input:focus-visible + .escaneo-upload-label {
    outline: 2px solid var(--primary-color, #2563eb);
    outline-offset: 2px;
}
.escaneo-hint {
    color: var(--text-muted-color, #6b7280);
    font-size: 0.8125rem;
    margin: 0;
}
.escaneo-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
.escaneo-product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
}
.escaneo-product-info {
    flex: 1 1 360px;
    min-width: 0;
}
.escaneo-product-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.375rem;
    font-weight: 700;
}
.escaneo-product-meta {
    display: flex;
    gap: 1.25rem;
    color: var(--text-muted-color, #6b7280);
    font-size: 0.8125rem;
    flex-wrap: wrap;
}
.escaneo-product-meta code {
    background: var(--surface-100, #f3f4f6);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
}
.escaneo-price-block {
    flex: 0 0 auto;
    text-align: right;
    min-width: 180px;
}
.escaneo-price-offer-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}
.escaneo-price-old {
    color: var(--text-muted-color, #6b7280);
    font-size: 0.95rem;
}
.escaneo-price-offer {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--green-600, #16a34a);
    font-weight: 700;
    font-size: 1.5rem;
    background: var(--green-50, #ecfdf5);
    padding: 6px 12px;
    border-radius: 6px;
}
.escaneo-price-main {
    font-size: 1.5rem;
    font-weight: 700;
}
.escaneo-badge {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--green-100, #dcfce7);
    color: var(--green-700, #15803d);
}
.escaneo-section-title {
    margin: 1rem 0 0.75rem;
    font-size: 1.0625rem;
    font-weight: 700;
}
/* DataTable clean look: sin striped, sin scroll, padding uniforme */
.escaneo-tiendas :deep(.p-datatable-wrapper) {
    overflow-x: auto;
}
.escaneo-tiendas :deep(.p-datatable-table) {
    width: 100%;
    min-width: 680px;
    table-layout: fixed;
    border-collapse: collapse;
}
.escaneo-tiendas :deep(.p-datatable-thead > tr > th) {
    text-transform: none;
    font-size: 0.8125rem;
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 1px solid var(--p-datatable-column-border-color, #e5e7eb);
    background: var(--p-datatable-header-cell-background, #f9fafb);
    color: var(--p-datatable-header-cell-color, inherit);
    white-space: nowrap;
}
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td) {
    padding: 12px 16px;
    font-size: 0.875rem;
    vertical-align: middle;
    border-bottom: 1px solid var(--p-datatable-column-border-color, #f3f4f6);
    color: var(--p-datatable-body-cell-color, inherit);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.escaneo-tiendas :deep(.p-datatable-tfoot > tr > td) {
    padding: 14px 16px;
    font-size: 0.875rem;
    background: var(--p-datatable-header-cell-background, #f9fafb);
    color: var(--p-datatable-header-cell-color, inherit);
    border-top: 2px solid var(--p-datatable-column-border-color, #e5e7eb);
    white-space: nowrap;
}
.escaneo-tiendas :deep(.p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}
/* Anchos fijos por columna para que no haya wrapping raro */
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td:nth-child(1)),
.escaneo-tiendas :deep(.p-datatable-thead > tr > th:nth-child(1)) {
    width: 52%;
    text-align: left;
}
.escaneo-tiendas :deep(.p-datatable-thead > tr > th:nth-child(2)),
.escaneo-tiendas :deep(.p-datatable-thead > tr > th:nth-child(3)),
.escaneo-tiendas :deep(.p-datatable-thead > tr > th:nth-child(4)),
.escaneo-tiendas :deep(.p-datatable-thead > tr > th:nth-child(5)),
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td:nth-child(2)),
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td:nth-child(3)),
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td:nth-child(4)),
.escaneo-tiendas :deep(.p-datatable-tbody > tr > td:nth-child(5)) {
    width: 12%;
    text-align: right;
}

.app-dark .escaneo-tiendas :deep(.p-datatable-thead > tr > th),
.app-dark .escaneo-tiendas :deep(.p-datatable-tfoot > tr > td) {
    background: var(--p-surface-800);
    color: var(--p-surface-0);
    border-color: var(--p-surface-700);
}
.app-dark .escaneo-tiendas :deep(.p-datatable-tbody > tr > td) {
    background: var(--p-surface-900);
    color: var(--p-surface-100);
    border-color: var(--p-surface-700);
}
.app-dark .escaneo-tiendas :deep(.p-datatable-tbody > tr:hover > td) {
    background: var(--p-surface-700);
}
.app-dark .escaneo-card {
    background: var(--p-surface-900);
}
.app-dark .escaneo-upload-row {
    background: var(--p-surface-800);
    border-color: var(--p-surface-700);
}
.app-dark .escaneo-product-meta code {
    background: var(--p-surface-800);
}

@media (max-width: 760px) {
    .escaneo-search {
        flex-wrap: wrap;
    }
    .escaneo-search :deep(.escaneo-input) {
        flex: 1 0 100%;
    }
    .escaneo-product-header {
        flex-direction: column;
    }
    .escaneo-price-block {
        text-align: left;
        width: 100%;
    }
    .escaneo-tiendas :deep(.p-datatable-table) {
        min-width: 560px;
    }
}
</style>
