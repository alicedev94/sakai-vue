<script setup>
import PermissionService from '@/service/PermissionService';
import { useRoleStore } from '@/stores/role';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const toast = useToast();
const roleStore = useRoleStore();
const permissions = ref([]);
const roleDialog = ref(false);
const deleteRoleDialog = ref(false);
const role = ref({ permissions: [] });
const submitted = ref(false);
const selectedRoles = ref([]);
const searchQuery = ref('');

const canWrite = computed(() => {
    const perm = authStore.permissions.find((p) => p.code === 'roles');
    return perm ? !perm.isReadonly : false;
});

// Paginado móvil
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 8;

const activeRoles = computed(() => {
    return roleStore.roles.filter((r) => !r.deletedAt && r.status !== false && (!searchQuery.value || r.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || r.code?.toLowerCase().includes(searchQuery.value.toLowerCase())));
});

const mobilePagedRoles = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return activeRoles.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() => Math.ceil(activeRoles.value.length / mobileRowsPerPage));

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

const loadRoles = async () => {
    try {
        await roleStore.loadRoles();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al cargar roles', life: 3000 });
    }
};

const loadPermissions = async () => {
    try {
        const data = await PermissionService.getPermissions();
        permissions.value = Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al cargar permisos', life: 3000 });
    }
};

const openNew = () => {
    role.value = { name: '', code: '', permissions: [] };
    submitted.value = false;
    roleDialog.value = true;
};

const hideDialog = () => {
    roleDialog.value = false;
    submitted.value = false;
};

const editRole = (roleData) => {
    role.value = JSON.parse(JSON.stringify(roleData));
    roleDialog.value = true;
};

const confirmDeleteRole = (roleData) => {
    role.value = roleData;
    deleteRoleDialog.value = true;
};

const saveRole = async () => {
    submitted.value = true;
    if (!role.value.name?.trim() || !role.value.code?.trim()) {
        toast.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa todos los campos obligatorios', life: 3000 });
        return;
    }
    try {
        const rolePayload = {
            id: role.value.id,
            name: role.value.name.trim(),
            code: role.value.code.trim(),
            permissionsId: role.value.permissions.map((p) => p.id)
        };
        if (role.value.id) {
            await roleStore.updateRole(role.value.id, rolePayload);
            toast.add({ severity: 'success', summary: 'Rol actualizado', detail: 'Datos actualizados', life: 3000 });
        } else {
            await roleStore.createRole(rolePayload);
            toast.add({ severity: 'success', summary: 'Rol creado', detail: 'El rol se ha creado', life: 3000 });
        }
        roleDialog.value = false;
        role.value = { permissions: [] };
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al guardar el rol', life: 3000 });
    }
};

const deleteRole = async () => {
    try {
        await roleStore.softDeleteRole(role.value.id);
        deleteRoleDialog.value = false;
        role.value = { permissions: [] };
        toast.add({ severity: 'success', summary: 'Rol eliminado', detail: 'El rol ha sido eliminado', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.userMessage || 'Error al eliminar el rol', life: 3000 });
    }
};

const isSaveDisabled = computed(() => {
    return !role.value.name?.trim() || !role.value.code?.trim();
});

onMounted(() => {
    loadRoles();
    loadPermissions();
});
</script>

