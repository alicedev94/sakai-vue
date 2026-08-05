import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const BUNDLE_VERSION = '2026-08-05-v5-multi-backend-fix';

if (typeof window !== 'undefined') {
    console.log(
        '%c[sakai-apiClient] Bundle: ' + BUNDLE_VERSION,
        'background:#16a34a;color:white;padding:4px 8px;border-radius:4px;font-weight:bold;'
    );
    console.log('[sakai-apiClient] window.location.pathname =', window.location.pathname);
    console.log('[sakai-apiClient] window.location.href =', window.location.href);
    const initialBaseURL = (() => {
        const path = window.location.pathname;
        if (path.startsWith('/r1')) return import.meta.env.VITE_BACKEND_R1;
        if (path.startsWith('/r2')) return import.meta.env.VITE_BACKEND_R2;
        if (path.startsWith('/r3')) return import.meta.env.VITE_BACKEND_R3;
        return null;
    })();
    console.log('[sakai-apiClient] initial baseURL from pathname =', initialBaseURL);
    console.log('[sakai-apiClient] localStorage sakai-backend =', localStorage.getItem('sakai-backend'));
}

const getBackendBaseURL = () => {
    if (typeof window === 'undefined') return '/api/v1';
    const path = window.location.pathname;
    let backend = null;
    if (path.startsWith('/r1')) backend = import.meta.env.VITE_BACKEND_R1;
    else if (path.startsWith('/r2')) backend = import.meta.env.VITE_BACKEND_R2;
    else if (path.startsWith('/r3')) backend = import.meta.env.VITE_BACKEND_R3;
    if (backend) {
        // El usuario está navegando desde un prefijo /rN/ — sobrescribir
        // cualquier cache stale de localStorage y usar este backend.
        try { localStorage.setItem('sakai-backend', backend); } catch { /* noop */ }
        if (typeof window !== 'undefined') {
            console.log('[sakai-apiClient] getBackendBaseURL: pathname=' + path + ' -> ' + backend);
        }
        return backend;
    }
    // Fallback: pathname no tiene /rN (ej. /v1/ después de redirect del router).
    // Usar localStorage SOLO si tiene un valor de /rN/ cacheado; cualquier otro
    // valor lo ignoramos para evitar llamadas a /api/v1 cuando estamos en /r1.
    const stored = localStorage.getItem('sakai-backend');
    if (stored && (stored.includes('/r1/') || stored.includes('/r2/') || stored.includes('/r3/'))) {
        if (typeof window !== 'undefined') {
            console.log('[sakai-apiClient] getBackendBaseURL: pathname=' + path + ' -> from localStorage: ' + stored);
        }
        return stored;
    }
    if (typeof window !== 'undefined') {
        console.log('[sakai-apiClient] getBackendBaseURL: pathname=' + path + ' -> FALLBACK /api/v1 (no /rN detected, localStorage=' + stored + ')');
    }
    return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

// Instancia de Axios compartida para todos los servicios
// baseURL se recalcula en cada request vía interceptor para que los cambios
// de pathname (ej. entrar por /r1 después de haber cargado el módulo en /v1)
// se reflejen sin recargar la página.
const apiClient = axios.create({
    baseURL: '/api/v1', // se sobrescribe en cada request
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 600000
});

// ─── Interceptor de REQUEST: recalcular baseURL y adjuntar JWT ───────────────
apiClient.interceptors.request.use(
    (config) => {
        // Recalcular baseURL en cada request para soportar cambio de pathname
        const freshBaseURL = getBackendBaseURL();
        if (typeof window !== 'undefined') {
            console.log(
                '[sakai-apiClient] request: ' + config.method.toUpperCase() + ' ' + freshBaseURL + config.url +
                ' (pathname: ' + window.location.pathname + ')'
            );
        }
        if (config.baseURL !== freshBaseURL) {
            if (typeof window !== 'undefined') {
                console.log(
                    '[sakai-apiClient] baseURL change: ' + config.baseURL + ' -> ' + freshBaseURL
                );
            }
            config.baseURL = freshBaseURL;
        }

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
            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register') || originalRequest.url.includes('/auth/refresh')) {
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
            try {
                authStore = useAuthStore();
            } catch {
                authStore = null;
            }

            const refreshToken = authStore?.refreshToken || localStorage.getItem('refreshToken');

            if (!refreshToken) {
                console.warn('⚠️ No hay refresh token disponible — redirigiendo al login');
                isRefreshing = false;
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/v1/auth/login')) {
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
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/v1/auth/login')) {
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
