<script setup>
import { sincronizacionService } from '@/service/SincronizacionService';
import { useAuthStore } from '@/stores/auth';
import { useSincronizacionStore } from '@/stores/sincronizacion';
import { useSincronizacionGroupStore } from '@/stores/sincronizacionGroup';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// ─── Composables ──────────────────────────────────────────────────────────────
const toast = useToast();
const confirm = useConfirm();
const store = useSincronizacionGroupStore();
const sincStore = useSincronizacionStore();
const authStore = useAuthStore();

const canWrite = computed(() => {
    const perm = authStore.permissions.find((p) => p.code === 'sincronizacion');
    return perm ? !perm.isReadonly : false;
});

// ─── State de la vista ────────────────────────────────────────────────────────
const configDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const selectedItem = ref({});
const searchQuery = ref('');
const selectedSincronizaciones = ref([]);
const sincSearchQuery = ref('');

// ─── Paginado móvil ──────────────────────────────────────────────────────────
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 6;

const FORM_DEFAULTS = {
    nombre: '',
    descripcion: '',
    esActivo: true,
    intervaloMinutos: 30,
    prioridad: 'MEDIA'
};

// ─── Filtros de búsqueda ─────────────────────────────────────────────────────
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// ─── Computed ─────────────────────────────────────────────────────────────────
const gruposFiltrados = computed(() => {
    let result = store.grupos;
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter((g) => g.nombre?.toLowerCase().includes(q) || g.descripcion?.toLowerCase().includes(q));
    }
    return result;
});

const mobilePagedGrupos = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return gruposFiltrados.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() => Math.ceil(gruposFiltrados.value.length / mobileRowsPerPage));

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

const filteredSincronizaciones = computed(() => {
    let list = sincStore.configuraciones;
    const currentGroupId = selectedItem.value.id;

    // Filtrar para mostrar únicamente las sincronizaciones que pertenecen al grupo actual
    list = list.filter((s) => s.sincronizacionGroup?.id === currentGroupId);

    list = [...list].sort((a, b) => a.departamento.localeCompare(b.departamento));

    if (sincSearchQuery.value) {
        const q = sincSearchQuery.value.toLowerCase();
        list = list.filter((s) => s.departamento.toLowerCase().includes(q));
    }
    return list;
});

const isEditing = computed(() => !!selectedItem.value.id);

const dialogHeader = computed(() => (isEditing.value ? 'Editar Grupo' : 'Nuevo Grupo'));

const seleccionarTodos = () => {
    selectedSincronizaciones.value = filteredSincronizaciones.value.map((s) => s.id);
};

const deseleccionarTodos = () => {
    selectedSincronizaciones.value = [];
};

// ─── Helpers de formato ───────────────────────────────────────────────────────
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

// ─── Acciones CRUD ────────────────────────────────────────────────────────────
const refreshSelectedGroup = () => {
    if (selectedGroupForSincList.value?.id) {
        const updated = store.grupos.find((g) => g.id === selectedGroupForSincList.value.id);
        if (updated) {
            selectedGroupForSincList.value = updated;
        }
    }
};

const cargarDatos = async () => {
    try {
        await store.fetchGrupos();
        await sincStore.fetchConfiguraciones();
        refreshSelectedGroup();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: err.userMessage || 'No se pudieron cargar los grupos',
            life: 5000
        });
    }
};

const abrirNuevo = () => {
    selectedItem.value = { ...FORM_DEFAULTS };
    selectedSincronizaciones.value = [];
    sincSearchQuery.value = '';
    submitted.value = false;
    configDialog.value = true;
};

const editarItem = (item) => {
    selectedItem.value = { ...item };
    selectedSincronizaciones.value = sincStore.configuraciones.filter((s) => s.sincronizacionGroup?.id === item.id).map((s) => s.id);

    // Asignar prioridad basada en la primera sincronización asociada o 'MEDIA'
    const associatedSyncs = sincStore.configuraciones.filter((s) => s.sincronizacionGroup?.id === item.id);
    selectedItem.value.prioridad = associatedSyncs.length > 0 ? (associatedSyncs[0].prioridad ?? 'MEDIA') : 'MEDIA';

    sincSearchQuery.value = '';
    submitted.value = false;
    configDialog.value = true;
};

const cerrarDialog = () => {
    configDialog.value = false;
    submitted.value = false;
    selectedItem.value = {};
};

const ejecutarGuardar = async (payload) => {
    try {
        if (isEditing.value) {
            await store.actualizarGrupo(selectedItem.value.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: `El grupo "${payload.nombre}" fue actualizado`,
                life: 3000
            });
        } else {
            await store.crearGrupo(payload);
            toast.add({
                severity: 'success',
                summary: 'Creado',
                detail: `El grupo "${payload.nombre}" fue creado`,
                life: 3000
            });
        }

        // Recargar los datos de los stores para sincronizar el estado
        await sincStore.fetchConfiguraciones();
        await store.fetchGrupos();
        refreshSelectedGroup();

        cerrarDialog();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo guardar el grupo',
            life: 5000
        });
    }
};

