import apiClient from '@/service/apiClient';

const UbicationsService = {
    /**
     * Obtiene todas las ubicaciones.
     * @returns {Promise<Array>} Lista de ubicaciones.
     */
    async getAll() {
        const response = await apiClient.get('/ubicaciones');
        return response.data;
    },

    /**
     * Obtiene ubicaciones por código de barra.
     * @param {string} codigoBarra
     * @returns {Promise<Array>} Lista de ubicaciones.
     */
    async getUbicaciones(codigoBarra) {
        const response = await apiClient.get(`/ubicaciones/${codigoBarra}`);
        return response.data;
    },

    /**
     * Crea una nueva ubicación.
     * @param {Object} ubicacion Datos de la ubicación.
     * @returns {Promise<Object>} Ubicación creada.
     */
    async createUbicacion(ubicacion) {
        const response = await apiClient.post('/ubicaciones', ubicacion);
        return response.data;
    },

    /**
     * Actualiza una ubicación existente.
     * @param {number|string} id ID de la ubicación.
     * @param {Object} ubicacion Datos actualizados.
     * @returns {Promise<Object>} Ubicación actualizada.
     */
    async updateUbicacion(id, ubicacion) {
        // Asumiendo que el endpoint es /ubicaciones/{id} a pesar del typo en el controlador
        const response = await apiClient.put(`/ubicaciones/${id}`, ubicacion);
        return response.data;
    },

    /**
     * Elimina una ubicación por ID.
     * @param {number|string} id ID de la ubicación.
     * @returns {Promise<Object>} Ubicación eliminada (o status).
     */
    async deleteUbicacion(id) {
        const response = await apiClient.delete(`/ubicaciones/${id}`);
        return response.data;
    }
};

export default UbicationsService;
