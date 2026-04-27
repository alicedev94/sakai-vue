<script setup>
import { sincronizacionService } from '@/service/SincronizacionService';
import { useSincronizacionStore } from '@/stores/sincronizacion';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// ─── Composables ──────────────────────────────────────────────────────────────
const toast = useToast();
const confirm = useConfirm();
const store = useSincronizacionStore();

// ─── State de la vista ────────────────────────────────────────────────────────
const configDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const selectedItem = ref({});
const searchQuery = ref('');

// ─── Paginado móvil ──────────────────────────────────────────────────────────
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 6;

// ─── Departamentos ────────────────────────────────────────────────────────────
const departamentos = ref([]);
const isDepartamentosLoading = ref(false);

const fetchDepartamentos = async () => {
    if (departamentos.value.length > 0) return; // ya cargados
    isDepartamentosLoading.value = true;
    try {
        const { data } = await sincronizacionService.getDepartamentos();
        departamentos.value = data;
    } catch (err) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'No se pudieron cargar los departamentos',
            life: 4000
        });
    } finally {
        isDepartamentosLoading.value = false;
    }
};

const PRIORIDADES = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja', value: 'BAJA' }
];

const TIPOS_DOCUMENTO = [
    { id: 1, nombre: 'Orden' },
    { id: 2, nombre: 'PreOrden' }
];

const FORM_DEFAULTS = {
    departamento: null,
    intervaloMinutos: 5,
    esActivo: true,
    prioridad: 'MEDIA',
    tipoDocumento: null
};

// ─── Filtros de búsqueda ─────────────────────────────────────────────────────
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// ─── Computed ─────────────────────────────────────────────────────────────────
const configuracionesFiltradas = computed(() => {
    if (!searchQuery.value) return store.configuraciones;
    const q = searchQuery.value.toLowerCase();
    return store.configuraciones.filter((c) => c.departamento?.toLowerCase().includes(q));
});

const mobilePagedConfiguraciones = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return configuracionesFiltradas.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() =>
    Math.ceil(configuracionesFiltradas.value.length / mobileRowsPerPage)
);

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

const isEditing = computed(() => !!selectedItem.value.id);

const dialogHeader = computed(() =>
    isEditing.value ? 'Editar Configuración' : 'Nueva Configuración'
);

// ─── Helpers de formato ───────────────────────────────────────────────────────
/**
 * Formatea una fecha ISO a DD/MM/YYYY HH:mm
 * @param {string|null} value
 * @returns {string}
 */
const formatFecha = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
};

/**
 * Retorna el icono de PrimeIcons según el nivel de prioridad.
 * @param {'ALTA'|'MEDIA'|'BAJA'|string} prioridad
 * @returns {string}
 */
const prioridadIcono = (prioridad) => {
    const map = {
        ALTA: 'pi pi-arrow-up-right',
        MEDIA: 'pi pi-minus',
        BAJA: 'pi pi-arrow-down-right'
    };
    return map[prioridad] ?? 'pi pi-minus';
};

// ─── Acciones CRUD ────────────────────────────────────────────────────────────
const cargarDatos = async () => {
    try {
        await store.fetchConfiguraciones();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: err.userMessage || 'No se pudieron cargar las configuraciones',
            life: 5000
        });
    }
};

const abrirNuevo = () => {
    selectedItem.value = { ...FORM_DEFAULTS };
    submitted.value = false;
    fetchDepartamentos();
    configDialog.value = true;
};

const editarItem = (item) => {
    // Recuperar el objeto departamento si ya están cargados, o usar la descripcion como fallback
    fetchDepartamentos().then(() => {
        const deptObj = departamentos.value.find((d) => d.descripcion === item.departamento);
        selectedItem.value = {
            ...item,
            departamento: deptObj ?? item.departamento,
            prioridad: item.prioridad ?? 'MEDIA',
            tipoDocumento: item.tipoDocumento ?? null
        };
    });
    submitted.value = false;
    configDialog.value = true;
};

