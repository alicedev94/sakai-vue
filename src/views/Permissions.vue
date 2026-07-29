<script setup>
import { usePermissionStore } from '@/stores/permission';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const toast = useToast();
const permissionStore = usePermissionStore();
const permissionDialog = ref(false);
const deletePermissionDialog = ref(false);
const permission = ref({});
const submitted = ref(false);
const selectedPermissions = ref([]);
const searchQuery = ref('');

const canWrite = computed(() => {
    const perm = authStore.permissions.find((p) => p.code === 'permisos');
    return perm ? !perm.isReadonly : false;
});

// Paginado móvil
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 8;

const activePermissions = computed(() => {
    return permissionStore.permissions.filter(
        (p) =>
            !p.deletedAt &&
            p.status !== false &&
            (!searchQuery.value || p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.code?.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.url?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
});

const mobilePagedPermissions = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return activePermissions.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() => Math.ceil(activePermissions.value.length / mobileRowsPerPage));

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

const loadPermissions = async () => {
    try {
        await permissionStore.loadPermissions();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al cargar permisos', life: 3000 });
    }
};

const openNew = () => {
    permission.value = { name: '', code: '', url: '', categoryLabel: '', label: '', icon: '', to: '' };
    submitted.value = false;
    permissionDialog.value = true;
};

const hideDialog = () => {
    permissionDialog.value = false;
    submitted.value = false;
};

const editPermission = (permData) => {
    permission.value = { ...permData };
    permissionDialog.value = true;
};

const confirmDeletePermission = (permData) => {
    permission.value = permData;
    deletePermissionDialog.value = true;
};

const isSaveDisabled = computed(() => {
    return (
        !permission.value.name?.trim() || !permission.value.code?.trim() || !permission.value.url?.trim() || !permission.value.categoryLabel?.trim() || !permission.value.label?.trim() || !permission.value.icon?.trim() || !permission.value.to?.trim()
    );
});

const savePermission = async () => {
    submitted.value = true;
    if (isSaveDisabled.value) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa todos los campos obligatorios', life: 3000 });
        return;
    }
    try {
        if (permission.value.id) {
            await permissionStore.updatePermission(permission.value.id, permission.value);
            toast.add({ severity: 'success', summary: 'Permiso actualizado', detail: 'Datos actualizados', life: 3000 });
        } else {
            await permissionStore.createPermission(permission.value);
            toast.add({ severity: 'success', summary: 'Permiso creado', detail: 'El permiso se ha creado', life: 3000 });
        }
        permissionDialog.value = false;
        permission.value = {};
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al guardar el permiso', life: 3000 });
    }
};

