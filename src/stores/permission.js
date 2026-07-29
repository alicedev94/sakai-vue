import PermissionService from '@/service/PermissionService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useAuthStore } from './auth';

export const usePermissionStore = defineStore('permission', () => {
    const authStore = useAuthStore();
    const permissions = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const getPermissionsList = computed(() => permissions.value);

    // Actions
    async function loadPermissions() {
        loading.value = true;
        error.value = null;
        try {
            const data = await PermissionService.getPermissions();
            permissions.value = Array.isArray(data) ? data : data.content || [];
            return permissions.value;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar permisos';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getPermissionById(id) {
        loading.value = true;
        error.value = null;
        try {
            return await PermissionService.getPermissionById(id);
        } catch (err) {
            error.value = err.userMessage || 'Error al obtener el permiso';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createPermission(permissionData) {
        loading.value = true;
        error.value = null;
        try {
            const created = await PermissionService.createPermission(permissionData);
            permissions.value.push(created);
            await authStore.loadUserPermissions();
            return created;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear el permiso';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updatePermission(id, permissionData) {
        loading.value = true;
        error.value = null;
        try {
            const updated = await PermissionService.updatePermission(id, permissionData);
            const idx = permissions.value.findIndex((p) => p.id === id);
            if (idx !== -1) permissions.value[idx] = updated;
            await authStore.loadUserPermissions();
            return updated;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar el permiso';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function softDeletePermission(id) {
        loading.value = true;
        error.value = null;
        try {
            await PermissionService.softDeletePermission(id);
            const idx = permissions.value.findIndex((p) => p.id === id);
            if (idx !== -1) {
                permissions.value[idx].status = false;
                permissions.value[idx].deletedAt = new Date().toISOString();
            }
            await authStore.loadUserPermissions();
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar el permiso';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        permissions,
        loading,
        error,
        getPermissionsList,
        loadPermissions,
        getPermissionById,
        createPermission,
        updatePermission,
        softDeletePermission
    };
});
