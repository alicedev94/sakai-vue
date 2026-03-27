import apiClient from '@/service/apiClient';

class MovimientoService {
    /**
     * Obtiene los movimientos (preOrden, Orden) con filtros
     * @param {Object} params - Parámetros de filtrado
     */
    static async getMovimientos(params = {}) {
        try {
            const url = '/movimientos/getAll';
            const fetchParams = { ...params };
            const response = await apiClient.get(url, { params: fetchParams });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener movimientos');
            throw error;
        }
    }

    /**
     * Manejo centralizado de errores
     */
    static handleError(error, action) {
        console.error(`Error al ${action}:`, error);
        let message = `Error al ${action}`;

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            if (status === 400) message = data.message || 'Datos inválidos';
            else if (status === 401) message = 'No autorizado. Inicia sesión nuevamente';
            else if (status === 403) message = 'No tienes permisos';
            else if (status === 404) message = 'No encontrado';
            else if (status === 500) message = 'Error en el servidor';
            else message = data.message || `Error al ${action}`;
        } else if (error.request) {
            message = 'Error de conexión. Verifica tu internet';
        }

        error.userMessage = message;
    }
}

export default MovimientoService;
