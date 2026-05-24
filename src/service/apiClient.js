import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

// Instancia de Axios compartida para todos los servicios
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 600000
});

// ─── Interceptor de REQUEST: adjuntar JWT ────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        // Leer token desde el store de Pinia si está disponible,
        // o desde localStorage como fallback (p.ej. al recargar la página
        // antes de que Vue/Pinia estén completamente inicializados).
        let token = null;
        try {
            token = useAuthStore().token;
        } catch {
            // Pinia aún no inicializado
        }
        if (!token) {
            token = localStorage.getItem('token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Interceptor de RESPONSE: refresh token y manejo de errores ──────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Backend caído (sin respuesta)
        if (!error.response) {
            console.error('❌ Backend no disponible o timeout:', error.message);
            
            // 🔥 EVITAMOS cerrar sesión si es un simple Timeout de una consulta pesada
            if (error.code !== 'ECONNABORTED') {
                try {
                    const authStore = useAuthStore();
                    if (authStore.token && typeof window !== 'undefined') {
                        console.warn('⚠️ Backend no responde. Limpiando sesión...');
                        authStore.logout();
                        if (!window.location.pathname.includes('/v1/auth/login')) {
                            window.location.href = '/v1/auth/login?error=backend_unavailable';
                        }
                    }
                } catch { /* store no disponible */ }
            }
            return Promise.reject(error);
        }

        // 403 → Acceso denegado / No autorizado
        if (error.response?.status === 403) {
            console.warn('⚠️ Acceso denegado (403). Redirigiendo al login...');
            try {
                const authStore = useAuthStore();
                authStore.logout();
            } catch { /* store no disponible */ }

            if (typeof window !== 'undefined' && !window.location.pathname.includes('/v1/auth/login')) {
                window.location.href = '/v1/auth/login?error=forbidden';
            }
            return Promise.reject(error);
        }

        // 401 → intentar refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (
                originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/register') ||
                originalRequest.url.includes('/auth/refresh')
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            let authStore;
            try { authStore = useAuthStore(); } catch { authStore = null; }

            const refreshToken = authStore?.refreshToken || localStorage.getItem('refreshToken');

            if (!refreshToken) {
                console.warn('⚠️ No hay refresh token disponible');
                isRefreshing = false;
                authStore?.logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/v1/auth/login?error=no_refresh_token';
                }
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Intentando refrescar token...');
                const response = await apiClient.post('/auth/refresh', null, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });
                const newToken = response.data.token;
                authStore?.updateToken(newToken);
                console.log('✅ Token refrescado correctamente');
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('❌ Error al refrescar token:', refreshError.response?.status || refreshError.message);
                processQueue(refreshError, null);
                authStore?.logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/v1/auth/login?error=session_expired';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
