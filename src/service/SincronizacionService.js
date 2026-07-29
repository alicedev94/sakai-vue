import apiClient from '@/service/apiClient';

const BASE_URL = '/sincronizacion';

class SincronizacionService {
    /**
     * Obtiene todas las configuraciones de sincronización.
     * @returns {Promise<Array>}
     */
    static async obtenerTodos() {
        try {
            const response = await apiClient.get(BASE_URL);
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener configuraciones de sincronización');
            throw error;
        }
    }

    /**
     * Crea una nueva configuración de sincronización.
     * @param {Object} payload - { departamento, intervaloMinutos, esActivo }
     * @returns {Promise<Object>}
     */
    static async crear(payload) {
        try {
            const response = await apiClient.post(BASE_URL, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, 'crear configuración de sincronización');
            throw error;
        }
    }

    /**
     * Actualiza una configuración de sincronización existente.
     * @param {number} id
     * @param {Object} payload - { departamento, intervaloMinutos, esActivo }
     * @returns {Promise<Object>}
     */
    static async actualizar(id, payload) {
        try {
            const response = await apiClient.put(`${BASE_URL}/${id}`, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, 'actualizar configuración de sincronización');
            throw error;
        }
    }

    /**
     * Elimina una configuración de sincronización por su ID.
     * @param {number} id
     * @returns {Promise<void>}
     */
    static async eliminar(id) {
        try {
            await apiClient.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            this.handleError(error, 'eliminar configuración de sincronización');
            throw error;
        }
    }

    /**
     * Obtiene el catálogo de departamentos disponibles.
     * @returns {Promise<AxiosResponse>} data: Array<{id, codigo, descripcion, ...}>
     */
    static async getDepartamentos() {
        try {
            return await apiClient.get(`${BASE_URL}/departamentos`);
        } catch (error) {
            this.handleError(error, 'obtener departamentos');
            throw error;
        }
    }

    /**
     * Manejo centralizado de errores del servicio.
     * @param {Error} error
     * @param {string} action
     */
    static handleError(error, action) {
        console.error(`Error al ${action}:`, error);
        let message = `Error al ${action}`;
        if (error.response) {
            const { status, data } = error.response;

            const extractMessage = (dataVal, fallback) => {
                if (!dataVal) return fallback;
                if (typeof dataVal === 'string') return dataVal;
                if (typeof dataVal === 'object') {
                    return dataVal.message || dataVal.error || fallback;
                }
                return fallback;
            };

            if (status === 400) message = extractMessage(data, 'Datos inválidos');
            else if (status === 401) message = 'No autorizado. Inicia sesión nuevamente';
            else if (status === 403) message = 'No tienes permisos para realizar esta acción';
            else if (status === 404) message = 'Recurso no encontrado';
            else if (status === 409) message = extractMessage(data, 'El departamento ya tiene una configuración');
            else if (status === 500) message = extractMessage(data, 'Error interno del servidor');
            else message = extractMessage(data, `Error al ${action}`);
        } else if (error.request) {
            message = 'Error de conexión. Verifica tu conexión a internet';
        }

        error.userMessage = message;
    }
}

export default SincronizacionService;

// Exportación con nombre para permitir import { sincronizacionService }
export const sincronizacionService = {
    obtenerTodos: () => SincronizacionService.obtenerTodos(),
    crear: (payload) => SincronizacionService.crear(payload),
    actualizar: (id, payload) => SincronizacionService.actualizar(id, payload),
    eliminar: (id) => SincronizacionService.eliminar(id),
    getDepartamentos: () => SincronizacionService.getDepartamentos()
};