const cerrarDialog = () => {
    configDialog.value = false;
    submitted.value = false;
    selectedItem.value = {};
};

const guardar = async () => {
    submitted.value = true;

    // departamento puede ser un objeto {descripcion} o un string (fallback edición)
    const deptValor = typeof selectedItem.value.departamento === 'object'
        ? selectedItem.value.departamento?.descripcion
        : selectedItem.value.departamento;

    if (!deptValor?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'Debes seleccionar un departamento',
            life: 3000
        });
        return;
    }

    if (!selectedItem.value.intervaloMinutos || selectedItem.value.intervaloMinutos < 1) {
        toast.add({
            severity: 'warn',
            summary: 'Campo inválido',
            detail: 'El intervalo debe ser al menos 1 minuto',
            life: 3000
        });
        return;
    }

    if (!selectedItem.value.tipoDocumento) {
        toast.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'Debes seleccionar un tipo de documento',
            life: 3000
        });
        return;
    }

    const payload = {
        departamento: deptValor.trim(),
        intervaloMinutos: Number(selectedItem.value.intervaloMinutos),
        esActivo: selectedItem.value.esActivo ?? true,
        prioridad: selectedItem.value.prioridad ?? 'MEDIA',
        tipoDocumento: selectedItem.value.tipoDocumento
    };

    try {
        if (isEditing.value) {
            await store.actualizarConfiguracion(selectedItem.value.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: `La configuración de "${payload.departamento}" fue actualizada`,
                life: 3000
            });
        } else {
            await store.crearConfiguracion(payload);
            toast.add({
                severity: 'success',
                summary: 'Creado',
                detail: `La configuración de "${payload.departamento}" fue creada`,
                life: 3000
            });
        }
        cerrarDialog();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo guardar la configuración',
            life: 5000
        });
    }
};

const confirmarEliminar = (item) => {
    selectedItem.value = item;
    deleteDialog.value = true;
};

const eliminar = async () => {
    try {
        await store.eliminarConfiguracion(selectedItem.value.id);
        deleteDialog.value = false;
        selectedItem.value = {};
        toast.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'La configuración fue eliminada correctamente',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo eliminar la configuración',
            life: 5000
        });
    }
};

/**
 * Toggle optimista del estado activo/inactivo de una configuración.
 * Actualiza el estado local de inmediato y luego hace la petición al backend.
 * Si falla, revierte el cambio visualmente.
 * @param {Object} item
 */
const toggleActivo = async (item) => {
    const nuevoEstado = !item.esActivo;
    store.toggleActivoOptimista(item.id, nuevoEstado);

    try {
        await store.actualizarConfiguracion(item.id, {
            departamento: item.departamento,
            intervaloMinutos: item.intervaloMinutos,
            esActivo: nuevoEstado,
            prioridad: item.prioridad ?? 'MEDIA',
            tipoDocumento: item.tipoDocumento ?? null
        });
        toast.add({
            severity: 'info',
            summary: nuevoEstado ? 'Activado' : 'Desactivado',
            detail: `Sincronización de "${item.departamento}" ${nuevoEstado ? 'activada' : 'pausada'}`,
            life: 2500
        });
    } catch (err) {
        // Revertir cambio optimista
        store.toggleActivoOptimista(item.id, item.esActivo);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo cambiar el estado',
            life: 4000
        });
    }
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
    cargarDatos();
    fetchDepartamentos();
});
</script>

