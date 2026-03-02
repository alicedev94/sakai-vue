import { getMenu } from '@/service/MenuService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Función auxiliar para validar y cargar datos del localStorage
    const loadFromStorage = () => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            // Validar que los datos existan y sean válidos
            if (storedToken && storedRefreshToken) {
                // Intentar parsear el usuario
                let parsedUser = null;
                if (storedUser && storedUser !== 'null') {
                    try {
                        parsedUser = JSON.parse(storedUser);
                    } catch (e) {
                        console.warn('⚠️ Usuario en localStorage corrupto, limpiando...');
                        localStorage.removeItem('user');
                    }
                }

                return {
                    token: storedToken,
                    user: parsedUser,
                    refreshToken: storedRefreshToken
                };
            }

            // Si falta algún token, limpiar todo
            if (storedToken || storedRefreshToken || storedUser) {
                console.warn('⚠️ Datos de autenticación incompletos, limpiando...');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }

            return { token: null, user: null, refreshToken: null };
        } catch (error) {
            console.error('❌ Error al cargar del localStorage:', error);
            // En caso de error, limpiar todo
            localStorage.clear();
            return { token: null, user: null, refreshToken: null };
        }
    };

    // Estado - cargar con validación
    const storedData = loadFromStorage();
    const token = ref(storedData.token);
    const user = ref(storedData.user);
    const refreshToken = ref(storedData.refreshToken);
    
    // Obtener menú, rol y permisos del localStorage (o valores por defecto)
    const menu = ref(JSON.parse(localStorage.getItem('menu') || '[]'));
    const role = ref(JSON.parse(localStorage.getItem('role') || 'null'));
    const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'));

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!refreshToken.value);
    const currentUser = computed(() => user.value);

    // Actions
    function setAuth(authData) {
        // Validar que tengamos los datos mínimos necesarios
        if (!authData.token || !authData.refreshToken) {
            console.error('❌ Datos de autenticación inválidos');
            return;
        }

        token.value = authData.token;
        refreshToken.value = authData.refreshToken;
        user.value = authData.user;

        // Guardar en localStorage
        try {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem('user', JSON.stringify(authData.user));
            console.log('✅ Sesión guardada correctamente');
        } catch (error) {
            console.error('❌ Error al guardar en localStorage:', error);
        }
    }

    function updateToken(newToken) {
        if (!newToken) {
            console.warn('⚠️ Intento de actualizar con token vacío');
            return;
        }
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }

    function logout() {
        console.log('🚪 Cerrando sesión...');
        token.value = null;
        refreshToken.value = null;
        user.value = null;
        menu.value = [];
        role.value = null;
        permissions.value = [];

        // Limpiar localStorage
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('menu');
            localStorage.removeItem('role');
            localStorage.removeItem('permissions');
            console.log('✅ Sesión limpiada correctamente');
        } catch (error) {
            console.error('❌ Error al limpiar localStorage:', error);
        }
    }

    // Función para verificar la salud de la sesión
    function validateSession() {
        if (token.value && !refreshToken.value) {
            console.warn('⚠️ Token sin refresh token, limpiando sesión...');
            logout();
            return false;
        }
        return isAuthenticated.value;
    }

    function updateUser(userData) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    // Acción para cargar roles, permisos y menú desde el backend
    async function loadUserPermissions() {
        if (!isAuthenticated.value) return;
        try {
            const data = await getMenu();
            console.log(data);
            menu.value = data || [];
            role.value = data.role || null;
            permissions.value = data.permissions || [];
            
            // Guardar en localStorage para persistencia
            localStorage.setItem('menu', JSON.stringify(menu.value));
            localStorage.setItem('role', JSON.stringify(role.value));
            localStorage.setItem('permissions', JSON.stringify(permissions.value));
            console.log('✅ Permisos y menú cargados en el store');
        } catch (error) {
            console.error('❌ Error al cargar menú y permisos en el store:', error);
        }
    }

    return {
        // Estado
        token,
        user,
        refreshToken,
        menu,
        role,
        permissions,
        // Getters
        isAuthenticated,
        currentUser,
        // Actions
        setAuth,
        updateToken,
        logout,
        updateUser,
        validateSession,
        loadUserPermissions
    };
});