const deletePermission = async () => {
    try {
        await permissionStore.softDeletePermission(permission.value.id);
        deletePermissionDialog.value = false;
        permission.value = {};
        toast.add({ severity: 'success', summary: 'Permiso eliminado', detail: 'El permiso ha sido eliminado', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al eliminar el permiso', life: 3000 });
    }
};

onMounted(() => {
    loadPermissions();
});
</script>

<template>
    <div class="permissions-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">Gestión de Permisos</h2>
                    <p class="subtitle">Administra los permisos del sistema</p>
                </div>
                <!-- Solo visible en desktop -->
                <div class="hidden md:block">
                    <Button label="Nuevo Permiso" icon="pi pi-plus" class="p-button-success" @click="openNew" :disabled="!canWrite" />
                </div>
            </div>

            <!-- Toolbar -->
            <Toolbar class="mb-6 toolbar-responsive">
                <template #start>
                    <!-- Mobile: botón Nuevo Permiso centrado -->
                    <div class="block md:hidden w-full">
                        <Button label="Nuevo Permiso" icon="pi pi-plus" class="w-full" @click="openNew" :disabled="!canWrite" />
                    </div>
                </template>
                <template #end>
                    <IconField class="w-full md:w-auto">
                        <InputIcon><i class="pi pi-search" /></InputIcon>
                        <InputText v-model="searchQuery" placeholder="Buscar por nombre, código o URL..." class="w-full" style="min-width: 0" @input="resetMobilePage" />
                    </IconField>
                </template>
            </Toolbar>

            <!-- Tabla (Desktop) -->
            <DataTable
                class="hidden md:block permissions-table"
                :value="activePermissions"
                :loading="permissionStore.loading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
                responsiveLayout="scroll"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-lock" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                        <p>No hay permisos disponibles</p>
                    </div>
                </template>

                <Column field="id" header="ID" :sortable="true" style="min-width: 4rem">
                    <template #body="{ data }">
                        <span class="id-badge">{{ data.id }}</span>
                    </template>
                </Column>
                <Column field="categoryLabel" header="Categoría" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span>{{ data.categoryLabel }}</span>
                    </template>
                </Column>
                <Column field="label" header="Etiqueta" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ data.label }}</span>
                    </template>
                </Column>
                <Column field="to" header="Destino" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span class="dest-badge">{{ data.to }}</span>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPermission(data)" v-tooltip.top="'Editar'" :disabled="!canWrite" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePermission(data)" v-tooltip.top="'Eliminar'" :disabled="!canWrite" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <div v-if="permissionStore.loading && activePermissions.length === 0" class="loading-state">
                    <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-color)" />
                    <p>Cargando permisos...</p>
                </div>
                <div v-else-if="!permissionStore.loading && activePermissions.length === 0" class="empty-state">
                    <i class="pi pi-lock" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p>No hay permisos disponibles</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="permissionStore.loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: var(--primary-color)" />
                    </div>

                    <div v-for="data in mobilePagedPermissions" :key="data.id" class="perm-card">
                        <!-- Cabecera -->
                        <div class="perm-card-header">
                            <div class="perm-card-title-wrap">
                                <div class="perm-card-icon-label">
                                    <i :class="data.icon" class="perm-card-icon" />
                                    <span class="perm-card-label-text">{{ data.label }}</span>
                                </div>
                                <span class="perm-card-category">{{ data.categoryLabel }}</span>
                            </div>
                            <span class="id-badge">{{ data.id }}</span>
                        </div>

                        <!-- Body -->
                        <div class="perm-card-body">
                            <div class="perm-card-row">
                                <span class="perm-card-field-label">Nombre</span>
                                <span class="perm-card-value">{{ data.name || '—' }}</span>
                            </div>
                            <div class="perm-card-row">
                                <span class="perm-card-field-label">Código</span>
                                <span class="id-badge code-badge">{{ data.code }}</span>
                            </div>
                            <div class="perm-card-row">
                                <span class="perm-card-field-label">Destino</span>
                                <span class="dest-badge">{{ data.to }}</span>
                            </div>
                            <div class="perm-card-row perm-card-row--col">
                                <span class="perm-card-field-label">URL</span>
                                <span class="perm-url">{{ data.url }}</span>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="perm-card-footer">
                            <Button icon="pi pi-pencil" outlined rounded severity="info" v-tooltip.top="'Editar'" @click="editPermission(data)" :disabled="!canWrite" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmDeletePermission(data)" :disabled="!canWrite" />
                        </div>
                    </div>

                    <!-- Paginador móvil -->
                    <div v-if="mobileTotalPages > 1" class="flex justify-center items-center gap-3 mt-2">
                        <Button icon="pi pi-chevron-left" outlined rounded size="small" :disabled="mobileCurrentPage === 0" @click="mobileCurrentPage--" />
                        <span class="text-sm" style="color: var(--text-color-secondary)"> Página {{ mobileCurrentPage + 1 }} de {{ mobileTotalPages }} </span>
                        <Button icon="pi pi-chevron-right" outlined rounded size="small" :disabled="mobileCurrentPage >= mobileTotalPages - 1" @click="mobileCurrentPage++" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog: Crear/Editar Permiso -->
        <Dialog v-model:visible="permissionDialog" :style="{ width: '650px' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" header="Información del Permiso" :modal="true" class="p-fluid">
            <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                    <label for="name">be_Nombre *</label>
                    <InputText id="name" v-model.trim="permission.name" required autofocus :invalid="submitted && !permission.name" placeholder="Nombre del permiso" />
                    <small class="p-error" v-if="submitted && !permission.name">El nombre es requerido.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="code">be_Código *</label>
                    <InputText id="code" v-model.trim="permission.code" required :invalid="submitted && !permission.code" placeholder="Código único del permiso" />
                    <small class="p-error" v-if="submitted && !permission.code">El código es requerido.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="url">be_URL *</label>
                    <InputText id="url" v-model.trim="permission.url" required :invalid="submitted && !permission.url" placeholder="/v1/api/test/**" />
                    <small class="p-error" v-if="submitted && !permission.url">La URL es requerida.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="categoryLabel">fe_Categoría *</label>
                    <InputText id="categoryLabel" v-model.trim="permission.categoryLabel" required :invalid="submitted && !permission.categoryLabel" placeholder="Categoría del permiso" />
                    <small class="p-error" v-if="submitted && !permission.categoryLabel">La categoría es requerida.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="label">fe_Etiqueta *</label>
                    <InputText id="label" v-model.trim="permission.label" required :invalid="submitted && !permission.label" placeholder="Etiqueta del permiso" />
                    <small class="p-error" v-if="submitted && !permission.label">La etiqueta es requerida.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="icon">fe_Ícono *</label>
                    <InputText id="icon" v-model.trim="permission.icon" required :invalid="submitted && !permission.icon" placeholder="pi pi-fw pi-home" />
                    <small class="p-error" v-if="submitted && !permission.icon">El ícono es requerido.</small>
                </div>
                <div class="field col-12">
                    <label for="to">fe_Destino *</label>
                    <InputText id="to" v-model.trim="permission.to" required :invalid="submitted && !permission.to" placeholder="/v1/test" />
                    <small class="p-error" v-if="submitted && !permission.to">El destino es requerido.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="savePermission" :disabled="isSaveDisabled || !canWrite" />
            </template>
        </Dialog>

        <!-- Dialog: Confirmar eliminación -->
        <Dialog v-model:visible="deletePermissionDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
                <span v-if="permission"
                    >¿Estás seguro de que deseas eliminar el permiso <b>{{ permission.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deletePermissionDialog = false" />
                <Button label="Eliminar" icon="pi pi-check" severity="danger" @click="deletePermission" :disabled="!canWrite" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped lang="scss">
.permissions-container {
    padding: 1rem;
    @media (min-width: 768px) {
        padding: 1.5rem;
    }
}

.card {
    background: var(--surface-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
}

.title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-color);
}

.subtitle {
    font-size: 0.95rem;
    color: var(--text-color-secondary);
    margin: 0.25rem 0 0 0;
}

/* Toolbar responsive */
:deep(.p-toolbar) {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
}

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
    :deep(.toolbar-responsive .p-toolbar-end .p-iconfield) {
        width: 100%;
    }
    :deep(.toolbar-responsive .p-toolbar-end .p-iconfield input) {
        width: 100%;
    }
}

