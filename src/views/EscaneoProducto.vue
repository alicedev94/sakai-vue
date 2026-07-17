<script setup>
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, ref } from 'vue';

import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const authStore = useAuthStore();

const code = ref('');
const loading = ref(false);
const product = ref(null);
const tiendas = ref([]);
const totales = ref({ piso: 0, almacen: 0, cedis: 0, total: 0 });
const qrVisible = ref(false);

const totalLabel = computed(() =>
    `TOTAL (${tiendas.value.length} tienda${tiendas.value.length === 1 ? '' : 's'})`
);

let html5Scanner = null;

const FORMATOS_BARRAS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE
];

function logout() {
    authStore.logout?.();
    localStorage.clear();
    location.href = '/v1/auth/login';
}

function fmtMoney(n) {
    if (n == null) return '—';
    return 'Bs. ' + Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('es-VE', { maximumFractionDigits: 2 });
}

function showError(t) { toast.add({ severity: 'error', summary: 'Error', detail: t, life: 4000 }); }
function showWarn(t)  { toast.add({ severity: 'warn',  summary: 'Atención', detail: t, life: 4000 }); }
function showInfo(t)  { toast.add({ severity: 'info',  summary: 'Info', detail: t, life: 3000 }); }

async function buscar() {
    if (!authStore.token) {
        showWarn('No hay sesión activa. Inicia sesión en /v1/.');
        return;
    }
    const value = (code.value || '').trim();
    if (!value) {
        showWarn('Ingresa un código o código de barras.');
        return;
    }
    product.value = null;
    tiendas.value = [];
    totales.value = { piso: 0, almacen: 0, cedis: 0, total: 0 };
    loading.value = true;

    try {
        const r = await fetch('/api/v1/escaneo-producto/' + encodeURIComponent(value), {
            headers: { 'Authorization': 'Bearer ' + authStore.token, 'Accept': 'application/json' }
        });
        if (r.status === 401 || r.status === 403) {
            showError('Sesión expirada o sin permisos. Vuelve a iniciar sesión.');
            loading.value = false;
            return;
        }
        if (r.status === 404) {
            showWarn('No se encontró ningún producto con código ' + value + '.');
            loading.value = false;
            return;
        }
        if (!r.ok) {
            showError('Error del servidor: HTTP ' + r.status);
            loading.value = false;
            return;
        }
        const data = await r.json();
        product.value = data;
        tiendas.value = data.tiendas || [];
        let tPiso = 0, tAlm = 0, tCedis = 0, tTotal = 0;
        for (const t of tiendas.value) {
            tPiso  += t.piso    || 0;
            tAlm   += t.almacen || 0;
            tCedis += t.cedis   || 0;
            tTotal += t.total   || 0;
        }
        totales.value = { piso: tPiso, almacen: tAlm, cedis: tCedis, total: tTotal };
    } catch (e) {
        showError('No se pudo conectar: ' + e.message);
    } finally {
        loading.value = false;
    }
}

async function toggleScanner() {
    if (qrVisible.value) {
        if (html5Scanner) {
            try { await html5Scanner.stop(); } catch (_) { /* noop */ }
            try { await html5Scanner.clear(); } catch (_) { /* noop */ }
            html5Scanner = null;
        }
        qrVisible.value = false;
        return;
    }
    if (typeof Html5Qrcode === 'undefined') {
        showError('Librería de cámara no disponible en este navegador.');
        return;
    }
    const hostId = 'escaneo-qr-host';
    html5Scanner = new Html5Qrcode(hostId);
    try {
        await html5Scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: 250, formatsToSupport: FORMATOS_BARRAS },
            (txt) => {
                code.value = txt;
                toggleScanner();
                buscar();
            },
            () => {}
        );
        qrVisible.value = true;
    } catch (e) {
        html5Scanner = null;
        showError('No se pudo abrir la cámara: ' + (e?.message || e));
    }
}

onBeforeUnmount(async () => {
    if (html5Scanner) {
        try { await html5Scanner.stop(); } catch (_) { /* noop */ }
        try { await html5Scanner.clear(); } catch (_) { /* noop */ }
        html5Scanner = null;
    }
});
</script>

