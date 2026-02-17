import axios from 'axios';
import UserService from '@/service/UserService';

/**
 * Servicio para gestión de roles
 * Incluye funcionalidades de CRUD y eliminado lógico
 */
class UserStatusService {
    /**
     * Obtiene todos los roles activos (no eliminados)
     * @param {Object} params - Parámetros de filtrado
     * @param {string} params.search - Término de búsqueda (nombre)
     * @param {boolean} params.includeDeleted - Incluir roles eliminados
     * @returns {Promise<Array>} Lista de roles
     */
    static async getUserStatus() {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get('/api/v1/users/userStatus', { headers });
            return response.data;
        } catch (error) {
            this.handleError(error, 'obtener roles');
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

export default UserStatusService;
