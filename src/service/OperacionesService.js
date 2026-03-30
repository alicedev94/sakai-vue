import apiClient from '@/service/apiClient';

const BASE = '/operaciones';

class OperacionesService {
    static async listarTodas() {
        try {
            const { data } = await apiClient.get(BASE);
            return data;
        } catch (error) {
            this.handleError(error, 'listar órdenes');
            throw error;
        }
    }

    static async listarPorEstado(estado) {
        try {
            const { data } = await apiClient.get(`${BASE}/estado/${estado}`);
            return data;
        } catch (error) {
            this.handleError(error, 'filtrar órdenes');
            throw error;
        }
    }

    static async obtenerPorId(id) {
        try {
            const { data } = await apiClient.get(`${BASE}/${id}`);
            return data;
        } catch (error) {
            this.handleError(error, 'obtener orden');
            throw error;
        }
    }

    static async iniciarOrden(id) {
        try {
            const { data } = await apiClient.patch(`${BASE}/${id}/iniciar`);
            return data;
        } catch (error) {
            this.handleError(error, 'iniciar orden');
            throw error;
        }
    }

    static async escanearProducto(ordenId, codigoBarra) {
        try {
            const { data } = await apiClient.post(`${BASE}/${ordenId}/escanear`, { codigoBarra });
            return data;
        } catch (error) {
            this.handleError(error, 'escanear producto');
            throw error;
        }
    }

    static handleError(error, action) {
        let message = `Error al ${action}`;
        if (error.response) {
            const { status, data } = error.response;
            if (status === 400) message = data || 'Solicitud inválida';
            else if (status === 401) message = 'No autorizado. Inicia sesión nuevamente';
            else if (status === 403) message = 'No tienes permisos para esta acción';
            else if (status === 404) message = 'Registro no encontrado';
            else message = data || message;
        } else if (error.request) {
            message = 'Sin conexión con el servidor';
        }
        error.userMessage = message;
    }
}

export default OperacionesService;

export const operacionesService = {
    listarTodas: () => OperacionesService.listarTodas(),
    listarPorEstado: (estado) => OperacionesService.listarPorEstado(estado),
    obtenerPorId: (id) => OperacionesService.obtenerPorId(id),
    iniciarOrden: (id) => OperacionesService.iniciarOrden(id),
    escanearProducto: (ordenId, codigoBarra) => OperacionesService.escanearProducto(ordenId, codigoBarra)
};