const guardar = async () => {
    submitted.value = true;

    if (!selectedItem.value.nombre?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'El nombre es obligatorio',
            life: 3000
        });
        return;
    }

    const payload = {
        nombre: selectedItem.value.nombre.trim(),
        descripcion: selectedItem.value.descripcion?.trim() || '',
        esActivo: selectedItem.value.esActivo ?? true,
        intervaloMinutos: selectedItem.value.intervaloMinutos ?? 30,
        sincronizacionesIds: selectedSincronizaciones.value,
        prioridad: selectedItem.value.prioridad || 'MEDIA'
    };

    await ejecutarGuardar(payload);
};

const confirmarEliminar = (item) => {
    selectedItem.value = item;
    deleteDialog.value = true;
};

const eliminar = async () => {
    try {
        await store.eliminarGrupo(selectedItem.value.id);
        deleteDialog.value = false;
        selectedItem.value = {};
        toast.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'El grupo fue eliminado correctamente',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo eliminar el grupo',
            life: 5000
        });
    }
};

const toggleActivo = async (item) => {
    const nuevoEstado = !item.esActivo;

    // Cambiar estado visualmente de inmediato
    store.toggleActivoOptimista(item.id, nuevoEstado);

    if (!nuevoEstado) {
        confirm.require({
            message: `¿Está seguro de que deseas inactivar todos los registros del grupo "${item.nombre}"?`,
            header: 'Confirmar inactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, inactivar',
            rejectLabel: 'Cancelar',
            acceptClass: 'p-button-danger',
            accept: async () => {
                await ejecutarPeticionToggle(item, false);
            },
            reject: () => {
                // Revertir el estado visual si el usuario cancela la confirmación
                store.toggleActivoOptimista(item.id, true);
            }
        });
    } else {
        await ejecutarPeticionToggle(item, true);
    }
};

const ejecutarPeticionToggle = async (item, nuevoEstado) => {
    try {
        await store.actualizarGrupo(item.id, {
            nombre: item.nombre,
            descripcion: item.descripcion,
            esActivo: nuevoEstado
        });
        toast.add({
            severity: 'info',
            summary: nuevoEstado ? 'Activado' : 'Desactivado',
            detail: `Grupo "${item.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'}`,
            life: 2500
        });

        // Recargar los datos de los stores para sincronizar el estado
        await store.fetchGrupos();
        await sincStore.fetchConfiguraciones();
        refreshSelectedGroup();
    } catch (err) {
        // Revertir si la petición falla
        store.toggleActivoOptimista(item.id, !nuevoEstado);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo cambiar el estado',
            life: 4000
        });
    }
};

// ─── State de Sincronizaciones (Anidadas) ──────────────────────────────────
const sincListDialog = ref(false);
const sincConfigDialog = ref(false);
const sincDeleteDialog = ref(false);
const sincSubmitted = ref(false);
const selectedSinc = ref({});
const selectedGroupForSincList = ref({});
const sincTableSearchQuery = ref('');
const sincMobileCurrentPage = ref(0);
const sincMobileRowsPerPage = 6;
const departamentos = ref([]);
const isDepartamentosLoading = ref(false);

const PRIORIDADES = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja', value: 'BAJA' }
];

const TIPOS_DOCUMENTO = [
    { id: 1, nombre: 'Orden' },
    { id: 2, nombre: 'PreOrden' }
];

const SINC_FORM_DEFAULTS = {
    departamento: null,
    intervaloMinutos: 5,
    esActivo: true,
    prioridad: 'MEDIA',
    tipoDocumento: null,
    sincronizacionGroup: null
};

const prioridadIcono = (prioridad) => {
    const map = {
        ALTA: 'pi pi-arrow-up-right',
        MEDIA: 'pi pi-minus',
        BAJA: 'pi pi-arrow-down-right'
    };
    return map[prioridad] ?? 'pi pi-minus';
};

const sincronizacionesDelGrupo = computed(() => {
    if (!selectedGroupForSincList.value?.id) return [];
    let list = sincStore.configuraciones.filter((s) => s.sincronizacionGroup?.id === selectedGroupForSincList.value.id);
    if (sincTableSearchQuery.value) {
        const q = sincTableSearchQuery.value.toLowerCase();
        list = list.filter((s) => s.departamento?.toLowerCase().includes(q));
    }
    return list;
});

const sincMobilePagedConfiguraciones = computed(() => {
    const start = sincMobileCurrentPage.value * sincMobileRowsPerPage;
    return sincronizacionesDelGrupo.value.slice(start, start + sincMobileRowsPerPage);
});

const sincMobileTotalPages = computed(() => Math.ceil(sincronizacionesDelGrupo.value.length / sincMobileRowsPerPage));

function resetSincMobilePage() {
    sincMobileCurrentPage.value = 0;
}

