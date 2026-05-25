import apiClient from '@/service/apiClient';

const BASE = '/operaciones/notificaciones';
const REGLAS_BASE = '/reglas';

class NotificationService {
    static async listar(soloPendientes = false) {
        const { data } = await apiClient.get(BASE, { params: { soloPendientes } });
        return data;
    }

    static async contarPendientes() {
        const { data } = await apiClient.get(`${BASE}/conteo-pendientes`);
        return data?.total ?? 0;
    }

    static async marcarLeida(id) {
        const { data } = await apiClient.patch(`${BASE}/${id}/leer`);
        return data;
    }

    static async marcarTodasLeidas() {
        await apiClient.patch(`${BASE}/leer-todas`);
    }

    static async listarReglas() {
        const { data } = await apiClient.get(REGLAS_BASE);
        return data;
    }

    static async listarEventos() {
        const { data } = await apiClient.get(`${REGLAS_BASE}/eventos`);
        return data;
    }

    static async crearRegla(regla) {
        const { data } = await apiClient.post(REGLAS_BASE, regla);
        return data;
    }

    static async actualizarRegla(id, regla) {
        const { data } = await apiClient.put(`${REGLAS_BASE}/${id}`, regla);
        return data;
    }

    static async eliminarRegla(id) {
        await apiClient.delete(`${REGLAS_BASE}/${id}`);
    }

    static async notificarARol(rol, titulo, mensaje, tipo) {
        const { data } = await apiClient.post(`${BASE}/a-rol`, { rol, titulo, mensaje, tipo });
        return data;
    }
}

export default NotificationService;
