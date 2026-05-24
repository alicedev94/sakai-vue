import NotificationService from '@/service/NotificationService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
    const notificaciones = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const pendientes = computed(() => notificaciones.value.filter((n) => !n.leida));
    const totalPendientes = computed(() => pendientes.value.length);

    async function cargar(soloPendientes = false) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await NotificationService.listar(soloPendientes);
            notificaciones.value = Array.isArray(data) ? data : [];
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar notificaciones';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function refrescarPendientes() {
        await cargar(true);
    }

    async function marcarLeida(id) {
        const actualizada = await NotificationService.marcarLeida(id);
        const idx = notificaciones.value.findIndex((n) => n.id === id);
        if (idx !== -1) {
            notificaciones.value[idx] = actualizada;
        }
        return actualizada;
    }

    async function marcarTodasLeidas() {
        await NotificationService.marcarTodasLeidas();
        notificaciones.value = notificaciones.value.map((n) => ({ ...n, leida: true }));
    }

    function limpiar() {
        notificaciones.value = [];
        error.value = null;
    }

    return {
        notificaciones,
        pendientes,
        totalPendientes,
        isLoading,
        error,
        cargar,
        refrescarPendientes,
        marcarLeida,
        marcarTodasLeidas,
        limpiar
    };
});