const fetchDepartamentos = async () => {
    if (departamentos.value.length > 0) return;
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

const verSincronizaciones = (grupo) => {
    selectedGroupForSincList.value = grupo;
    resetSincMobilePage();
    sincTableSearchQuery.value = '';
    sincListDialog.value = true;
};

const abrirNuevaSinc = () => {
    selectedSinc.value = {
        ...SINC_FORM_DEFAULTS,
        sincronizacionGroup: selectedGroupForSincList.value
    };
    sincSubmitted.value = false;
    fetchDepartamentos();
    sincConfigDialog.value = true;
};

const editarSincItem = (item) => {
    fetchDepartamentos().then(() => {
        const deptObj = departamentos.value.find((d) => d.descripcion === item.departamento);
        selectedSinc.value = {
            ...item,
            departamento: deptObj ?? item.departamento,
            prioridad: item.prioridad ?? 'MEDIA',
            tipoDocumento: item.tipoDocumento ?? null,
            sincronizacionGroup: item.sincronizacionGroup ?? selectedGroupForSincList.value
        };
    });
    sincSubmitted.value = false;
    sincConfigDialog.value = true;
};

const cerrarSincConfigDialog = () => {
    sincConfigDialog.value = false;
    sincSubmitted.value = false;
    selectedSinc.value = {};
};

const guardarSinc = async () => {
    sincSubmitted.value = true;

    const deptValor = typeof selectedSinc.value.departamento === 'object' ? selectedSinc.value.departamento?.descripcion : selectedSinc.value.departamento;

    if (!deptValor?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'Debes seleccionar un departamento',
            life: 3000
        });
        return;
    }

    if (!selectedSinc.value.intervaloMinutos || selectedSinc.value.intervaloMinutos < 1) {
        toast.add({
            severity: 'warn',
            summary: 'Campo inválido',
            detail: 'El intervalo debe ser al menos 1 minuto',
            life: 3000
        });
        return;
    }

    if (!selectedSinc.value.tipoDocumento) {
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
        intervaloMinutos: Number(selectedSinc.value.intervaloMinutos),
        esActivo: selectedSinc.value.esActivo ?? true,
        prioridad: selectedSinc.value.prioridad ?? 'MEDIA',
        tipoDocumento: selectedSinc.value.tipoDocumento,
        sincronizacionGroup: selectedSinc.value.sincronizacionGroup
    };

    try {
        const isEditingSinc = !!selectedSinc.value.id;
        if (isEditingSinc) {
            await sincStore.actualizarConfiguracion(selectedSinc.value.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: `La configuración de "${payload.departamento}" fue actualizada`,
                life: 3000
            });
        } else {
            await sincStore.crearConfiguracion(payload);
            toast.add({
                severity: 'success',
                summary: 'Creado',
                detail: `La configuración de "${payload.departamento}" fue creada`,
                life: 3000
            });
        }

        // Recargar grupos en el store para asegurar consistencia
        await store.fetchGrupos();
        await sincStore.fetchConfiguraciones();
        refreshSelectedGroup();

        cerrarSincConfigDialog();
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.userMessage || 'No se pudo guardar la configuración',
            life: 5000
        });
    }
};

const confirmarEliminarSinc = (item) => {
    selectedSinc.value = item;
    sincDeleteDialog.value = true;
};

const eliminarSinc = async () => {
    try {
        await sincStore.eliminarConfiguracion(selectedSinc.value.id);
        sincDeleteDialog.value = false;
        selectedSinc.value = {};

        // Recargar grupos en el store para asegurar consistencia
        await store.fetchGrupos();
        await sincStore.fetchConfiguraciones();
        refreshSelectedGroup();

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

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
    cargarDatos();
});
</script>

