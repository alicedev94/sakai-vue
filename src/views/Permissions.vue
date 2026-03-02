<script setup>
import { usePermissionStore } from '@/stores/permission';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const permissionStore = usePermissionStore();
const permissionDialog = ref(false);
const deletePermissionDialog = ref(false);
const permission = ref({});
const submitted = ref(false);
const selectedPermissions = ref([]);
const searchQuery = ref('');

const activePermissions = computed(() => {
    return permissionStore.permissions.filter(p => !p.deletedAt && p.status !== false &&
        (!searchQuery.value || p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.code?.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.url?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
});

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
    return !permission.value.name?.trim() || !permission.value.code?.trim() || !permission.value.url?.trim() ||
           !permission.value.categoryLabel?.trim() || !permission.value.label?.trim() || !permission.value.icon?.trim() || !permission.value.to?.trim();
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
            <div class="card-header">
                <div>
                    <h2 class="title">Gestión de Permisos</h2>
                    <p class="subtitle">Administra los permisos del sistema</p>
                </div>
                <Button label="Nuevo Permiso" icon="pi pi-plus" class="p-button-success" @click="openNew" />
            </div>
            <Toolbar class="mb-6">
                <template #end>
                    <InputText v-model="searchQuery" placeholder="Buscar por nombre, código o URL..." style="width: 300px" />
                </template>
            </Toolbar>
            <DataTable :value="activePermissions" :loading="permissionStore.loading" dataKey="id" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25, 50]" responsiveLayout="scroll" class="permissions-table">
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
                <Column field="name" header="be_Nombre" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ data.name }}</span>
                    </template>
                </Column>
                <Column field="code" header="be_Código" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span>{{ data.code }}</span>
                    </template>
                </Column>
                <Column field="url" header="be_URL" :sortable="true" style="min-width: 14rem">
                    <template #body="{ data }">
                        <span class="perm-url">{{ data.url }}</span>
                    </template>
                </Column>
                <Column field="categoryLabel" header="fe_Categoría" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span>{{ data.categoryLabel }}</span>
                    </template>
                </Column>
                <Column field="label" header="fe_Etiqueta" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span>{{ data.label }}</span>
                    </template>
                </Column>
                <Column field="icon" header="fe_Ícono" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span>{{ data.icon }}</span>
                    </template>
                </Column>
                <Column field="to" header="fe_Destino" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <span>{{ data.to }}</span>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPermission(data)" v-tooltip.top="'Editar'" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePermission(data)" v-tooltip.top="'Eliminar'" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
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
                <Button label="Guardar" icon="pi pi-check" @click="savePermission" :disabled="isSaveDisabled" />
            </template>
        </Dialog>
        <Dialog v-model:visible="deletePermissionDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
                <span v-if="permission">¿Estás seguro de que deseas eliminar el permiso <b>{{ permission.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deletePermissionDialog = false" />
                <Button label="Eliminar" icon="pi pi-check" severity="danger" @click="deletePermission" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped lang="scss">
.permissions-container {
    padding: 1rem;
    @media (min-width: 768px) { padding: 1.5rem; }
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
.permissions-table {
    :deep(.p-datatable-header) { background: transparent; border: none; }
}
.id-badge {
    background: var(--surface-100);
    color: var(--text-color);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
}
.action-buttons {
    display: flex;
    gap: 0.5rem;
}
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
    p { margin-top: 1rem; font-size: 1.1rem; }
}
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    span { line-height: 1.6; }
}
.field { margin-bottom: 1.5rem; label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-color); } }
.perm-url { color: var(--text-color-secondary); font-size: 0.95em; }

/* Clases para el grid a 2 columnas del formulario */
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