<template>
    <div class="sinc-container">
        <div class="card">
            <!-- ── Header ──────────────────────────────────────────────────── -->
            <div class="card-header">
                <div class="header-text">
                    <h2 class="title">
                        <!-- <i class="pi pi-sync sinc-icon" /> -->
                        Panel de Automatización
                    </h2>
                    <p class="subtitle">Gestión de la sincronización de departamentos</p>
                </div>
                <div class="hidden md:block">
                    <Button
                        id="btn-nueva-configuracion"
                        label="Nueva Configuración"
                        icon="pi pi-plus"
                        class="p-button-success"
                        @click="abrirNuevo"
                    />
                </div>
            </div>

            <!-- ── Stats banner ────────────────────────────────────────────── -->
            <div class="stats-banner">
                <div class="stat-item">
                    <span class="stat-value">{{ store.totalConfiguraciones }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-activa">{{ store.configuracionesActivas.length }}</span>
                    <span class="stat-label">Activas</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-inactiva">{{ store.totalConfiguraciones - store.configuracionesActivas.length }}</span>
                    <span class="stat-label">Inactivas</span>
                </div>
            </div>

            <!-- ── Toolbar de búsqueda ─────────────────────────────────────── -->
            <Toolbar class="mb-5 toolbar-responsive">
                <template #start>
                    <div class="hidden md:flex gap-2">
                        <Button
                            id="btn-refrescar"
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            v-tooltip.top="'Actualizar'"
                            :loading="store.isLoading"
                            @click="cargarDatos"
                        />
                    </div>
                    <div class="block md:hidden w-full">
                        <Button
                            label="Nueva Configuración"
                            icon="pi pi-plus"
                            class="p-button-success w-full"
                            @click="abrirNuevo"
                        />
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-end w-full md:w-auto">
                        <IconField class="w-full md:w-auto">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText
                                id="sinc-search"
                                v-model="searchQuery"
                                placeholder="Buscar departamento..."
                                class="w-full"
                                @input="resetMobilePage"
                            />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- ── Tabla principal (Desktop) ─────────────────────────────────── -->
            <DataTable
                :value="configuracionesFiltradas"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} configuraciones"
                responsiveLayout="scroll"
                stripedRows
                class="sinc-table hidden md:block"
                v-model:filters="filters"
            >
                <!-- Empty state -->
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                        <p>No hay configuraciones de sincronización</p>
                        <Button label="Crear primera configuración" icon="pi pi-plus" text @click="abrirNuevo" />
                    </div>
                </template>

                <!-- Loading overlay -->
                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando configuraciones...</p>
                    </div>
                </template>

                <!-- ID -->
                <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column>

                <!-- Departamento -->
                <Column field="departamento" header="Departamento" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <div class="dept-info">
                            <Avatar
                                :label="data.departamento?.charAt(3).toUpperCase()"
                                shape="circle"
                                class="dept-avatar"
                            />
                            <span class="font-semibold">{{ data.departamento }}</span>
                        </div>
                    </template>
                </Column>

                <!-- Tipo Documento -->
                <Column field="tipoDocumento.nombre" header="Tipo Documento" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ data.tipoDocumento?.nombre || '-' }}</span>
                    </template>
                </Column>

                <!-- Intervalo -->
                <Column field="intervaloMinutos" header="Intervalo (min)" :sortable="true" style="min-width: 9rem">
                    <template #body="{ data }">
                        <div class="interval-cell">
                            <i class="pi pi-clock interval-icon" />
                            <span>{{ data.intervaloMinutos }} min</span>
                        </div>
                    </template>
                </Column>

                <!-- Última Ejecución -->
                <Column field="ultimaEjecucion" header="Última Ejecución" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <span class="fecha-text">{{ formatFecha(data.ultimaEjecucion) }}</span>
                    </template>
                </Column>

                <!-- Fecha Creación -->
                <Column field="fechaCreacion" header="Creado" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text text-secondary">{{ formatFecha(data.fechaCreacion) }}</span>
                    </template>
                </Column>

                <!-- Usuario Modificación -->
                <Column field="usuarioModificacion" header="Modificado por" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text text-secondary">{{ data.usuarioModificacion }}</span>
                    </template>
                </Column>

                <!-- Estado (Toggle Switch) -->
                <Column field="esActivo" header="Estado" :sortable="true" style="min-width: 9rem">
                    <template #body="{ data }">
                        <div class="toggle-cell">
                            <ToggleSwitch
                                :id="`toggle-sinc-${data.id}`"
                                :modelValue="data.esActivo"
                                @update:modelValue="() => toggleActivo(data)"
                                :disabled="store.isLoading"
                            />
                            <span :class="['estado-label', data.esActivo ? 'activo' : 'inactivo']">
                                {{ data.esActivo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                    </template>
                </Column>

                <!-- Prioridad -->
                <Column field="prioridad" header="Prioridad" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span :class="['prioridad-badge', `prioridad-${data.prioridad?.toLowerCase()}`]">
                            <i :class="prioridadIcono(data.prioridad)" />
                            {{ data.prioridad }}
                        </span>
                    </template>
                </Column>

                <!-- En Ejecución -->
                <Column field="enEjecucion" header="Ejecución" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span :class="['ejecucion-badge', data.enEjecucion ? 'running' : 'idle']">
                            <i :class="data.enEjecucion ? 'pi pi-spin pi-spinner' : 'pi pi-pause-circle'" />
                            {{ data.enEjecucion ? 'Corriendo' : 'En espera' }}
                        </span>
                    </template>
                </Column>

                <!-- Acciones -->
                <Column :exportable="false" style="min-width: 9rem" header="Acciones">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button
                                :id="`btn-editar-${data.id}`"
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                @click="editarItem(data)"
                                v-tooltip.top="'Editar'"
                            />
                            <Button
                                :id="`btn-eliminar-${data.id}`"
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmarEliminar(data)"
                                v-tooltip.top="'Eliminar'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- ── Vista Cards (Mobile) ────────────────────────────────────── -->
            <div class="block md:hidden">
                <div class="mobile-actions">
                    <Button
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        size="small"
                        :loading="store.isLoading"
                        @click="cargarDatos"
                        label="Actualizar"
                    />
                </div>

                <div v-if="store.isLoading && configuracionesFiltradas.length === 0" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                    <p>Cargando configuraciones...</p>
                </div>
                <div v-else-if="!store.isLoading && configuracionesFiltradas.length === 0" class="empty-state">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p>No hay configuraciones</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)" />
                    </div>

                    <div v-for="data in mobilePagedConfiguraciones" :key="data.id" class="sinc-card">
                        <div class="sinc-card-header">
                            <div class="sinc-card-header-left">
                                <span class="font-semibold text-primary">{{ data.departamento }}</span>
                                <span class="id-badge">#{{ data.id }}</span>
                            </div>
                            <div class="toggle-cell">
                                <ToggleSwitch
                                    :modelValue="data.esActivo"
                                    @update:modelValue="() => toggleActivo(data)"
                                    :disabled="store.isLoading"
                                />
                            </div>
                        </div>

                        <div class="sinc-card-body">
                            <div class="sinc-card-row">
                                <span class="sinc-label">Tipo Docto</span>
                                <span class="sinc-value">{{ data.tipoDocumento?.nombre || '-' }}</span>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Intervalo</span>
                                <div class="interval-cell">
                                    <i class="pi pi-clock interval-icon" />
                                    <span>{{ data.intervaloMinutos }} min</span>
                                </div>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Prioridad</span>
                                <span :class="['prioridad-badge', `prioridad-${data.prioridad?.toLowerCase()}`]">
                                    <i :class="prioridadIcono(data.prioridad)" />
                                    {{ data.prioridad }}
                                </span>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Ejecución</span>
                                <span :class="['ejecucion-badge', data.enEjecucion ? 'running' : 'idle']">
                                    <i :class="data.enEjecucion ? 'pi pi-spin pi-spinner' : 'pi pi-pause-circle'" />
                                    {{ data.enEjecucion ? 'Corriendo' : 'En espera' }}
                                </span>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Última Ejec.</span>
                                <span class="preorden-value">{{ formatFecha(data.ultimaEjecucion) }}</span>
                            </div>
                        </div>

                        <div class="sinc-card-footer">
                            <Button icon="pi pi-pencil" outlined rounded severity="info" size="small" @click="editarItem(data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="confirmarEliminar(data)" />
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

        <!-- ── Dialog Crear / Editar ───────────────────────────────────────── -->
        <Dialog
            v-model:visible="configDialog"
            :style="{ width: '520px' }"
            :breakpoints="{ '1199px': '75vw', '575px': '92vw' }"
            :header="dialogHeader"
            :modal="true"
            class="p-fluid sinc-dialog"
            @hide="cerrarDialog"
        >
            <div class="formgrid grid">
                <!-- Departamento -->
                <div class="field col-12">
                    <label for="departamento">Departamento *</label>
                    <Select
                        id="departamento"
                        v-model="selectedItem.departamento"
                        :options="departamentos"
                        optionLabel="descripcion"
                        placeholder="Selecciona un departamento..."
                        :loading="isDepartamentosLoading"
                        :filter="true"
                        filterPlaceholder="Buscar departamento..."
                        :invalid="submitted && !selectedItem.departamento"
                        class="w-full"
                        autofocus
                    />
                    <small class="p-error" v-if="submitted && !selectedItem.departamento">
                        Debes seleccionar un departamento.
                    </small>
                </div>

                <!-- Tipo Documento -->
                <div class="field col-12">
                    <label for="tipoDocumento">Tipo Documento *</label>
                    <Select
                        id="tipoDocumento"
                        v-model="selectedItem.tipoDocumento"
                        :options="TIPOS_DOCUMENTO"
                        optionLabel="nombre"
                        placeholder="Selecciona el tipo de documento..."
                        :invalid="submitted && !selectedItem.tipoDocumento"
                        class="w-full"
                    />
                    <small class="p-error" v-if="submitted && !selectedItem.tipoDocumento">
                        Debes seleccionar un tipo de documento.
                    </small>
                </div>

                <!-- Intervalo -->
                <div class="field col-12">
                    <label for="intervalo">Intervalo de sincronización (minutos) *</label>
                    <InputNumber
                        id="intervalo"
                        v-model="selectedItem.intervaloMinutos"
                        :min="1"
                        :max="1440"
                        showButtons
                        suffix=" min"
                        :invalid="submitted && (!selectedItem.intervaloMinutos || selectedItem.intervaloMinutos < 1)"
                    />
                    <small class="p-error" v-if="submitted && (!selectedItem.intervaloMinutos || selectedItem.intervaloMinutos < 1)">
                        El intervalo debe ser mínimo 1 minuto.
                    </small>
                    <small class="field-hint">Rango permitido: 1 min – 1440 min (24 horas)</small>
                </div>

                <!-- Prioridad -->
                <div class="field col-12">
                    <label for="prioridad">Prioridad *</label>
                    <Select
                        id="prioridad"
                        v-model="selectedItem.prioridad"
                        :options="PRIORIDADES"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona la prioridad..."
                        class="w-full"
                    >
                        <template #option="{ option }">
                            <div class="prioridad-option">
                                <i :class="prioridadIcono(option.value)" />
                                <span>{{ option.label }}</span>
                            </div>
                        </template>
                        <template #value="{ value }">
                            <div v-if="value" class="prioridad-option">
                                <i :class="prioridadIcono(value)" />
                                <span>{{ PRIORIDADES.find(p => p.value === value)?.label ?? value }}</span>
                            </div>
                            <span v-else>Selecciona la prioridad...</span>
                        </template>
                    </Select>
                </div>

                <!-- Estado Activo -->
                <div class="field col-12">
                    <label>Estado de la sincronización</label>
                    <div class="toggle-form-row">
                        <ToggleSwitch id="form-esActivo" v-model="selectedItem.esActivo" />
                        <span :class="['estado-label-lg', selectedItem.esActivo ? 'activo' : 'inactivo']">
                            {{ selectedItem.esActivo ? 'Sincronización Activa' : 'Sincronización Pausada' }}
                        </span>
                    </div>
                </div>

                <!-- Campos de solo lectura (solo al editar) -->
                <template v-if="isEditing">
                    <div class="field col-12">
                        <div class="readonly-divider">
                            <span>Información de auditoría (solo lectura)</span>
                        </div>
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Fecha de Creación</label>
                        <InputText
                            :value="formatFecha(selectedItem.fechaCreacion)"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Última Modificación</label>
                        <InputText
                            :value="formatFecha(selectedItem.fechaModificacion)"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Última Ejecución</label>
                        <InputText
                            :value="formatFecha(selectedItem.ultimaEjecucion)"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Usuario Modificación</label>
                        <InputText
                            :value="selectedItem.usuarioModificacion || 'Sin registrar'"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>
                </template>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarDialog" />
                <Button
                    :label="isEditing ? 'Actualizar' : 'Guardar'"
                    icon="pi pi-check"
                    :loading="store.isLoading"
                    @click="guardar"
                />
            </template>
        </Dialog>

        <!-- ── Dialog Confirmar Eliminación ───────────────────────────────── -->
        <Dialog
            v-model:visible="deleteDialog"
            :style="{ width: '440px' }"
            header="Confirmar eliminación"
            :modal="true"
        >
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem; color: var(--red-400)" />
                <div class="confirmation-text">
                    <p>
                        ¿Estás seguro de que deseas eliminar la configuración del departamento
                        <strong>{{ selectedItem.departamento }}</strong>?
                    </p>
                    <small class="text-color-secondary">Esta acción no se puede deshacer.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    severity="danger"
                    :loading="store.isLoading"
                    @click="eliminar"
                />
            </template>
        </Dialog>

        <!-- ── Toast & ConfirmDialog globales ─────────────────────────────── -->
        <ConfirmDialog />
    </div>
</template>

<style scoped lang="scss">
/* ── Container ─────────────────────────────────────────────────────────────── */
.sinc-container {
    padding: 1rem;

    @media (min-width: 768px) {
        padding: 1.5rem;
    }
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
.card {
    background: var(--surface-card);
    border-radius: 14px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
}

@media screen and (max-width: 768px) {
    .card-header {
        justify-content: center;
    }
    .card-header > .header-text {
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
        width: 100% !important;
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

    /* Toolbar responsive */
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

.sinc-icon {
    color: var(--primary-color);
    font-size: 1.5rem;
}

.subtitle {
    font-size: 0.93rem;
    color: var(--text-color-secondary);
    margin: 0.3rem 0 0 2.1rem;
}

/* ── Stats Banner ──────────────────────────────────────────────────────────── */
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

    &.stat-activa {
        color: var(--green-500);
    }

    &.stat-inactiva {
        color: var(--orange-400);
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

/* ── Table ─────────────────────────────────────────────────────────────────── */
.sinc-table {
    :deep(.p-datatable-header) {
        background: transparent;
        border: none;
    }
}

/* ── Cells ─────────────────────────────────────────────────────────────────── */
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

.interval-cell {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-color);
}

.interval-icon {
    color: var(--primary-color);
    font-size: 0.9rem;
}

.fecha-text {
    font-size: 0.9rem;
    color: var(--text-color);

    &.text-secondary {
        color: var(--text-color-secondary);
    }
}

/* ── Toggle ─────────────────────────────────────────────────────────────────── */
.toggle-cell {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.estado-label {
    font-size: 0.82rem;
    font-weight: 600;

    &.activo {
        color: var(--green-500);
    }

    &.inactivo {
        color: var(--orange-400);
    }
}

/* ── Action Buttons ─────────────────────────────────────────────────────────── */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

/* ── Empty / Loading states ─────────────────────────────────────────────────── */
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

/* ── Toolbar ─────────────────────────────────────────────────────────────────── */
:deep(.p-toolbar) {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
}

/* ── Dialog Form ─────────────────────────────────────────────────────────────── */
.sinc-dialog {
    .formgrid {
        display: flex;
        flex-wrap: wrap;
        margin: -0.5rem;
    }

    .field {
        padding: 0.5rem;
        margin-bottom: 0.75rem;
        display: flex;
        flex-direction: column;

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--text-color);
        }
    }

    .col-12 {
        width: 100%;
    }

    @media (min-width: 768px) {
        .md\:col-6 {
            width: 50%;
        }
    }
}

.field-hint {
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    margin-top: 0.35rem;
}

/* Toggle dentro del formulario */
.toggle-form-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
    border: 1px solid var(--surface-200);
}

.estado-label-lg {
    font-size: 0.95rem;
    font-weight: 600;

    &.activo {
        color: var(--green-500);
    }

    &.inactivo {
        color: var(--orange-400);
    }
}

/* Campos readonly */
.p-readonly {
    background: var(--surface-100) !important;
    color: var(--text-color-secondary) !important;
    cursor: default;
    opacity: 0.85;
}

/* Separador de auditoría */
.readonly-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-color-secondary);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0.5rem 0 0.25rem;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--surface-200);
    }
}