<template>
    <div class="roles-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">Gestión de Roles</h2>
                    <p class="subtitle">Administra los roles y permisos del sistema</p>
                </div>
                <!-- Botón solo visible en desktop -->
                <div class="hidden md:block">
                    <Button label="Nuevo Rol" icon="pi pi-plus" class="p-button-success" @click="openNew" :disabled="!canWrite" />
                </div>
            </div>

            <!-- Toolbar -->
            <Toolbar class="mb-6 toolbar-responsive">
                <template #start>
                    <!-- Mobile: botón Nuevo Rol centrado -->
                    <div class="block md:hidden w-full">
                        <Button label="Nuevo Rol" icon="pi pi-plus" class="w-full" @click="openNew" :disabled="!canWrite" />
                    </div>
                </template>
                <template #end>
                    <IconField class="w-full md:w-auto">
                        <InputIcon><i class="pi pi-search" /></InputIcon>
                        <InputText v-model="searchQuery" placeholder="Buscar por nombre o código..." class="w-full" style="min-width: 0" @input="resetMobilePage" />
                    </IconField>
                </template>
            </Toolbar>

            <!-- Tabla (Desktop) -->
            <DataTable
                class="hidden md:block roles-table"
                :value="activeRoles"
                :loading="roleStore.loading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
                responsiveLayout="scroll"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-id-card" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                        <p>No hay roles disponibles</p>
                    </div>
                </template>

                <Column field="id" header="ID" :sortable="true" style="min-width: 4rem">
                    <template #body="{ data }">
                        <span class="id-badge">{{ data.id }}</span>
                    </template>
                </Column>
                <Column field="name" header="Nombre" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ data.name }}</span>
                    </template>
                </Column>
                <Column field="code" header="Código" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span class="id-badge code-badge">{{ data.code }}</span>
                    </template>
                </Column>
                <Column field="permissions" header="Permisos" style="min-width: 16rem">
                    <template #body="{ data }">
                        <ul v-if="data.permissions && data.permissions.length" class="perms-list">
                            <li v-for="perm in data.permissions" :key="perm.id || perm.code">
                                <span class="perm-name">{{ perm.name }}</span>
                                <!-- <span class="perm-code">({{ perm.code }})</span>
                                <span class="perm-url">- {{ perm.url }}</span> -->
                            </li>
                        </ul>
                        <span v-else class="text-color-secondary">Sin permisos</span>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRole(data)" v-tooltip.top="'Editar'" :disabled="!canWrite" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteRole(data)" v-tooltip.top="'Eliminar'" :disabled="!canWrite" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <div v-if="roleStore.loading && activeRoles.length === 0" class="loading-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-spin pi-spinner text-primary mb-3" style="font-size: 2rem" />
                    <p class="text-secondary m-0">Cargando roles...</p>
                </div>
                <div v-else-if="!roleStore.loading && activeRoles.length === 0" class="empty-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-id-card mb-3" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p class="text-secondary m-0">No hay roles disponibles</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="roleStore.loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner text-primary" style="font-size: 3rem" />
                    </div>

                    <div v-for="data in mobilePagedRoles" :key="data.id" class="role-card">
                        <!-- Cabecera -->
                        <div class="role-card-header">
                            <div class="role-card-title-wrap">
                                <span class="role-card-name">{{ data.name }}</span>
                                <span class="id-badge code-badge mt-1">{{ data.code }}</span>
                            </div>
                            <span class="id-badge">{{ data.id }}</span>
                        </div>

                        <!-- Permisos -->
                        <div class="role-card-body">
                            <span class="role-card-label">Permisos</span>
                            <div v-if="data.permissions && data.permissions.length" class="perms-chips">
                                <span v-for="perm in data.permissions" :key="perm.id" class="perm-chip">
                                    {{ perm.name }}
                                </span>
                            </div>
                            <span v-else class="role-card-empty">Sin permisos asignados</span>
                        </div>

                        <!-- Acciones -->
                        <div class="role-card-footer">
                            <Button icon="pi pi-pencil" outlined rounded severity="info" v-tooltip.top="'Editar'" @click="editRole(data)" :disabled="!canWrite" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" v-tooltip.top="'Eliminar'" @click="confirmDeleteRole(data)" :disabled="!canWrite" />
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

        <!-- Dialog: Crear/Editar Rol -->
        <Dialog v-model:visible="roleDialog" :style="{ width: '650px' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" header="Información del Rol" :modal="true" class="p-fluid">
            <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                    <label for="name">Nombre *</label>
                    <InputText id="name" v-model.trim="role.name" required autofocus :invalid="submitted && !role.name" placeholder="Nombre del rol" />
                    <small class="p-error" v-if="submitted && !role.name">El nombre es requerido.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="code">Código *</label>
                    <InputText id="code" v-model.trim="role.code" required :invalid="submitted && !role.code" placeholder="Código único del rol" />
                    <small class="p-error" v-if="submitted && !role.code">El código es requerido.</small>
                </div>
                <div class="field col-12">
                    <label>Permisos</label>
                    <MultiSelect v-model="role.permissions" :options="permissions" optionLabel="name" dataKey="id" placeholder="Selecciona uno o más permisos" display="chip" :filter="true" :showClear="true" :maxSelectedLabels="3" class="w-full">
                        <template #option="{ option }">
                            <span
                                >{{ option.name }} <span class="perm-code">({{ option.code }})</span> <span class="perm-url">- {{ option.url }}</span></span
                            >
                        </template>
                        <template #chip="{ value }">
                            <span>{{ value.name }}</span>
                        </template>
                    </MultiSelect>
                    <small class="p-error" v-if="submitted && (!role.permissions || !role.permissions.length)">Selecciona al menos un permiso.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveRole" :disabled="isSaveDisabled || !canWrite" />
            </template>
        </Dialog>

        <!-- Dialog: Confirmar eliminación -->
        <Dialog v-model:visible="deleteRoleDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
                <span v-if="role"
                    >¿Estás seguro de que deseas eliminar el rol <b>{{ role.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deleteRoleDialog = false" />
                <Button label="Eliminar" icon="pi pi-check" severity="danger" @click="deleteRole" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped lang="scss">
.roles-container {
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

.roles-table {
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
}

.code-badge {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
    font-family: monospace;
    letter-spacing: 0.04em;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

/* Permisos en tabla */
.perms-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.perm-name {
    font-weight: 500;
}
.perm-code {
    color: var(--primary-color);
    margin-left: 0.4rem;
    font-size: 0.88em;
}
.perm-url {
    color: var(--text-color-secondary);
    margin-left: 0.4rem;
    font-size: 0.88em;
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
.role-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.role-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem;
    border-bottom: 1px solid var(--surface-200);
    gap: 0.5rem;
}

.role-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
}

.role-card-name {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-color);
    word-break: break-word;
}

.role-card-body {
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.role-card-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.role-card-empty {
    font-size: 0.88rem;
    color: var(--text-color-secondary);
    font-style: italic;
}

.perms-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.perm-chip {
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 25%, transparent);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 600;
}

.role-card-footer {
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
