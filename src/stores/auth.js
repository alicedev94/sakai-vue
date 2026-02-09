import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Estado
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const refreshToken = ref(localStorage.getItem('refreshToken') || null);

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const currentUser = computed(() => user.value);

    // Actions
    function setAuth(authData) {
        token.value = authData.token;
        refreshToken.value = authData.refreshToken;
        user.value = authData.user;

        // Guardar en localStorage
        localStorage.setItem('token', authData.token);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
    }

    function updateToken(newToken) {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }

    function logout() {
        token.value = null;
        refreshToken.value = null;
        user.value = null;

        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    function updateUser(userData) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    return {
        // Estado
        token,
        user,
        refreshToken,
        // Getters
        isAuthenticated,
        currentUser,
        // Actions
        setAuth,
        updateToken,
        logout,
        updateUser
    };
});
