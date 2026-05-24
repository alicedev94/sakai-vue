import apiClient from '@/service/apiClient';

const BASE = '/operaciones/notificaciones';

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
}

export default NotificationService;
