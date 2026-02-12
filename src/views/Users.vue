<script setup>
import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import UserService from '@/service/UserService';

const toast = useToast();
const confirm = useConfirm();

// Estados
const users = ref([]);
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

// Usuarios filtrados (excluye los eliminados lógicamente)
const activeUsers = computed(() => {
    return users.value.filter(user => {
        // Filtra por usuarios activos (no eliminados)
        const isActive = user.status !== false && !user.deletedAt;
        
        // Si hay búsqueda, filtra también por nombre o email
        if (searchQuery.value) {
            const search = searchQuery.value.toLowerCase();
            const matchesSearch = 
                (user.nombre?.toLowerCase().includes(search)) ||
                (user.email?.toLowerCase().includes(search));
            return isActive && matchesSearch;
        }
        
        return isActive;
    });
});

// Cargar usuarios
const loadUsers = async () => {
    loading.value = true;
    try {
        const data = await UserService.getUsers();
        users.value = Array.isArray(data) ? data : data.content || [];
        
        // Solo mostrar mensaje de éxito si hay datos
        if (users.value.length > 0) {
            toast.add({
                severity: 'success',
                summary: 'Datos cargados',
                detail: `${users.value.length} usuario(s) obtenidos`,
                life: 2000
            });
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        
        // Mensajes más específicos según el tipo de error
        let errorMessage = 'Error al cargar usuarios';
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
            users.value = [];
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
        status: true
    };
    submitted.value = false;
    userDialog.value = true;
};

// Ocultar diálogo
const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
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

    if (!user.value.nombre?.trim() || !user.value.email?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor completa todos los campos obligatorios',
            life: 3000
        });
        return;
    }

    try {
        if (user.value.id) {
            // Actualizar
            await UserService.updateUser(user.value.id, user.value);
            const index = users.value.findIndex(u => u.id === user.value.id);
            if (index !== -1) {
                users.value[index] = { ...user.value };
            }
            toast.add({
                severity: 'success',
                summary: 'Usuario actualizado',
                detail: 'Los datos se han actualizado correctamente',
                life: 3000
            });
        } else {
            // Crear
            const newUser = await UserService.createUser(user.value);
            users.value.push(newUser);
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
        await UserService.softDeleteUser(user.value.id);
        
        // Actualizar el usuario en la lista local
        const index = users.value.findIndex(u => u.id === user.value.id);
        if (index !== -1) {
            users.value[index].status = false;
            users.value[index].deletedAt = new Date().toISOString();
        }

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
                    await UserService.softDeleteUser(selectedUser.id);
                    const index = users.value.findIndex(u => u.id === selectedUser.id);
                    if (index !== -1) {
                        users.value[index].status = false;
                        users.value[index].deletedAt = new Date().toISOString();
                    }
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
                <Button label="Nuevo Usuario" icon="pi pi-plus" class="p-button-success" @click="openNew" />
            </div>

            <!-- Toolbar de búsqueda y acciones -->
            <Toolbar class="mb-6">
                <template #start>
                    <Button 
                        label="Eliminar" 
                        icon="pi pi-trash" 
                        severity="danger" 
                        @click="confirmDeleteSelected" 
                        :disabled="!selectedUsers || !selectedUsers.length" 
                    />
                </template>
                <template #end>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText 
                            v-model="searchQuery" 
                            placeholder="Buscar por nombre o email..." 
                            style="width: 300px"
                        />
                    </IconField>
                </template>
            </Toolbar>

            <!-- Tabla de usuarios -->
            <DataTable
                v-model:selection="selectedUsers"
                :value="activeUsers"
                :loading="loading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 25, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                responsiveLayout="scroll"
                class="users-table"
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
                                :label="data.nombre?.charAt(0).toUpperCase()" 
                                class="mr-2" 
                                shape="circle" 
                                style="background-color: var(--primary-color); color: white"
                            />
                            <span class="font-semibold">{{ data.nombre }}</span>
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
                            :value="data.status !== false ? 'Activo' : 'Inactivo'" 
                            :severity="data.status !== false ? 'success' : 'danger'"
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
                            />
                            <Button 
                                icon="pi pi-trash" 
                                outlined 
                                rounded 
                                severity="danger" 
                                @click="confirmDeleteUser(data)"
                                v-tooltip.top="'Eliminar'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Dialog para crear/editar usuario -->
        <Dialog 
            v-model:visible="userDialog" 
            :style="{ width: '550px' }" 
            header="Información del Usuario" 
            :modal="true" 
            class="p-fluid"
        >
            <div class="field">
                <label for="nombre">Nombre *</label>
                <InputText 
                    id="nombre" 
                    v-model.trim="user.nombre" 
                    required="true" 
                    autofocus 
                    :invalid="submitted && !user.nombre"
                    placeholder="Ingrese el nombre completo"
                />
                <small class="p-error" v-if="submitted && !user.nombre">El nombre es requerido.</small>
            </div>

            <div class="field">
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

            <div class="field" v-if="!user.id">
                <label for="password">Contraseña *</label>
                <Password 
                    id="password" 
                    v-model="user.password" 
                    toggleMask
                    :feedback="true"
                    placeholder="Ingrese una contraseña"
                />
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveUser" />
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
</style>