<template>
    <div class="sinc-container">
        <div class="card">
            <!-- ── Header ──────────────────────────────────────────────────── -->
            <div class="card-header">
                <div class="header-text">
                    <h2 class="title">Grupos de Sincronización</h2>
                    <p class="subtitle">Gestión de grupos para sincronizaciones</p>
                </div>
                <div class="hidden md:block">
                    <Button id="btn-nuevo-grupo" label="Nuevo Grupo" icon="pi pi-plus" class="p-button-success" @click="abrirNuevo" :disabled="!canWrite" />
                </div>
            </div>

            <!-- ── Stats banner ────────────────────────────────────────────── -->
            <div class="stats-banner">
                <div class="stat-item">
                    <span class="stat-value">{{ store.totalGrupos }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-activa">{{ store.gruposActivos.length }}</span>
                    <span class="stat-label">Activos</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value stat-inactiva">{{ store.totalGrupos - store.gruposActivos.length }}</span>
                    <span class="stat-label">Inactivos</span>
                </div>
            </div>

            <!-- ── Toolbar de búsqueda ─────────────────────────────────────── -->
            <Toolbar class="mb-5 toolbar-responsive">
                <template #start>
                    <div class="hidden md:flex gap-2">
                        <Button id="btn-refrescar" label="Actualizar" severity="secondary" outlined v-tooltip.top="'Actualizar'" :loading="store.isLoading" @click="cargarDatos" />
                    </div>
                    <div class="block md:hidden w-full flex flex-col gap-2">
                        <Button label="Nuevo Grupo" icon="pi pi-plus" class="p-button-success w-full" @click="abrirNuevo" :disabled="!canWrite" />
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-end w-full md:w-auto flex flex-col md:flex-row gap-2">
                        <IconField class="w-full md:w-auto">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText id="sinc-search" v-model="searchQuery" placeholder="Buscar grupo..." class="w-full" @input="resetMobilePage" />
                        </IconField>
                    </div>
                </template>
            </Toolbar>

            <!-- ── Tabla principal (Desktop) ─────────────────────────────────── -->
            <DataTable
                :value="gruposFiltrados"
                :loading="store.isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} grupos"
                responsiveLayout="scroll"
                stripedRows
                class="sinc-table hidden md:block"
                v-model:filters="filters"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                        <p>No hay grupos de sincronización</p>
                        <Button label="Crear primer grupo" icon="pi pi-plus" text @click="abrirNuevo" />
                    </div>
                </template>

                <template #loading>
                    <div class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                        <p>Cargando grupos...</p>
                    </div>
                </template>

                <Column field="id" header="ID" :sortable="true" style="min-width: 5rem">
                    <template #body="{ data }">
                        <span class="id-badge">#{{ data.id }}</span>
                    </template>
                </Column>

                <Column field="nombre" header="Nombre" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ data.nombre }}</span>
                    </template>
                </Column>

                <Column field="descripcion" header="Descripción" :sortable="true" style="min-width: 15rem">
                    <template #body="{ data }">
                        <span>{{ data.descripcion }}</span>
                    </template>
                </Column>

                <Column field="fechaCreacion" header="Creado" :sortable="true" style="min-width: 11rem">
                    <template #body="{ data }">
                        <span class="fecha-text text-secondary">{{ formatFecha(data.fechaCreacion) }}</span>
                    </template>
                </Column>

                <Column field="esActivo" header="Estado" :sortable="true" style="min-width: 9rem">
                    <template #body="{ data }">
                        <div class="toggle-cell">
                            <ToggleSwitch :id="`toggle-sinc-${data.id}`" :modelValue="data.esActivo" @update:modelValue="() => toggleActivo(data)" :disabled="store.isLoading || !canWrite" />
                            <span :class="['estado-label', data.esActivo ? 'activo' : 'inactivo']">
                                {{ data.esActivo ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 12rem" header="Acciones">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button :id="`btn-listado-${data.id}`" icon="pi pi-list" outlined rounded severity="info" @click="verSincronizaciones(data)" v-tooltip.top="'Ver Sincronizaciones'" />
                            <Button :id="`btn-editar-${data.id}`" icon="pi pi-pencil" outlined rounded @click="editarItem(data)" v-tooltip.top="'Editar'" :disabled="!canWrite" />
                            <Button :id="`btn-eliminar-${data.id}`" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmarEliminar(data)" v-tooltip.top="'Eliminar'" :disabled="!canWrite" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- ── Vista Cards (Mobile) ────────────────────────────────────── -->
            <div class="block md:hidden">
                <div class="mobile-actions">
                    <Button severity="secondary" outlined size="small" class="w-full" :loading="store.isLoading" @click="cargarDatos" label="Actualizar" />
                </div>

                <div v-if="store.isLoading && gruposFiltrados.length === 0" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                    <p>Cargando grupos...</p>
                </div>
                <div v-else-if="!store.isLoading && gruposFiltrados.length === 0" class="empty-state">
                    <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p>No hay grupos</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="store.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)" />
                    </div>

                    <div v-for="data in mobilePagedGrupos" :key="data.id" class="sinc-card">
                        <div class="sinc-card-header">
                            <div class="sinc-card-header-left">
                                <span class="font-semibold text-primary">{{ data.nombre }}</span>
                                <span class="id-badge">#{{ data.id }}</span>
                            </div>
                            <div class="toggle-cell">
                                <ToggleSwitch :modelValue="data.esActivo" @update:modelValue="() => toggleActivo(data)" :disabled="store.isLoading || !canWrite" />
                            </div>
                        </div>

                        <div class="sinc-card-body">
                            <div class="sinc-card-row" style="flex-direction: column; align-items: flex-start; text-align: left">
                                <span class="sinc-label">Descripción</span>
                                <span class="sinc-value" style="text-align: left">{{ data.descripcion }}</span>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Creado</span>
                                <span class="sinc-value">{{ formatFecha(data.fechaCreacion) }}</span>
                            </div>
                        </div>

                        <div class="sinc-card-footer">
                            <Button icon="pi pi-list" outlined rounded severity="secondary" size="small" @click="verSincronizaciones(data)" v-tooltip.top="'Ver Sincronizaciones'" />
                            <Button icon="pi pi-pencil" outlined rounded severity="info" size="small" @click="editarItem(data)" :disabled="!canWrite" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="confirmarEliminar(data)" :disabled="!canWrite" />
                        </div>
                    </div>

                    <div v-if="mobileTotalPages > 1" class="flex justify-center items-center gap-3 mt-2">
                        <Button icon="pi pi-chevron-left" outlined rounded size="small" :disabled="mobileCurrentPage === 0" @click="mobileCurrentPage--" />
                        <span class="text-sm" style="color: var(--text-color-secondary)"> Página {{ mobileCurrentPage + 1 }} de {{ mobileTotalPages }} </span>
                        <Button icon="pi pi-chevron-right" outlined rounded size="small" :disabled="mobileCurrentPage >= mobileTotalPages - 1" @click="mobileCurrentPage++" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Dialog Crear / Editar ───────────────────────────────────────── -->
        <Dialog v-model:visible="configDialog" :style="{ width: '520px' }" :breakpoints="{ '1199px': '75vw', '575px': '92vw' }" :header="dialogHeader" :modal="true" class="p-fluid sinc-dialog" @hide="cerrarDialog">
            <div class="formgrid grid">
                <div class="field col-12">
                    <label for="nombre">Nombre *</label>
                    <InputText id="nombre" v-model="selectedItem.nombre" placeholder="Ingresa el nombre del grupo..." :invalid="submitted && !selectedItem.nombre" class="w-full" autofocus />
                    <small class="p-error" v-if="submitted && !selectedItem.nombre"> El nombre es obligatorio. </small>
                </div>

                <div class="field col-12">
                    <label for="descripcion">Descripción</label>
                    <Textarea id="descripcion" v-model="selectedItem.descripcion" rows="3" placeholder="Descripción opcional..." class="w-full" />
                </div>

                <div class="field col-12">
                    <label for="intervaloMinutos">Temporalidad (Minutos) *</label>
                    <InputNumber id="intervaloMinutos" v-model="selectedItem.intervaloMinutos" placeholder="Intervalo en minutos..." :min="1" :max="1440" class="w-full" :invalid="submitted && !selectedItem.intervaloMinutos" />
                    <small class="p-error" v-if="submitted && !selectedItem.intervaloMinutos"> La temporalidad es obligatoria. </small>
                </div>

                <!-- Prioridad del Grupo -->
                <div class="field col-12">
                    <label for="grupo-prioridad">Prioridad del Grupo *</label>
                    <Select id="grupo-prioridad" v-model="selectedItem.prioridad" :options="PRIORIDADES" optionLabel="label" optionValue="value" placeholder="Selecciona la prioridad para el grupo..." class="w-full">
                        <template #option="{ option }">
                            <div class="prioridad-option">
                                <i :class="prioridadIcono(option.value)" />
                                <span>{{ option.label }}</span>
                            </div>
                        </template>
                        <template #value="{ value }">
                            <div v-if="value" class="prioridad-option">
                                <i :class="prioridadIcono(value)" />
                                <span>{{ PRIORIDADES.find((p) => p.value === value)?.label ?? value }}</span>
                            </div>
                            <span v-else>Selecciona la prioridad...</span>
                        </template>
                    </Select>
                </div>

                <div class="field col-12">
                    <label class="font-bold mb-2 block">Sincronizaciones Asociadas al Grupo</label>
                    <div class="sinc-selector-container">
                        <div class="flex justify-between items-center mb-2 gap-2 flex-wrap" style="display: flex; justify-content: space-between; align-items: center">
                            <IconField class="flex-1 min-w-[200px]" style="flex: 1">
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="sincSearchQuery" placeholder="Filtrar sincronizaciones..." class="w-full p-inputtext-sm" />
                            </IconField>
                            <div class="flex gap-1" style="display: flex; gap: 0.25rem">
                                <Button label="Todos" icon="pi pi-check-square" severity="secondary" text size="small" @click="seleccionarTodos" v-tooltip.top="'Seleccionar todos'" :disabled="!canWrite" />
                                <Button label="Ninguno" icon="pi pi-minus-square" severity="secondary" text size="small" @click="deseleccionarTodos" v-tooltip.top="'Deseleccionar todos'" :disabled="!canWrite" />
                            </div>
                        </div>
                        <div class="sinc-scroll-list">
                            <div v-for="s in filteredSincronizaciones" :key="s.id" class="sinc-checkbox-item">
                                <Checkbox v-model="selectedSincronizaciones" :inputId="`sinc-chk-${s.id}`" :name="`sinc-group`" :value="s.id" :disabled="!canWrite" />
                                <label :for="`sinc-chk-${s.id}`" class="sinc-checkbox-label ml-2">
                                    <span class="depto-name">{{ s.departamento }}</span>
                                    <span :class="['group-badge', s.sincronizacionGroup ? 'custom-group' : 'general-group']">
                                        {{ s.sincronizacionGroup ? s.sincronizacionGroup.nombre : 'General' }}
                                    </span>
                                </label>
                            </div>
                            <div v-if="filteredSincronizaciones.length === 0" class="p-3 text-center text-secondary text-sm">No se encontraron sincronizaciones</div>
                        </div>
                    </div>
                </div>

                <template v-if="isEditing">
                    <div class="field col-12">
                        <div class="readonly-divider">
                            <span>Información de auditoría</span>
                        </div>
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Fecha de Creación</label>
                        <InputText :value="formatFecha(selectedItem.fechaCreacion)" readonly class="p-readonly" tabindex="-1" />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Fecha de Actualización</label>
                        <InputText :value="formatFecha(selectedItem.fechaActualizacion)" readonly class="p-readonly" tabindex="-1" />
                    </div>

                    <div class="field col-12 md:col-12">
                        <label>Usuario Modificación</label>
                        <InputText :value="selectedItem.usuarioActualizacion || 'Sin registrar'" readonly class="p-readonly" tabindex="-1" />
                    </div>
                </template>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarDialog" />
                <Button :label="isEditing ? 'Actualizar' : 'Guardar'" icon="pi pi-check" :loading="store.isLoading" @click="guardar" :disabled="!canWrite" />
            </template>
        </Dialog>

        <!-- ── Dialog Confirmar Eliminación ───────────────────────────────── -->
        <Dialog v-model:visible="deleteDialog" :style="{ width: '440px' }" header="Confirmar eliminación" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem; color: var(--red-400)" />
                <div class="confirmation-text">
                    <p>
                        ¿Estás seguro de que deseas eliminar el grupo
                        <strong>{{ selectedItem.nombre }}</strong
                        >?
                    </p>
                    <small class="text-color-secondary">Esta acción no se puede deshacer.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Eliminar" icon="pi pi-trash" severity="danger" :loading="store.isLoading" @click="eliminar" />
            </template>
        </Dialog>

        <!-- ── Dialog Listado de Sincronizaciones del Grupo ─────────────────── -->
        <Dialog v-model:visible="sincListDialog" :style="{ width: '80vw' }" :breakpoints="{ '1199px': '90vw', '575px': '95vw' }" :header="`Sincronizaciones del Grupo: ${selectedGroupForSincList?.nombre || ''}`" :modal="true" class="sinc-list-dialog">
            <div class="p-4">
                <!-- Toolbar del listado -->
                <Toolbar class="mb-4 toolbar-responsive">
                    <template #start>
                        <Button label="Nueva Sincronización" icon="pi pi-plus" class="p-button-success" @click="abrirNuevaSinc" :disabled="!canWrite" />
                    </template>
                    <template #end>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="sincTableSearchQuery" placeholder="Buscar departamento..." @input="resetSincMobilePage" />
                        </IconField>
                    </template>
                </Toolbar>

                <!-- Tabla principal en Desktop -->
                <DataTable
                    :value="sincronizacionesDelGrupo"
                    :loading="sincStore.isLoading"
                    dataKey="id"
                    :paginator="true"
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} sincronizaciones"
                    responsiveLayout="scroll"
                    stripedRows
                    class="sinc-table hidden md:block"
                >
                    <template #empty>
                        <div class="empty-state">
                            <i class="pi pi-inbox" style="font-size: 2.5rem; color: var(--text-color-secondary)" />
                            <p>No hay sincronizaciones asociadas a este grupo</p>
                            <Button label="Crear primera sincronización" icon="pi pi-plus" text @click="abrirNuevaSinc" />
                        </div>
                    </template>

                    <Column field="id" header="ID" :sortable="true" style="min-width: 4rem">
                        <template #body="{ data }">
                            <span class="id-badge">#{{ data.id }}</span>
                        </template>
                    </Column>

                    <Column field="departamento" header="Departamento" :sortable="true" style="min-width: 10rem">
                        <template #body="{ data }">
                            <div class="dept-info">
                                <Avatar :label="data.departamento?.charAt(3).toUpperCase()" shape="circle" class="dept-avatar" />
                                <span class="font-semibold">{{ data.departamento }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="tipoDocumento.nombre" header="Tipo Documento" :sortable="true" style="min-width: 9rem">
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.tipoDocumento?.nombre || '-' }}</span>
                        </template>
                    </Column>

                    <Column field="intervaloMinutos" header="Intervalo" :sortable="true" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="interval-cell">
                                <i class="pi pi-clock interval-icon" />
                                <span>{{ data.intervaloMinutos }} min</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="ultimaEjecucion" header="Última Ejecución" :sortable="true" style="min-width: 11rem">
                        <template #body="{ data }">
                            <span class="fecha-text">{{ formatFecha(data.ultimaEjecucion) }}</span>
                        </template>
                    </Column>

                    <Column field="esActivo" header="Estado" :sortable="true" style="min-width: 8rem">
                        <template #body="{ data }">
                            <div class="toggle-cell">
                                <ToggleSwitch :modelValue="data.esActivo" readonly />
                                <span :class="['estado-label', data.esActivo ? 'activo' : 'inactivo']">
                                    {{ data.esActivo ? 'Activo' : 'Inactivo' }}
                                </span>
                            </div>
                        </template>
                    </Column>

                    <Column field="prioridad" header="Prioridad" :sortable="true" style="min-width: 7rem">
                        <template #body="{ data }">
                            <span :class="['prioridad-badge', `prioridad-${data.prioridad?.toLowerCase()}`]">
                                <i :class="prioridadIcono(data.prioridad)" />
                                {{ data.prioridad }}
                            </span>
                        </template>
                    </Column>

                    <Column field="enEjecucion" header="Ejecución" :sortable="true" style="min-width: 8rem">
                        <template #body="{ data }">
                            <span :class="['ejecucion-badge', data.enEjecucion ? 'running' : 'idle']">
                                <i :class="data.enEjecucion ? 'pi pi-spin pi-spinner' : 'pi pi-pause-circle'" />
                                {{ data.enEjecucion ? 'Corriendo' : 'En espera' }}
                            </span>
                        </template>
                    </Column>

                    <Column :exportable="false" style="min-width: 8rem" header="Acciones">
                        <template #body="{ data }">
                            <div class="action-buttons">
                                <Button icon="pi pi-pencil" outlined rounded @click="editarSincItem(data)" v-tooltip.top="'Editar'" :disabled="!canWrite" />
                                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmarEliminarSinc(data)" v-tooltip.top="'Eliminar'" :disabled="!canWrite" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Cards en Mobile -->
                <div class="block md:hidden">
                    <div v-if="sincStore.isLoading && sincronizacionesDelGrupo.length === 0" class="loading-state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                        <p>Cargando sincronizaciones...</p>
                    </div>
                    <div v-else-if="!sincStore.isLoading && sincronizacionesDelGrupo.length === 0" class="empty-state">
                        <i class="pi pi-inbox" style="font-size: 2.5rem; color: var(--text-color-secondary)" />
                        <p>No hay sincronizaciones</p>
                    </div>
                    <div v-else class="flex flex-col gap-4 relative">
                        <div v-if="sincStore.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                            <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: var(--primary-color)" />
                        </div>

                        <div v-for="data in sincMobilePagedConfiguraciones" :key="data.id" class="sinc-card">
                            <div class="sinc-card-header">
                                <div class="sinc-card-header-left">
                                    <span class="font-semibold text-primary">{{ data.departamento }}</span>
                                    <span class="id-badge">#{{ data.id }}</span>
                                </div>
                                <div class="toggle-cell">
                                    <ToggleSwitch :modelValue="data.esActivo" readonly />
                                </div>
                            </div>

                            <div class="sinc-card-body">
                                <div class="sinc-card-row">
                                    <span class="sinc-label">Tipo Doc</span>
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
                                <Button icon="pi pi-pencil" outlined rounded severity="info" size="small" @click="editarSincItem(data)" :disabled="!canWrite" />
                                <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="confirmarEliminarSinc(data)" :disabled="!canWrite" />
                            </div>
                        </div>

                        <!-- Paginación móvil de sincronizaciones -->
                        <div v-if="sincMobileTotalPages > 1" class="flex justify-center items-center gap-3 mt-2">
                            <Button icon="pi pi-chevron-left" outlined rounded size="small" :disabled="sincMobileCurrentPage === 0" @click="sincMobileCurrentPage--" />
                            <span class="text-sm" style="color: var(--text-color-secondary)"> Página {{ sincMobileCurrentPage + 1 }} de {{ sincMobileTotalPages }} </span>
                            <Button icon="pi pi-chevron-right" outlined rounded size="small" :disabled="sincMobileCurrentPage >= sincMobileTotalPages - 1" @click="sincMobileCurrentPage++" />
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cerrar" icon="pi pi-times" outlined @click="sincListDialog = false" />
            </template>
        </Dialog>

        <!-- ── Dialog Crear / Editar Sincronización ─────────────────────────── -->
        <Dialog
            v-model:visible="sincConfigDialog"
            :style="{ width: '520px' }"
            :breakpoints="{ '1199px': '75vw', '575px': '92vw' }"
            :header="selectedSinc.id ? 'Editar Sincronización' : 'Nueva Sincronización'"
            :modal="true"
            class="p-fluid sinc-dialog"
            @hide="cerrarSincConfigDialog"
        >
            <div class="formgrid grid">
                <!-- Departamento -->
                <div class="field col-12">
                    <label for="sinc-departamento">Departamento *</label>
                    <Select
                        id="sinc-departamento"
                        v-model="selectedSinc.departamento"
                        :options="departamentos"
                        optionLabel="descripcion"
                        placeholder="Selecciona un departamento..."
                        :loading="isDepartamentosLoading"
                        :filter="true"
                        filterPlaceholder="Buscar departamento..."
                        :invalid="sincSubmitted && !selectedSinc.departamento"
                        class="w-full"
                        autofocus
                    />
                    <small class="p-error" v-if="sincSubmitted && !selectedSinc.departamento"> Debes seleccionar un departamento. </small>
                </div>

                <!-- Tipo Documento -->
                <div class="field col-12">
                    <label for="sinc-tipoDocumento">Tipo Documento *</label>
                    <Select
                        id="sinc-tipoDocumento"
                        v-model="selectedSinc.tipoDocumento"
                        :options="TIPOS_DOCUMENTO"
                        optionLabel="nombre"
                        dataKey="id"
                        placeholder="Selecciona el tipo de documento..."
                        :invalid="sincSubmitted && !selectedSinc.tipoDocumento"
                        class="w-full"
                    />
                    <small class="p-error" v-if="sincSubmitted && !selectedSinc.tipoDocumento"> Debes seleccionar un tipo de documento. </small>
                </div>

                <!-- Grupo de Sincronización (Solo lectura / Preseleccionado) -->
                <div class="field col-12">
                    <label for="sinc-grupo">Grupo de Sincronización</label>
                    <InputText id="sinc-grupo" :value="selectedGroupForSincList?.nombre || 'Sin grupo'" readonly class="p-readonly" tabindex="-1" />
                </div>

                <!-- Intervalo -->
                <div class="field col-12">
                    <label for="sinc-intervalo">Intervalo de sincronización (minutos) *</label>
                    <InputNumber id="sinc-intervalo" v-model="selectedSinc.intervaloMinutos" :min="1" :max="1440" showButtons suffix=" min" :invalid="sincSubmitted && (!selectedSinc.intervaloMinutos || selectedSinc.intervaloMinutos < 1)" />
                    <small class="p-error" v-if="sincSubmitted && (!selectedSinc.intervaloMinutos || selectedSinc.intervaloMinutos < 1)"> El intervalo debe ser mínimo 1 minuto. </small>
                    <small class="field-hint">Rango permitido: 1 min – 1440 min (24 horas)</small>
                </div>

                <!-- Prioridad -->
                <div class="field col-12">
                    <label for="sinc-prioridad">Prioridad *</label>
                    <Select id="sinc-prioridad" v-model="selectedSinc.prioridad" :options="PRIORIDADES" optionLabel="label" optionValue="value" placeholder="Selecciona la prioridad..." class="w-full">
                        <template #option="{ option }">
                            <div class="prioridad-option">
                                <i :class="prioridadIcono(option.value)" />
                                <span>{{ option.label }}</span>
                            </div>
                        </template>
                        <template #value="{ value }">
                            <div v-if="value" class="prioridad-option">
                                <i :class="prioridadIcono(value)" />
                                <span>{{ PRIORIDADES.find((p) => p.value === value)?.label ?? value }}</span>
                            </div>
                            <span v-else>Selecciona la prioridad...</span>
                        </template>
                    </Select>
                </div>

                <!-- Campos de auditoría (solo al editar) -->
                <template v-if="selectedSinc.id">
                    <div class="field col-12">
                        <div class="readonly-divider">
                            <span>Información de auditoría (solo lectura)</span>
                        </div>
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Fecha de Creación</label>
                        <InputText :value="formatFecha(selectedSinc.fechaCreacion)" readonly class="p-readonly" tabindex="-1" />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Última Modificación</label>
                        <InputText :value="formatFecha(selectedSinc.fechaModificacion)" readonly class="p-readonly" tabindex="-1" />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Última Ejecución</label>
                        <InputText :value="formatFecha(selectedSinc.ultimaEjecucion)" readonly class="p-readonly" tabindex="-1" />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Usuario Modificación</label>
                        <InputText :value="selectedSinc.usuarioModificacion || 'Sin registrar'" readonly class="p-readonly" tabindex="-1" />
                    </div>
                </template>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarSincConfigDialog" />
                <Button :label="selectedSinc.id ? 'Actualizar' : 'Guardar'" icon="pi pi-check" :loading="sincStore.isLoading" @click="guardarSinc" :disabled="!canWrite" />
            </template>
        </Dialog>

        <!-- ── Dialog Confirmar Eliminación Sincronización ──────────────────── -->
        <Dialog v-model:visible="sincDeleteDialog" :style="{ width: '440px' }" header="Confirmar eliminación" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle" style="font-size: 2.5rem; color: var(--red-400)" />
                <div class="confirmation-text">
                    <p>
                        ¿Estás seguro de que deseas eliminar la configuración del departamento
                        <strong>{{ selectedSinc.departamento }}</strong
                        >?
                    </p>
                    <small class="text-color-secondary">Esta acción no se puede deshacer.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="sincDeleteDialog = false" />
                <Button label="Eliminar" icon="pi pi-trash" severity="danger" :loading="sincStore.isLoading" @click="eliminarSinc" />
            </template>
        </Dialog>

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

