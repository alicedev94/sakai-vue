<script setup>
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
    intervaloMinutos: 30
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

const mobileTotalPages = computed(() =>
    Math.ceil(gruposFiltrados.value.length / mobileRowsPerPage)
);

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

const filteredSincronizaciones = computed(() => {
    let list = sincStore.configuraciones;
    const currentGroupId = selectedItem.value.id;

    // Filtrar para mostrar únicamente las sincronizaciones que pertenecen al grupo actual
    list = list.filter(s => s.sincronizacionGroup?.id === currentGroupId);

    list = [...list].sort((a, b) => a.departamento.localeCompare(b.departamento));

    if (sincSearchQuery.value) {
        const q = sincSearchQuery.value.toLowerCase();
        list = list.filter(s => s.departamento.toLowerCase().includes(q));
    }
    return list;
});

const isEditing = computed(() => !!selectedItem.value.id);

const dialogHeader = computed(() =>
    isEditing.value ? 'Editar Grupo' : 'Nuevo Grupo'
);

const seleccionarTodos = () => {
    selectedSincronizaciones.value = filteredSincronizaciones.value.map(s => s.id);
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
const cargarDatos = async () => {
    try {
        await store.fetchGrupos();
        await sincStore.fetchConfiguraciones();
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
    selectedSincronizaciones.value = sincStore.configuraciones
        .filter(s => s.sincronizacionGroup?.id === item.id)
        .map(s => s.id);
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
        sincronizacionesIds: selectedSincronizaciones.value
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
                    <Button
                        id="btn-nuevo-grupo"
                        label="Nuevo Grupo"
                        icon="pi pi-plus"
                        class="p-button-success"
                        @click="abrirNuevo"
                    />
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
                        <Button
                            id="btn-refrescar"
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            v-tooltip.top="'Actualizar'"
                            :loading="store.isLoading"
                            @click="cargarDatos"
                        />
                        <Button
                            label="Regresar"
                            icon="pi pi-arrow-left"
                            severity="secondary"
                            outlined
                            @click="$router.push('/v1/sincronizacion')"
                        />
                    </div>
                    <div class="block md:hidden w-full flex flex-col gap-2">
                        <Button
                            label="Nuevo Grupo"
                            icon="pi pi-plus"
                            class="p-button-success w-full"
                            @click="abrirNuevo"
                        />
                        <Button
                            label="Regresar"
                            icon="pi pi-arrow-left"
                            severity="secondary"
                            class="w-full"
                            outlined
                            @click="$router.push('/v1/sincronizacion')"
                        />
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-end w-full md:w-auto flex flex-col md:flex-row gap-2">
                        <IconField class="w-full md:w-auto">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText
                                id="sinc-search"
                                v-model="searchQuery"
                                placeholder="Buscar grupo..."
                                class="w-full"
                                @input="resetMobilePage"
                            />
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
                                <ToggleSwitch
                                    :modelValue="data.esActivo"
                                    @update:modelValue="() => toggleActivo(data)"
                                    :disabled="store.isLoading"
                                />
                            </div>
                        </div>

                        <div class="sinc-card-body">
                            <div class="sinc-card-row" style="flex-direction: column; align-items: flex-start; text-align: left;">
                                <span class="sinc-label">Descripción</span>
                                <span class="sinc-value" style="text-align: left;">{{ data.descripcion }}</span>
                            </div>
                            <div class="sinc-card-row">
                                <span class="sinc-label">Creado</span>
                                <span class="sinc-value">{{ formatFecha(data.fechaCreacion) }}</span>
                            </div>
                        </div>

                        <div class="sinc-card-footer">
                            <Button icon="pi pi-pencil" outlined rounded severity="info" size="small" @click="editarItem(data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" size="small" @click="confirmarEliminar(data)" />
                        </div>
                    </div>

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
                <div class="field col-12">
                    <label for="nombre">Nombre *</label>
                    <InputText
                        id="nombre"
                        v-model="selectedItem.nombre"
                        placeholder="Ingresa el nombre del grupo..."
                        :invalid="submitted && !selectedItem.nombre"
                        class="w-full"
                        autofocus
                    />
                    <small class="p-error" v-if="submitted && !selectedItem.nombre">
                        El nombre es obligatorio.
                    </small>
                </div>

                <div class="field col-12">
                    <label for="descripcion">Descripción</label>
                    <Textarea
                        id="descripcion"
                        v-model="selectedItem.descripcion"
                        rows="3"
                        placeholder="Descripción opcional..."
                        class="w-full"
                    />
                </div>

                <div class="field col-12">
                    <label for="intervaloMinutos">Temporalidad (Minutos) *</label>
                    <InputNumber
                        id="intervaloMinutos"
                        v-model="selectedItem.intervaloMinutos"
                        placeholder="Intervalo en minutos..."
                        :min="1"
                        :max="1440"
                        class="w-full"
                        :invalid="submitted && !selectedItem.intervaloMinutos"
                    />
                    <small class="p-error" v-if="submitted && !selectedItem.intervaloMinutos">
                        La temporalidad es obligatoria.
                    </small>
                </div>

                <div class="field col-12">
                    <label class="font-bold mb-2 block">Sincronizaciones Asociadas al Grupo</label>
                    <div class="sinc-selector-container">
                        <div class="flex justify-between items-center mb-2 gap-2 flex-wrap" style="display: flex; justify-content: space-between; align-items: center;">
                            <IconField class="flex-1 min-w-[200px]" style="flex: 1;">
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText
                                    v-model="sincSearchQuery"
                                    placeholder="Filtrar sincronizaciones..."
                                    class="w-full p-inputtext-sm"
                                />
                            </IconField>
                            <div class="flex gap-1" style="display: flex; gap: 0.25rem;">
                                <Button
                                    label="Todos"
                                    icon="pi pi-check-square"
                                    severity="secondary"
                                    text
                                    size="small"
                                    @click="seleccionarTodos"
                                    v-tooltip.top="'Seleccionar todos'"
                                />
                                <Button
                                    label="Ninguno"
                                    icon="pi pi-minus-square"
                                    severity="secondary"
                                    text
                                    size="small"
                                    @click="deseleccionarTodos"
                                    v-tooltip.top="'Deseleccionar todos'"
                                />
                            </div>
                        </div>
                        <div class="sinc-scroll-list">
                            <div v-for="s in filteredSincronizaciones" :key="s.id" class="sinc-checkbox-item">
                                <Checkbox
                                    v-model="selectedSincronizaciones"
                                    :inputId="`sinc-chk-${s.id}`"
                                    :name="`sinc-group`"
                                    :value="s.id"
                                />
                                <label :for="`sinc-chk-${s.id}`" class="sinc-checkbox-label ml-2">
                                    <span class="depto-name">{{ s.departamento }}</span>
                                    <span :class="['group-badge', s.sincronizacionGroup ? 'custom-group' : 'general-group']">
                                        {{ s.sincronizacionGroup ? s.sincronizacionGroup.nombre : 'General' }}
                                    </span>
                                </label>
                            </div>
                            <div v-if="filteredSincronizaciones.length === 0" class="p-3 text-center text-secondary text-sm">
                                No se encontraron sincronizaciones
                            </div>
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
                        <InputText
                            :value="formatFecha(selectedItem.fechaCreacion)"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>

                    <div class="field col-12 md:col-6">
                        <label>Fecha de Actualización</label>
                        <InputText
                            :value="formatFecha(selectedItem.fechaActualizacion)"
                            readonly
                            class="p-readonly"
                            tabindex="-1"
                        />
                    </div>

                    <div class="field col-12 md:col-12">
                        <label>Usuario Modificación</label>
                        <InputText
                            :value="selectedItem.usuarioActualizacion || 'Sin registrar'"
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
                        ¿Estás seguro de que deseas eliminar el grupo
                        <strong>{{ selectedItem.nombre }}</strong>?
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
</style>