<template>
    <div class="escaneo-wrap">
        <Toast position="top-right" />

        <section class="escaneo-card">
            <div class="escaneo-header">
                <h2 class="escaneo-title">📦 Escaneo de producto</h2>
                <Button icon="pi pi-sign-out" severity="secondary" text rounded aria-label="Cerrar sesión" @click="logout" />
            </div>

            <div class="escaneo-search">
                <IconField iconPosition="left" class="flex-1">
                    <InputIcon class="pi pi-search" />
                    <InputText
                        v-model="code"
                        placeholder="Escanea o escribe el código de barras (o código maestro) y presiona Enter"
                        class="w-full"
                        @keydown.enter="buscar"
                    />
                </IconField>
                <Button label="Buscar" icon="pi pi-search" @click="buscar" />
                <Button :label="qrVisible ? 'Detener' : '📷 Escanear'" :severity="qrVisible ? 'danger' : 'secondary'" @click="toggleScanner" />
            </div>

            <div v-show="qrVisible" id="escaneo-qr-host" class="escaneo-qr-host" />

            <p class="escaneo-hint">
                <i class="pi pi-info-circle" /> El token se reutiliza del login del SPA.
            </p>
        </section>

        <section v-if="loading" class="escaneo-card">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <p style="margin-top: 1rem">Buscando <code>{{ code }}</code>…</p>
        </section>

        <section v-else-if="product" class="escaneo-card">
            <div class="escaneo-product-header">
                <div>
                    <h3 class="escaneo-product-title">{{ product.descripcion || '(sin descripción)' }}</h3>
                    <div class="escaneo-product-meta">
                        <span><strong>Código:</strong> <code>{{ product.codigo || '—' }}</code></span>
                        <span v-if="product.codigoBarra">
                            <strong>Barra:</strong> <code>{{ product.codigoBarra }}</code>
                        </span>
                    </div>
                </div>
                <div class="escaneo-price">
                    <div v-if="product.enOferta && product.precioOferta && product.precio1">
                        <div class="escaneo-price-old"><s>{{ fmtMoney(product.precio1) }}</s></div>
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

            <Message v-if="tiendas.length === 0" severity="info" :closable="false">
                El producto existe pero no se encontró inventario desglosado en la vista R3.
            </Message>

            <DataTable
                v-else
                :value="tiendas"
                class="escaneo-tiendas"
                striped-rows
                scrollable
                scroll-height="400px"
            >
                <Column field="departamento" header="Tienda / Departamento" />
                <Column field="piso" header="Piso" :body-style="{ textAlign: 'right' }">
                    <template #body="{ data }">
                        <span :class="{ 'escaneo-zero': (data.total || 0) === 0 }">{{ fmt(data.piso) }}</span>
                    </template>
                </Column>
                <Column field="almacen" header="Almacén" :body-style="{ textAlign: 'right' }">
                    <template #body="{ data }">
                        <span :class="{ 'escaneo-zero': (data.total || 0) === 0 }">{{ fmt(data.almacen) }}</span>
                    </template>
                </Column>
                <Column field="cedis" header="CEDIS" :body-style="{ textAlign: 'right' }">
                    <template #body="{ data }">
                        <span :class="{ 'escaneo-zero': (data.total || 0) === 0 }">{{ fmt(data.cedis) }}</span>
                    </template>
                </Column>
                <Column field="total" header="Total" :body-style="{ textAlign: 'right', fontWeight: '700' }">
                    <template #body="{ data }">
                        {{ fmt(data.total) }}
                    </template>
                </Column>
                <ColumnGroup type="footer">
                    <Row>
                        <Column :footer="totalLabel" />
                        <Column :footer="fmt(totales.piso)" :footerStyle="{ textAlign: 'right' }" />
                        <Column :footer="fmt(totales.almacen)" :footerStyle="{ textAlign: 'right' }" />
                        <Column :footer="fmt(totales.cedis)" :footerStyle="{ textAlign: 'right' }" />
                        <Column :footer="fmt(totales.total)" :footerStyle="{ textAlign: 'right', fontWeight: '700' }" />
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
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
.escaneo-qr-host {
    max-width: 420px;
    margin: 0.75rem 0;
    border: 1px dashed var(--surface-300, #d1d5db);
    border-radius: 8px;
    padding: 8px;
}
.escaneo-hint {
    color: var(--text-muted-color, #6b7280);
    font-size: 0.8125rem;
    margin: 0;
}
.escaneo-product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
}
.escaneo-product-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.375rem;
    font-weight: 700;
}
.escaneo-product-meta {
    display: flex;
    gap: 1rem;
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
.escaneo-price {
    text-align: right;
}
.escaneo-price-old {
    color: var(--text-muted-color, #6b7280);
}
.escaneo-price-offer {
    color: var(--green-600, #16a34a);
    font-weight: 700;
    font-size: 1.5rem;
    background: var(--green-50, #ecfdf5);
    padding: 6px 12px;
    border-radius: 6px;
    display: inline-block;
    margin-top: 4px;
}
.escaneo-price-main {
    font-size: 1.5rem;
    font-weight: 700;
}
.escaneo-badge {
    display: inline-block;
    margin-left: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--green-100, #dcfce7);
    color: var(--green-700, #15803d);
}
.escaneo-section-title {
    margin: 1rem 0 0.5rem;
    font-size: 1.0625rem;
}
.escaneo-zero {
    color: var(--surface-300, #d1d5db);
}
@media (max-width: 640px) {
    .escaneo-search {
        flex-wrap: wrap;
    }
    .escaneo-product-header {
        flex-direction: column;
    }
    .escaneo-price {
        text-align: left;
        width: 100%;
    }
}
</style>
