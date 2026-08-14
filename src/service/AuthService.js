import apiClient from '@/service/apiClient';
import { useAuthStore } from '@/stores/auth';

// Servicio de autenticación
export default class AuthService {
    /**
     * Registro de usuario
     * @param {Object} userData - Datos del usuario { email, password, nombre, etc. }
     * @returns {Promise} Respuesta del servidor
     */
    static async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Login de usuario.
     * El usuario DEBE haber seleccionado una tienda en el Login.vue antes de llamar.
     * La tienda seleccionada se guarda en localStorage y el apiClient usa ese baseURL.
     */
    static async login(credentials) {
        const userTienda = typeof window !== 'undefined' ? localStorage.getItem('user-tienda') : null;
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        const hasStorePrefix = /^\/r[123](\/|$)/.test(path);

        if (!hasStorePrefix && !userTienda) {
            throw {
                status: -1,
                message: 'Selecciona una tienda antes de iniciar sesion',
                data: null
            };
        }

        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Refresh token
     * @returns {Promise} Respuesta del servidor con nuevo token
     */
    static async refresh() {
        try {
            const response = await apiClient.post('/auth/refresh');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout (opcional, si tienes endpoint en backend)
     * @returns {Promise}
     */
    static async logout() {
        try {
            // Si tienes un endpoint de logout en el backend, descoméntalo:
            // const response = await apiClient.post('/auth/logout');
            // return response.data;

            const authStore = useAuthStore();
            authStore.logout();
            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Manejo de errores centralizado
     * @param {Error} error - Error de Axios
     * @returns {Object} Objeto de error formateado
     */
    static handleError(error) {
        if (error.response) {
            // El servidor respondió con un código de error
            return {
                status: error.response.status,
                message: error.response.data.message || error.response.data.error || 'Error en el servidor',
                data: error.response.data
            };
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta
            return {
                status: 0,
                message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                data: null
            };
        } else {
            // Algo pasó al configurar la petición
            return {
                status: -1,
                message: error.message || 'Error desconocido',
                data: null
            };
        }
    }
}

// Exportar también la instancia de axios por si se necesita
export { apiClient };
