import apiClient from '@/service/apiClient';

const BASE = '/operaciones';

class PreOrdenesService {
    static async listarTodas(params = {}) {
        try {
            const { data } = await apiClient.get(`${BASE}`, {
                params: {
                    tipoDocumento: 'PreOrden',
                    ...params
                }
            });
            return data;
        } catch (error) {
            this.handleError(error, 'listar operaciones');
            throw error;
        }
    }

    static async listarPorEstado(estado) {
        try {
            const { data } = await apiClient.get(`${BASE}/estado/${estado}?tipoDocumento=PreOrden`);
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
            this.handleError(error, 'iniciar pre-orden');
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

    static async obtenerDepartamentos() {
        try {
            const { data } = await apiClient.get(`${BASE}/departamentos`);
            return data;
        } catch (error) {
            this.handleError(error, 'obtener departamentos');
            throw error;
        }
    }

    static async obtenerProductosPorDepartamento(departamento) {
        try {
            const { data } = await apiClient.get(`${BASE}/productos`, { params: { departamento } });
            return data;
        } catch (error) {
            this.handleError(error, 'obtener productos del departamento');
            throw error;
        }
    }

    static async crearPreOrden(payload) {
        try {
            const { data } = await apiClient.post(`${BASE}`, payload);
            return data;
        } catch (error) {
            this.handleError(error, 'crear pre-orden');
            throw error;
        }
    }

    static async actualizarPreOrden(id, payload) {
        try {
            const { data } = await apiClient.put(`${BASE}/${id}`, payload);
            return data;
        } catch (error) {
            this.handleError(error, 'actualizar pre-orden');
            throw error;
        }
    }

    static async eliminarPreOrden(id) {
        try {
            const { data } = await apiClient.delete(`${BASE}/${id}`);
            return data;
        } catch (error) {
            this.handleError(error, 'eliminar pre-orden');
            throw error;
        }
    }

    static async aprobarPreOrden(id) {
        try {
            const { data } = await apiClient.patch(`${BASE}/${id}/aprobar`);
            return data;
        } catch (error) {
            this.handleError(error, 'aprobar pre-orden');
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

export default PreOrdenesService;

export const preOrdenesService = {
    listarTodas: () => PreOrdenesService.listarTodas(),
    listarPorEstado: (estado) => PreOrdenesService.listarPorEstado(estado),
    obtenerPorId: (id) => PreOrdenesService.obtenerPorId(id),
    iniciarOrden: (id) => PreOrdenesService.iniciarOrden(id),
    escanearProducto: (ordenId, codigoBarra) => PreOrdenesService.escanearProducto(ordenId, codigoBarra),
    obtenerDepartamentos: () => PreOrdenesService.obtenerDepartamentos(),
    obtenerProductosPorDepartamento: (departamento) => PreOrdenesService.obtenerProductosPorDepartamento(departamento),
    crearPreOrden: (payload) => PreOrdenesService.crearPreOrden(payload),
    actualizarPreOrden: (id, payload) => PreOrdenesService.actualizarPreOrden(id, payload),
    eliminarPreOrden: (id) => PreOrdenesService.eliminarPreOrden(id),
    aprobarPreOrden: (id) => PreOrdenesService.aprobarPreOrden(id)
};