.subtitle {
    font-size: 0.93rem;
    color: var(--text-color-secondary);
    margin: 0.3rem 0 0 0;
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

.id-badge {
    background: var(--surface-100);
    color: var(--text-color-secondary);
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.82rem;
    font-family: monospace;
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

.p-readonly {
    background: var(--surface-100) !important;
    color: var(--text-color-secondary) !important;
    cursor: default;
    opacity: 0.85;
}

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

.sinc-selector-container {
    border: 1px solid var(--surface-300);
    border-radius: 8px;
    padding: 0.75rem;
    background: var(--surface-card);
}

.sinc-scroll-list {
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid var(--surface-200);
    border-radius: 6px;
    padding: 0.5rem;
    background: var(--surface-50);
}

.sinc-checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--surface-100);
    }
}

.sinc-checkbox-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    font-size: 0.9rem;
}

.depto-name {
    font-weight: 500;
    color: var(--text-color);
}

.group-badge {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-weight: 600;

    &.custom-group {
        background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-card));
        color: var(--primary-color);
        border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-card));
    }

    &.general-group {
        background: var(--surface-200);
        color: var(--text-color-secondary);
        border: 1px solid var(--surface-300);
    }
}

/* ── Estilos Agregados para Sincronizaciones ───────────────────────────────── */
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

.prioridad-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
