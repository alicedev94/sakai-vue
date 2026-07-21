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
// IMPORTANTE: la sesión SOLO se cierra cuando el usuario hace click en
// "Cerrar sesión" desde AppTopbar. Los errores transitorios (red caída,
// timeout, 403) NO cierran sesión ni redirigen. Si el refresh token falla,
// redirigimos al login pero NO limpiamos localStorage — el próximo login
// del usuario sobrescribe los tokens viejos.
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

        // Backend caído / timeout / CORS / sin respuesta.
        // ANTES: cerraba sesión y redirigía al login. AHORA: solo loggea
        // y rechaza la request — la sesión sigue viva en localStorage.
        if (!error.response) {
            console.warn('⚠️ Backend no disponible o timeout:', error.message || error.code);
            return Promise.reject(error);
        }

        // 403: log y rechaza, pero NO cierra sesión. Un 403 transitorio
        // (race post-login cuando los permisos aún no están cargados, o
        // un endpoint que devuelve 403 por bug) ya no echa al usuario.
        if (error.response?.status === 403) {
            console.warn('⚠️ Acceso denegado (403):', error.config?.url);
            return Promise.reject(error);
        }

        // 401 → intentar refresh token. ESTE es el único path que puede
        // terminar redirigiendo al login (cuando ni el refresh token sirve),
        // pero igual NO limpiamos localStorage.
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
                console.warn('⚠️ No hay refresh token disponible — redirigiendo al login');
                isRefreshing = false;
                if (typeof window !== 'undefined'
                    && !window.location.pathname.includes('/v1/auth/login')) {
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
                if (typeof window !== 'undefined'
                    && !window.location.pathname.includes('/v1/auth/login')) {
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
