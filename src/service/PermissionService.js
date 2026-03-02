import axios from 'axios';

/**
 * Servicio para gestión de permisos
 * Incluye funcionalidades de CRUD y eliminado lógico
 */
class PermissionService {
    /**
     * Obtiene todos los permisos activos (no eliminados)
     * @returns {Promise<Array>} Lista de permisos
     */
    static async getPermissions() {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get('/api/v1/permissions', { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener permisos');
            throw error;
        }
    }

    /**
     * Obtiene un permiso específico por ID
     * @param {number} id - ID del permiso
     * @returns {Promise<Object>} Datos del permiso
     */
    static async getPermissionById(id) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`/api/v1/permissions/${id}`, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener el permiso');
            throw error;
        }
    }

    /**
     * Crea un nuevo permiso
     * @param {Object} permissionData - Datos del nuevo permiso
     * @returns {Promise<Object>} Permiso creado
     */
    static async createPermission(permissionData) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post('/api/v1/permissions', permissionData, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'crear el permiso');
            throw error;
        }
    }

    /**
     * Actualiza un permiso existente
     * @param {number} id - ID del permiso
     * @param {Object} permissionData - Datos a actualizar
     * @returns {Promise<Object>} Permiso actualizado
     */
    static async updatePermission(id, permissionData) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.put(`/api/v1/permissions/${id}`, permissionData, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'actualizar el permiso');
            throw error;
        }
    }

    /**
     * Eliminado LÓGICO de permiso
     * @param {number} id - ID del permiso a eliminar
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async softDeletePermission(id) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.delete(`/api/v1/permissions/${id}`, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'eliminar el permiso');
            throw error;
        }
    }

    /**
     * Restaura un permiso eliminado lógicamente
     * @param {number} id - ID del permiso a restaurar
     * @returns {Promise<Object>} Permiso restaurado
     */
    static async restorePermission(id) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.patch(`/api/v1/permissions/${id}/restore`, {
                status: true,
                deletedAt: null
            }, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'restaurar el permiso');
            throw error;
        }
    }

    /**
     * Eliminado FÍSICO de permiso (solo para administradores)
     * @param {number} id - ID del permiso a eliminar permanentemente
     * @returns {Promise<void>}
     */
    static async hardDeletePermission(id) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.delete(`/api/v1/permissions/${id}/hard`, { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'eliminar permanentemente el permiso');
            throw error;
        }
    }

    /**
     * Manejo centralizado de errores
     * @param {Error} error - Error capturado
     * @param {string} action - Acción que se estaba realizando
     */
    static handleError(error, action) {
        console.error(`Error al ${action}:`, error);

        let message = `Error al ${action}`;

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            switch (status) {
                case 400:
                    message = data.message || 'Datos inválidos';
                    break;
                case 401:
                    message = 'No autorizado. Por favor, inicia sesión nuevamente';
                    break;
                case 403:
                    message = 'No tienes permisos para realizar esta acción';
                    break;
                case 404:
                    message = 'Permiso no encontrado';
                    break;
                case 409:
                    message = data.message || 'El permiso ya existe';
                    break;
                case 500:
                    message = 'Error en el servidor. Intenta nuevamente más tarde';
                    break;
                default:
                    message = data.message || `Error al ${action}`;
            }
        } else if (error.request) {
            message = 'Error de conexión. Verifica tu conexión a internet';
        }
        error.userMessage = message;
    }
}

export default PermissionService;

