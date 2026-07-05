<script setup>
import RoleService from '@/service/RoleService';
import UserStatusService from '@/service/UserStatusService';
import { useUserStore } from '@/stores/user';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();
const userStore = useUserStore();

const canWrite = computed(() => {
    const perm = authStore.permissions.find(p => p.code === 'usuarios');
    return perm ? !perm.isReadonly : false;
});

// Estados
const roles = ref([]);
const userStatus = ref([]);
const loading = ref(false);
const selectedUsers = ref([]);
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const user = ref({});
const submitted = ref(false);

// Filtros
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const searchQuery = ref('');

// Paginado móvil
const mobileCurrentPage = ref(0);
const mobileRowsPerPage = 8;

// Usuarios filtrados (excluye los eliminados lógicamente)
const activeUsers = computed(() => {
    return userStore.users.filter(user => {
        const isActive = user.status !== false && !user.deletedAt;
        if (searchQuery.value) {
            const search = searchQuery.value.toLowerCase();
            const matchesSearch =
                (user.username?.toLowerCase().includes(search)) ||
                (user.email?.toLowerCase().includes(search));
            return isActive && matchesSearch;
        }
        return isActive;
    });
});

const mobilePagedUsers = computed(() => {
    const start = mobileCurrentPage.value * mobileRowsPerPage;
    return activeUsers.value.slice(start, start + mobileRowsPerPage);
});

const mobileTotalPages = computed(() => Math.ceil(activeUsers.value.length / mobileRowsPerPage));

function resetMobilePage() {
    mobileCurrentPage.value = 0;
}

// Cargar usuarios
const loadUsers = async () => {
    try {
        await userStore.loadUsers();

        // Solo mostrar mensaje de éxito si hay datos
        if (userStore.users.length > 0) {
            toast.add({
                severity: 'success',
                summary: 'Datos cargados',
                detail: `${userStore.users.length} usuario(s) obtenidos`,
                life: 2000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: error.userMessage || 'Error al cargar usuarios',
            life: 5000
        });
    }
};

// Cargar estatus de los usuarios para asignar a los usuarios (si es necesario)
const loadUserStatus = async () => {
    loading.value = true;
    try {
        const data = await UserStatusService.getUserStatus();
        userStatus.value = Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Error al cargar los estatus de los usuarios:', error);

        // Mensajes más específicos según el tipo de error
        let errorMessage = 'Error al cargar los estatus usuarios';
        let errorSeverity = 'error';

        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
            errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté funcionando.';
            errorSeverity = 'warn';
        } else if (error.response?.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.userMessage) {
            errorMessage = error.userMessage;
        }

        toast.add({
            severity: errorSeverity,
            summary: 'Error de conexión',
            detail: errorMessage,
            life: 5000
        });

        // Si es error de red, no limpiar la lista (mantener estado anterior)
        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
            roles.value = [];
        }
    } finally {
        loading.value = false;
    }
};

// Cargar roles para asignar a los usuarios (si es necesario)
const loadRoles = async () => {
    loading.value = true;
    try {
        const data = await RoleService.getRoles();
        roles.value = Array.isArray(data) ? data : data.content || [];
    } catch (error) {
        console.error('Error al cargar roles:', error);

        // Mensajes más específicos según el tipo de error
        let errorMessage = 'Error al cargar roles';
        let errorSeverity = 'error';

        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
            errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté funcionando.';
            errorSeverity = 'warn';
        } else if (error.response?.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.userMessage) {
            errorMessage = error.userMessage;
        }

        toast.add({
            severity: errorSeverity,
            summary: 'Error de conexión',
            detail: errorMessage,
            life: 5000
        });

        // Si es error de red, no limpiar la lista (mantener estado anterior)
        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
            roles.value = [];
        }
    } finally {
        loading.value = false;
    }
};

// Abrir diálogo para nuevo usuario
const openNew = () => {
    user.value = {
        nombre: '',
        email: '',
        password: '',
        status: null
    };
    submitted.value = false;
    userDialog.value = true;
};

// Ocultar diálogo
const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

// Template para mostrar el nombre del rol
const roleItemTemplate = (option) => {
    return option && option.name ? option.name : '';
};

// Template para mostrar el nombre del status
const statusItemTemplate = (option) => {
    return option && option.name ? option.name : '';
};

// Editar usuario
const editUser = (userData) => {
    user.value = { ...userData };
    userDialog.value = true;
};