.permissions-table {
    :deep(.p-datatable-header) {
        background: transparent;
        border: none;
    }
}

/* Badges */
.id-badge {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
}

.code-badge {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
    font-family: monospace;
    letter-spacing: 0.04em;
}

.dest-badge {
    background: color-mix(in srgb, var(--green-500) 12%, transparent);
    color: var(--green-700);
    border: 1px solid color-mix(in srgb, var(--green-500) 25%, transparent);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
}

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
        margin-top: 1rem;
        font-size: 1.1rem;
    }
}

.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    span {
        line-height: 1.6;
    }
}

/* Cards mobile */
.perm-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.perm-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem;
    border-bottom: 1px solid var(--surface-200);
    gap: 0.5rem;
    background: color-mix(in srgb, var(--primary-color) 4%, var(--surface-card));
}

.perm-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
}

.perm-card-icon-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.perm-card-icon {
    color: var(--primary-color);
    font-size: 1rem;
    flex-shrink: 0;
}

.perm-card-label-text {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-color);
    word-break: break-word;
}

.perm-card-category {
    font-size: 0.78rem;
    color: var(--text-color-secondary);
    font-style: italic;
    padding-left: 1.5rem; /* alinea con el texto después del ícono */
}

.perm-card-body {
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.perm-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;

    &--col {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }
}

.perm-card-field-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
}

.perm-card-value {
    color: var(--text-color);
    font-size: 0.9rem;
    text-align: right;
    word-break: break-all;
}

.perm-url {
    color: var(--text-color-secondary);
    font-size: 0.82rem;
    font-family: monospace;
    word-break: break-all;
}

.perm-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--surface-200);
    background: var(--surface-50);
}

/* Form grid */
.field {
    margin-bottom: 1.5rem;
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-color);
    }
}
.formgrid {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.5rem;
    margin-left: -0.5rem;
    margin-top: -0.5rem;
}
.formgrid > .field {
    padding: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}
.formgrid .field input {
    width: 100%;
}
.col-12 {
    flex: 0 0 auto;
    width: 100%;
}
@media (min-width: 768px) {
    .md\:col-6 {
        flex: 0 0 auto;
        width: 50%;
    }
}
</style>
