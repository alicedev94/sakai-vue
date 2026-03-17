import apiClient from '@/service/apiClient';

/**
 * Servicio para gestión de roles
 * Incluye funcionalidades de CRUD y eliminado lógico
 */
class RoleService {
    /**
     * Obtiene todos los roles activos (no eliminados)
     * @param {Object} params - Parámetros de filtrado
     * @param {string} params.search - Término de búsqueda (nombre)
     * @param {boolean} params.includeDeleted - Incluir roles eliminados
     * @returns {Promise<Array>} Lista de roles
     */
    static async getRoles() {
        try {
            const response = await apiClient.get('/roles');
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener roles');
            throw error;
        }
    }

    /**
     * Obtiene un rol específico por ID
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Datos del rol
     */
    static async getRoleById(id) {
        try {
            const response = await apiClient.get(`/roles/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener el rol');
            throw error;
        }
    }

    /**
     * Crea un nuevo rol
     * @param {Object} roleData - Datos del nuevo rol
     * @returns {Promise<Object>} Rol creado
     */
    static async createRole(roleData) {
        try {
            const response = await apiClient.post('/roles', roleData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'crear el rol');
            throw error;
        }
    }

    /**
     * Actualiza un rol existente
     * @param {number} id - ID del rol
     * @param {Object} roleData - Datos a actualizar
     * @returns {Promise<Object>} Rol actualizado
     */
    static async updateRole(id, roleData) {
        try {
            const response = await apiClient.put(`/roles/${id}`, roleData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'actualizar el rol');
            throw error;
        }
    }

    /**
     * Eliminado LÓGICO de rol
     * Establece el campo deleted_at o status en false en lugar de borrar el registro
     * @param {number} id - ID del rol a eliminar
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async softDeleteRole(id) {
        try {
            const response = await apiClient.delete(`/roles/${id}`);
            return response.data;
        } catch (error) {
            // Si el endpoint no existe, intentar con PATCH
            try {
                const response = await apiClient.delete(`/roles/${id}`, {
                    data: { status: false, deletedAt: new Date().toISOString() }
                });
                return response.data;
            } catch (patchError) {
                this.handleError(patchError, 'eliminar el rol');
                throw patchError;
            }
        }
    }

    /**
     * Restaura un rol eliminado lógicamente
     * @param {number} id - ID del rol a restaurar
     * @returns {Promise<Object>} Rol restaurado
     */
    static async restoreRole(id) {
        try {
            const response = await apiClient.patch(`/roles/${id}/restore`, {
                status: true,
                deletedAt: null
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'restaurar el rol');
            throw error;
        }
    }

    /**
     * Eliminado FÍSICO de rol (solo para administradores)
     * Borra permanentemente el registro de la base de datos
     * @param {number} id - ID del rol a eliminar permanentemente
     * @returns {Promise<void>}
     */
    static async hardDeleteRole(id) {
        try {
            const response = await apiClient.delete(`/roles/${id}/hard`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'eliminar permanentemente el rol');
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
            // Error de respuesta del servidor
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
                    message = 'Rol no encontrado';
                    break;
                case 409:
                    message = data.message || 'El rol ya existe';
                    break;
                case 500:
                    message = 'Error en el servidor. Intenta nuevamente más tarde';
                    break;
                default:
                    message = data.message || `Error al ${action}`;
            }
        } else if (error.request) {
            // Error de red
            message = 'Error de conexión. Verifica tu conexión a internet';
        }

        error.userMessage = message;
    }
}

export default RoleService;