// Confirmar eliminación
const confirmDeleteUser = (userData) => {
    user.value = userData;
    deleteUserDialog.value = true;
};

// Guardar usuario (crear o actualizar)
const saveUser = async () => {
    submitted.value = true;
    if (!user.value.username?.trim() || !user.value.email?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor completa todos los campos obligatorios',
            life: 3000
        });
        return;
    }
    // Solo enviar los atributos necesarios al backend
    const userPayload = {
        username: user.value.username,
        email: user.value.email,
        statusId: user.value.status.id,
        roleId: user.value.role.id,
        password: user.value.password
    };
    try {
        if (user.value.id) {
            // Actualizar
            await userStore.updateUser(user.value.id, userPayload);
            toast.add({
                severity: 'success',
                summary: 'Usuario actualizado',
                detail: 'Los datos se han actualizado correctamente',
                life: 3000
            });
        } else {
            // Crear
            await userStore.createUser(userPayload);
            toast.add({
                severity: 'success',
                summary: 'Usuario creado',
                detail: 'El usuario se ha creado correctamente',
                life: 3000
            });
        }

        userDialog.value = false;
        user.value = {};
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Error al guardar el usuario',
            life: 3000
        });
    }
};

// Eliminar usuario (eliminado lógico)
const deleteUser = async () => {
    try {
        await userStore.softDeleteUser(user.value.id);

        deleteUserDialog.value = false;
        user.value = {};

        toast.add({
            severity: 'success',
            summary: 'Usuario eliminado',
            detail: 'El usuario ha sido eliminado correctamente',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Error al eliminar el usuario',
            life: 3000
        });
    }
};

// Confirmación para eliminar múltiples
const confirmDeleteSelected = () => {
    confirm.require({
        message: '¿Estás seguro de eliminar los usuarios seleccionados?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        accept: async () => {
            try {
                for (const selectedUser of selectedUsers.value) {
                    await userStore.softDeleteUser(selectedUser.id);
                }
                selectedUsers.value = [];
                toast.add({
                    severity: 'success',
                    summary: 'Usuarios eliminados',
                    detail: 'Los usuarios han sido eliminados correctamente',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar algunos usuarios',
                    life: 3000
                });
            }
        }
    });
};

// Formatear fecha
const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Cargar usuarios al montar
onMounted(() => {
    loadUsers();
    loadRoles();
    loadUserStatus();
});
</script>

