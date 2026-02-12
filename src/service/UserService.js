import axios from 'axios';

/**
 * Servicio para gestión de usuarios
 * Incluye funcionalidades de CRUD y eliminado lógico
 */
class UserService {
    /**
     * Obtiene todos los usuarios activos (no eliminados)
     * @param {Object} params - Parámetros de filtrado
     * @param {string} params.search - Término de búsqueda (nombre o email)
     * @param {boolean} params.includeDeleted - Incluir usuarios eliminados
     * @returns {Promise<Array>} Lista de usuarios
     */
    static async getUsers(params = {}) {
        try {
            const response = await axios.get('/api/v1/users', {
                params: {
                    search: params.search || '',
                    includeDeleted: params.includeDeleted || false,
                    page: params.page || 0,
                    size: params.size || 50
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener usuarios');
            throw error;
        }
    }

    /**
     * Obtiene un usuario específico por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    static async getUserById(id) {
        try {
            const response = await axios.get(`/api/v1/users/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener el usuario');
            throw error;
        }
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del nuevo usuario
     * @returns {Promise<Object>} Usuario creado
     */
    static async createUser(userData) {
        try {
            const response = await axios.post('/api/v1/users', userData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'crear el usuario');
            throw error;
        }
    }

    /**
     * Actualiza un usuario existente
     * @param {number} id - ID del usuario
     * @param {Object} userData - Datos a actualizar
     * @returns {Promise<Object>} Usuario actualizado
     */
    static async updateUser(id, userData) {
        try {
            const response = await axios.put(`/api/v1/users/${id}`, userData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'actualizar el usuario');
            throw error;
        }
    }

    /**
     * Eliminado LÓGICO de usuario
     * Establece el campo deleted_at o status en false en lugar de borrar el registro
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<Object>} Resultado de la operación
     */
    static async softDeleteUser(id) {
        try {
            // Opción 1: Usar endpoint específico de soft delete
            const response = await axios.delete(`/api/v1/users/${id}/soft`);
            return response.data;
        } catch (error) {
            // Si el endpoint no existe, intentar con PATCH
            try {
                const response = await axios.patch(`/api/v1/users/${id}`, {
                    status: false,
                    deletedAt: new Date().toISOString()
                });
                return response.data;
            } catch (patchError) {
                this.handleError(patchError, 'eliminar el usuario');
                throw patchError;
            }
        }
    }

    /**
     * Restaura un usuario eliminado lógicamente
     * @param {number} id - ID del usuario a restaurar
     * @returns {Promise<Object>} Usuario restaurado
     */
    static async restoreUser(id) {
        try {
            const response = await axios.patch(`/api/v1/users/${id}/restore`, {
                status: true,
                deletedAt: null
            });
            return response.data;
        } catch (error) {
            this.handleError(error, 'restaurar el usuario');
            throw error;
        }
    }

    /**
     * Eliminado FÍSICO de usuario (solo para administradores)
     * Borra permanentemente el registro de la base de datos
     * @param {number} id - ID del usuario a eliminar permanentemente
     * @returns {Promise<void>}
     */
    static async hardDeleteUser(id) {
        try {
            const response = await axios.delete(`/api/v1/users/${id}/hard`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'eliminar permanentemente el usuario');
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
                    message = 'Usuario no encontrado';
                    break;
                case 409:
                    message = data.message || 'El usuario ya existe';
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

export default UserService;
