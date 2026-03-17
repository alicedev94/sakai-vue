import axios from 'axios';

// Instancia de Axios compartida para todos los servicios
// Usar variable de entorno si existe, sino usar '/api/v1' (proxy de Vite en desarrollo)
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

export default apiClient;