/* ── Confirmation Dialog ─────────────────────────────────────────────────────── */
.confirmation-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0.5rem;
}

.confirmation-text {
    p {
        margin: 0 0 0.4rem;
        line-height: 1.5;
    }
}

/* ── Prioridad Badge ─────────────────────────────────────────────────────────── */
.prioridad-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.75rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;

    &.prioridad-alta {
        background: color-mix(in srgb, var(--red-500) 12%, transparent);
        color: var(--red-500);
        border: 1px solid color-mix(in srgb, var(--red-500) 30%, transparent);
    }

    &.prioridad-media {
        background: color-mix(in srgb, var(--orange-400) 12%, transparent);
        color: var(--orange-500);
        border: 1px solid color-mix(in srgb, var(--orange-400) 30%, transparent);
    }

    &.prioridad-baja {
        background: color-mix(in srgb, var(--blue-400) 12%, transparent);
        color: var(--blue-500);
        border: 1px solid color-mix(in srgb, var(--blue-400) 30%, transparent);
    }
}

/* ── En Ejecución Badge ──────────────────────────────────────────────────────── */
.ejecucion-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.75rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;

    &.running {
        background: color-mix(in srgb, var(--green-500) 14%, transparent);
        color: var(--green-600);
        border: 1px solid color-mix(in srgb, var(--green-500) 30%, transparent);
    }

    &.idle {
        background: var(--surface-100);
        color: var(--text-color-secondary);
        border: 1px solid var(--surface-200);
    }
}

/* ── Error Badges ────────────────────────────────────────────────────────────── */
.error-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: var(--red-500);
    cursor: help;

    i { flex-shrink: 0; }
}

.no-error-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.82rem;
    color: var(--green-500);
}

/* ── Prioridad Option (select dropdown) ─────────────────────────────────────── */
.prioridad-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.ml-2 { margin-left: 0.5rem; }
.text-primary { color: var(--primary-color); }

/* Mobile actions bar */
.mobile-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
}

/* Sinc Card mobile */
.sinc-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.sinc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--surface-200);
    background: color-mix(in srgb, var(--primary-color) 4%, var(--surface-card));
    gap: 0.5rem;
}

.sinc-card-header-left {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.sinc-card-body {
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.sinc-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    gap: 0.5rem;
}

.sinc-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
}

.sinc-value {
    color: var(--text-color);
    font-size: 0.88rem;
    text-align: right;
    word-break: break-word;
}

.sinc-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    border-top: 1px solid var(--surface-200);
    background: var(--surface-50);
}
</style>

