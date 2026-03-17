import apiClient from '@/service/apiClient';
import { useAuthStore } from '@/stores/auth';


// Interceptor de request: añadir token a todas las peticiones
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de response: manejar errores y refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.log('🔄 Error en interceptor de response:', error);
        // Si no hay respuesta del servidor (backend caído)
        if (!error.response) {
            console.error('❌ Backend no disponible:', error.message);
            
            // Si el backend no está disponible, limpiar auth y redirigir
            const authStore = useAuthStore();
            if (authStore.token && typeof window !== 'undefined') {
                console.warn('⚠️ Backend no responde. Limpiando sesión...');
                authStore.logout();
                
                // Solo redirigir si no estamos ya en login
         
            }
            
            return Promise.reject(error);
        }

        // Si el error es 401 y no es la ruta de login/register/refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // No intentar refresh en rutas de autenticación
            if (originalRequest.url.includes('/auth/login') || 
                originalRequest.url.includes('/auth/register') ||
                originalRequest.url.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Si ya se está refrescando, poner en cola
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const authStore = useAuthStore();

            // Verificar que tengamos refresh token
            if (!authStore.refreshToken) {
                console.warn('⚠️ No hay refresh token disponible');
                isRefreshing = false;
                authStore.logout();
                
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login?error=no_refresh_token';
                }
                
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Intentando refrescar token...');
                
                // Intentar refresh token
                const response = await apiClient.post('/auth/refresh', null, {
                    headers: {
                        Authorization: `Bearer ${authStore.refreshToken}`
                    }
                });

                const newToken = response.data.token;
                authStore.updateToken(newToken);
                
                console.log('✅ Token refrescado correctamente');

                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('❌ Error al refrescar token:', refreshError.response?.status || refreshError.message);
                
                processQueue(refreshError, null);
                authStore.logout();
                
                // Redirigir al login
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login?error=session_expired';
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

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
     * Login de usuario
     * @param {Object} credentials - Credenciales { email, password }
     * @returns {Promise} Respuesta del servidor con token
     */
    static async login(credentials) {
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

