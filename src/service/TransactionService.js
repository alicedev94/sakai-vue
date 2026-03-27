import apiClient from '@/service/apiClient';

class TransactionService {
    /**
     * Obtiene las transacciones de productos con filtros
     * @param {Object} params - Parámetros de filtrado
     * @param {string} params.codigo - Código principal
     * @param {string} params.barra1 - Código de barra 1
     * @param {string} params.barra2 - Código de barra 2
     * @param {string} params.descripcion - Descripción del producto
     * @param {string} params.fechaDesde - Fecha de inicio (ISO 8601 o YYYY-MM-DD)
     * @param {string} params.fechaHasta - Fecha de fin (ISO 8601 o YYYY-MM-DD)
     * @param {number} params.page - Número de página
     * @param {number} params.size - Tamaño de página
     * @returns {Promise<Object>} Resultado paginado o lista
     */
    static async getTransaccionesProductos(params = {}) {
        try {
            const response = await apiClient.get('/productos/getAll', { params });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener transacciones de productos');
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

export default TransactionService;
