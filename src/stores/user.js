import UserService from '@/service/UserService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const getUsersList = computed(() => users.value);

    // Actions
    async function loadUsers(params = {}) {
        loading.value = true;
        error.value = null;
        try {
            const data = await UserService.getUsers(params);
            users.value = Array.isArray(data) ? data : data.content || [];
            return users.value;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar usuarios';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getUserById(id) {
        loading.value = true;
        error.value = null;
        try {
            return await UserService.getUserById(id);
        } catch (err) {
            error.value = err.userMessage || 'Error al obtener el usuario';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createUser(userData) {
        loading.value = true;
        error.value = null;
        try {
            const created = await UserService.createUser(userData);
            users.value.push(created);
            return created;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear el usuario';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateUser(id, userData) {
        loading.value = true;
        error.value = null;
        try {
            const updated = await UserService.updateUser(id, userData);
            const idx = users.value.findIndex(u => u.id === id);
            if (idx !== -1) {
                users.value[idx] = updated;
            }
            return updated;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar el usuario';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function softDeleteUser(id) {
        loading.value = true;
        error.value = null;
        try {
            await UserService.softDeleteUser(id);
            const idx = users.value.findIndex(u => u.id === id);
            if (idx !== -1) {
                if (users.value[idx].status) {
                    users.value[idx].status.name = 'Inactivo';
                } else {
                    users.value[idx].status = { name: 'Inactivo' };
                }
                users.value[idx].deletedAt = new Date().toISOString();
            }
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar el usuario';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        users,
        loading,
        error,
        getUsersList,
        loadUsers,
        getUserById,
        createUser,
        updateUser,
        softDeleteUser
    };
});
