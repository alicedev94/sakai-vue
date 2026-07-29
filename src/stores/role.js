import RoleService from '@/service/RoleService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from './auth';

export const useRoleStore = defineStore('role', () => {
    const authStore = useAuthStore();
    const roles = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const getRolesList = computed(() => roles.value);

    // Actions
    async function loadRoles() {
        loading.value = true;
        error.value = null;
        try {
            const data = await RoleService.getRoles();
            roles.value = Array.isArray(data) ? data : data.content || [];
            return roles.value;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar roles';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getRoleById(id) {
        loading.value = true;
        error.value = null;
        try {
            return await RoleService.getRoleById(id);
        } catch (err) {
            error.value = err.userMessage || 'Error al obtener el rol';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createRole(roleData) {
        loading.value = true;
        error.value = null;
        try {
            const created = await RoleService.createRole(roleData);
            roles.value.push(created);
            await authStore.loadUserPermissions();
            return created;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear el rol';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateRole(id, roleData) {
        loading.value = true;
        error.value = null;
        try {
            const updated = await RoleService.updateRole(id, roleData);
            const idx = roles.value.findIndex((r) => r.id === id);
            if (idx !== -1) {
                roles.value[idx] = updated;
            }
            await authStore.loadUserPermissions();
            return updated;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar el rol';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function softDeleteRole(id) {
        loading.value = true;
        error.value = null;
        try {
            await RoleService.softDeleteRole(id);
            const idx = roles.value.findIndex((r) => r.id === id);
            if (idx !== -1) {
                roles.value[idx].status = false;
                roles.value[idx].deletedAt = new Date().toISOString();
            }
            await authStore.loadUserPermissions();
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar el rol';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        roles,
        loading,
        error,
        getRolesList,
        loadRoles,
        getRoleById,
        createRole,
        updateRole,
        softDeleteRole
    };
});
