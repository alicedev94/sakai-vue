import apiClient from '@/service/apiClient';

const BASE_URL = '/sincronizacion/groups';

class SincronizacionGroupService {
    static async obtenerTodos() {
        try {
            const response = await apiClient.get(BASE_URL);
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener grupos de sincronización');
            throw error;
        }
    }

    static async crear(payload) {
        try {
            const response = await apiClient.post(BASE_URL, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, 'crear grupo de sincronización');
            throw error;
        }
    }

    static async actualizar(id, payload) {
        try {
            const response = await apiClient.put(`${BASE_URL}/${id}`, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, 'actualizar grupo de sincronización');
            throw error;
        }
    }

    static async eliminar(id) {
        try {
            await apiClient.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            this.handleError(error, 'eliminar grupo de sincronización');
            throw error;
        }
    }

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
            else if (status === 409) message = extractMessage(data, 'Conflicto');
            else if (status === 500) message = extractMessage(data, 'Error interno del servidor');
            else message = extractMessage(data, `Error al ${action}`);
        } else if (error.request) {
            message = 'Error de conexión. Verifica tu conexión a internet';
        }

        error.userMessage = message;
    }
}

export default SincronizacionGroupService;

export const sincronizacionGroupService = {
    obtenerTodos: () => SincronizacionGroupService.obtenerTodos(),
    crear: (payload) => SincronizacionGroupService.crear(payload),
    actualizar: (id, payload) => SincronizacionGroupService.actualizar(id, payload),
    eliminar: (id) => SincronizacionGroupService.eliminar(id)
};