<template>
    <div class="users-container">
        <div class="card">
            <!-- Header -->
            <div class="card-header">
                <div>
                    <h2 class="title">Gestión de Usuarios</h2>
                    <p class="subtitle">Administra los usuarios del sistema</p>
                </div>
                <div class="hidden md:block">
                    <Button label="Nuevo Usuario" icon="pi pi-plus" class="p-button-success" @click="openNew" :disabled="!canWrite" />
                </div>
            </div>

            <!-- Toolbar de búsqueda y acciones -->
            <Toolbar class="mb-6 toolbar-responsive">
                <template #start>
                    <!-- Desktop: solo botón eliminar -->
                    <div class="hidden md:block">
                        <Button
                            label="Eliminar"
                            icon="pi pi-trash"
                            severity="danger"
                            @click="confirmDeleteSelected"
                            :disabled="!selectedUsers || !selectedUsers.length || !canWrite"
                        />
                    </div>
                    <!-- Mobile: botón Nuevo Usuario -->
                    <div class="block md:hidden w-full">
                        <Button
                            label="Nuevo Usuario"
                            icon="pi pi-plus"
                            class="w-full"
                            @click="openNew"
                            :disabled="!canWrite"
                        />
                    </div>
                </template>
                <template #end>
                    <IconField class="w-full md:w-auto">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText
                            v-model="searchQuery"
                            placeholder="Buscar por nombre o email..."
                            class="w-full"
                            style="min-width: 0;"
                            @input="resetMobilePage"
                        />
                    </IconField>
                </template>
            </Toolbar>

            <!-- Tabla de usuarios (Desktop) -->
            <DataTable
                class="hidden md:block users-table"
                v-model:selection="selectedUsers"
                :value="activeUsers"
                :loading="userStore.loading || loading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                responsiveLayout="scroll"
            >
                <template #empty>
                    <div class="empty-state">
                        <i class="pi pi-users" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
                        <p>No hay usuarios disponibles</p>
                    </div>
                </template>

                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                <Column field="id" header="ID" :sortable="true" style="min-width: 4rem">
                    <template #body="{ data }">
                        <span class="id-badge">{{ data.id }}</span>
                    </template>
                </Column>

                <Column field="nombre" header="Nombre" :sortable="true" style="min-width: 12rem">
                    <template #body="{ data }">
                        <div class="user-info">
                            <Avatar
                                :label="data.username?.charAt(0).toUpperCase()"
                                class="mr-2"
                                shape="circle"
                                style="background-color: var(--primary-color); color: white"
                            />
                            <span class="font-semibold">{{ data.username }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="email" header="Email" :sortable="true" style="min-width: 14rem">
                    <template #body="{ data }">
                        <span class="email-text">{{ data.email }}</span>
                    </template>
                </Column>

                <Column field="createdAt" header="Fecha de Registro" :sortable="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        <span>{{ formatDate(data.createdAt) }}</span>
                    </template>
                </Column>

                <Column field="status" header="Estado" :sortable="true" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Tag
                            :value="data.status.name"
                            :severity="data.status.name === 'Activo' ? 'success' : 'danger'"
                        />
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="{ data }">
                        <div class="action-buttons">
                            <Button
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                class="mr-2"
                                @click="editUser(data)"
                                v-tooltip.top="'Editar'"
                                :disabled="!canWrite"
                            />
                            <Button
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmDeleteUser(data)"
                                v-tooltip.top="'Eliminar'"
                                :disabled="!canWrite"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Vista Cards (Mobile) -->
            <div class="block md:hidden">
                <div v-if="(userStore.loading || loading) && activeUsers.length === 0" class="loading-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-spin pi-spinner text-primary mb-3" style="font-size: 2rem" />
                    <p class="text-secondary m-0">Cargando usuarios...</p>
                </div>
                <div v-else-if="!(userStore.loading || loading) && activeUsers.length === 0" class="empty-state flex flex-col items-center p-5 card mt-4">
                    <i class="pi pi-users mb-3" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <p class="text-secondary m-0">No hay usuarios disponibles</p>
                </div>
                <div v-else class="flex flex-col gap-4 mt-4 relative">
                    <div v-if="userStore.loading || loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-xl">
                        <i class="pi pi-spin pi-spinner text-primary" style="font-size: 3rem" />
                    </div>

                    <div v-for="data in mobilePagedUsers" :key="data.id" class="user-card">
                        <!-- Cabecera de la card -->
                        <div class="user-card-header">
                            <div class="user-card-avatar-info">
                                <Avatar
                                    :label="data.username?.charAt(0).toUpperCase()"
                                    shape="circle"
                                    class="user-card-avatar"
                                />
                                <div>
                                    <span class="user-card-name">{{ data.username }}</span>
                                    <span class="user-card-email">{{ data.email }}</span>
                                </div>
                            </div>
                            <Tag
                                :value="data.status?.name"
                                :severity="data.status?.name === 'Activo' ? 'success' : 'danger'"
                            />
                        </div>

                        <!-- Datos adicionales -->
                        <div class="user-card-body">
                            <div class="user-card-row">
                                <span class="user-card-label">ID:</span>
                                <span class="id-badge">{{ data.id }}</span>
                            </div>
                            <div class="user-card-row">
                                <span class="user-card-label">Rol:</span>
                                <span class="user-card-value">{{ data.role?.name || '—' }}</span>
                            </div>
                            <div class="user-card-row">
                                <span class="user-card-label">Registro:</span>
                                <span class="user-card-value">{{ formatDate(data.createdAt) }}</span>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="user-card-footer">
                            <Button
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                severity="info"
                                v-tooltip.top="'Editar'"
                                @click="editUser(data)"
                                :disabled="!canWrite"
                            />
                            <Button
                                icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                v-tooltip.top="'Eliminar'"
                                @click="confirmDeleteUser(data)"
                                :disabled="!canWrite"
                            />
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
                        <span class="text-sm" style="color: var(--text-color-secondary)">
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

        <!-- Dialog para crear/editar usuario -->
        <Dialog
            v-model:visible="userDialog"
            :style="{ width: '650px' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
            header="Información del Usuario"
            :modal="true"
            class="p-fluid"
        >
            <div class="formgrid grid">
                <div class="field col-12 md:col-6">
                    <label for="nombre">Nombre * </label>
                    <InputText
                        id="nombre"
                        v-model.trim="user.username"
                        required="true"
                        autofocus
                        :invalid="submitted && !user.username"
                        placeholder="Ingrese el nombre completo"
                    />
                    <small class="p-error" v-if="submitted && !user.username">El nombre es requerido.</small>
                </div>

                <div class="field col-12 md:col-6">
                    <label for="email">Email *</label>
                    <InputText
                        id="email"
                        v-model.trim="user.email"
                        required="true"
                        type="email"
                        :invalid="submitted && !user.email"
                        placeholder="correo@ejemplo.com"
                    />
                    <small class="p-error" v-if="submitted && !user.email">El email es requerido.</small>
                </div>
                <div class="field col-12 md:col-6" v-if="!user.id">
                    <label for="password">Contraseña *</label>
                    <Password
                        id="password"
                        v-model="user.password"
                        toggleMask
                        :feedback="true"
                        placeholder="Ingrese una contraseña"
                        :invalid="submitted && !user.password"
                        fluid
                        class="w-full"
                        inputClass="w-full"
                    />
                    <small class="p-error" v-if="submitted && !user.password">La contraseña es requerida.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="role">Rol *</label>
                    <Dropdown
                        id="role"
                        v-model="user.role"
                        :options="roles"
                        optionLabel="name"
                        :itemTemplate="roleItemTemplate"
                        placeholder="Seleccione un rol"
                        :filter="true"
                        :showClear="true"
                        :invalid="submitted && !user.role"
                    />
                    <small class="p-error" v-if="submitted && !user.role">El rol es requerido.</small>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="status">Estado *</label>
                    <Dropdown
                        id="status"
                        v-model="user.status"
                        :options="userStatus"
                        optionLabel="name"
                        :itemTemplate="statusItemTemplate"
                        placeholder="Seleccione estado"
                        :filter="true"
                        :showClear="true"
                        :invalid="submitted && !user.status"
                    />
                    <small class="p-error" v-if="submitted && !user.status">El estado es requerido.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveUser" :disabled="!canWrite" />
            </template>
        </Dialog>

        <!-- Dialog de confirmación de eliminación -->
        <Dialog
            v-model:visible="deleteUserDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
        >
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
                <span v-if="user">
                    ¿Estás seguro de que deseas eliminar a <b>{{ user.nombre }}</b>?
                    <br><small class="text-color-secondary">Esta acción realizará un eliminado lógico.</small>
                </span>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="deleteUserDialog = false" />
                <Button label="Eliminar" icon="pi pi-check" severity="danger" @click="deleteUser" />
            </template>
        </Dialog>

        <!-- Confirm Dialog Global -->
        <ConfirmDialog />
    </div>
</template>

<style scoped lang="scss">
.users-container {
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

.users-table {
    :deep(.p-datatable-header) {
        background: transparent;
        border: none;
    }
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
    :deep(.toolbar-responsive .p-toolbar-start .p-button),
    :deep(.toolbar-responsive .p-toolbar-end .p-iconfield) {
        width: 100%;
    }
    :deep(.toolbar-responsive .p-toolbar-end .p-iconfield input) {
        width: 100%;
    }
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.email-text {
    color: var(--text-color-secondary);
    font-size: 0.95rem;
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

.field {
    margin-bottom: 1.5rem;

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-color);
    }
}

:deep(.p-toolbar) {
    background: var(--surface-50);
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 1rem 1.5rem;
}

/* Mobile cards */
.user-card {
    background: var(--surface-card);
    border-radius: 12px;
    border: 1px solid var(--surface-200);
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.user-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--surface-200);
    gap: 0.5rem;
}

.user-card-avatar-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
}

.user-card-avatar {
    background-color: var(--primary-color) !important;
    color: white !important;
    font-weight: 700;
    flex-shrink: 0;
    width: 2.4rem !important;
    height: 2.4rem !important;
}

.user-card-name {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
}

.user-card-email {
    display: block;
    font-size: 0.78rem;
    color: var(--text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
}

.user-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
}

.user-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
}

.user-card-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.user-card-value {
    color: var(--text-color);
    font-size: 0.9rem;
}

.user-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--surface-200);
    background: var(--surface-50);
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-color-secondary);
    p { margin: 0.75rem 0; font-size: 1rem; }
}
</style>
