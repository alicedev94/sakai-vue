<script setup>
import { useNotificationStore } from '@/stores/notifications';
import { computed, onMounted } from 'vue';

const notificationStore = useNotificationStore();

const recientes = computed(() => notificationStore.notificaciones.slice(0, 10));
const totalPendientes = computed(() => notificationStore.totalPendientes);

const formatFecha = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const marcarLeida = (notificacion) => {
    if (!notificacion.leida) {
        notificationStore.marcarLeida(notificacion.id).catch(() => {});
    }
};

onMounted(() => {
    notificationStore.cargar(false).catch(() => {});
});
</script>

<template>
    <div class="card notifications-card">
        <div class="notifications-title">
            <div>
                <h3>Notificaciones</h3>
                <small>Últimas 10 notificaciones</small>
            </div>
            <div class="notifications-counter" :class="{ empty: totalPendientes === 0 }">
                {{ totalPendientes }}
            </div>
        </div>

        <div v-if="notificationStore.isLoading" class="notifications-empty">
            Cargando notificaciones...
        </div>
        <div v-else-if="recientes.length === 0" class="notifications-empty">
            No tienes notificaciones.
        </div>
        <ul v-else class="notifications-list">
            <li
                v-for="notificacion in recientes"
                :key="notificacion.id"
                :class="['notification-row', { unread: !notificacion.leida }]"
            >
                <div class="notification-icon">
                    <i :class="['pi', notificacion.leida ? 'pi-envelope-open' : 'pi-bell']"></i>
                </div>
                <div class="notification-body">
                    <div class="notification-heading">
                        <strong>{{ notificacion.titulo }}</strong>
                        <span v-if="!notificacion.leida" class="unread-dot"></span>
                    </div>
                    <p>{{ notificacion.mensaje }}</p>
                    <small>{{ formatFecha(notificacion.fechaCreacion) }}</small>
                </div>
                <Button
                    v-if="!notificacion.leida"
                    icon="pi pi-check"
                    rounded
                    text
                    severity="success"
                    v-tooltip.left="'Marcar como leída'"
                    @click="marcarLeida(notificacion)"
                />
            </li>
        </ul>
    </div>
</template>

<style scoped>
.notifications-card {
    margin-top: 1rem;
}

.notifications-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.notifications-title h3 {
    margin: 0;
    font-size: 1.25rem;
}

.notifications-title small,
.notification-row small {
    color: var(--text-color-secondary);
}

.notifications-counter {
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.55rem;
    border-radius: 999px;
    background: var(--red-500);
    color: #fff;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 18px color-mix(in srgb, var(--red-500) 30%, transparent);
}

.notifications-counter.empty {
    background: var(--surface-300);
    color: var(--text-color-secondary);
    box-shadow: none;
}

.notifications-list {
    display: grid;
    gap: 0.65rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.notification-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.8rem;
    border: 1px solid var(--surface-200);
    border-radius: 12px;
    background: var(--surface-card);
}

.notification-row.unread {
    border-color: color-mix(in srgb, var(--red-500) 35%, var(--surface-200));
    background: color-mix(in srgb, var(--red-500) 6%, var(--surface-card));
}

.notification-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--red-500) 12%, var(--surface-card));
    color: var(--red-500);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
}

.notification-body {
    min-width: 0;
    flex: 1;
}

.notification-heading {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.notification-body p {
    margin: 0.25rem 0;
    color: var(--text-color-secondary);
    line-height: 1.35;
}

.unread-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: var(--red-500);
    flex: 0 0 auto;
}

.notifications-empty {
    padding: 1rem 0;
    color: var(--text-color-secondary);
}
</style>
