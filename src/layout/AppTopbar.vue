<script setup>
import logo from '@/assets/img/logo.jpeg';
import { useLayout } from '@/layout/composables/layout';
import { setupOneSignalForUser } from '@/service/OneSignalService';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const toast = useToast();
const notificationsPanel = ref(null);
let refreshTimer = null;

const userName = computed(() => {
    return authStore.currentUser?.nombre || 'Usuario';
});

const userEmail = computed(() => {
    return authStore.currentUser?.email || '';
});

const pendingCount = computed(() => notificationStore.totalPendientes);
const visibleNotifications = computed(() => notificationStore.notificaciones.slice(0, 10));

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

const toggleNotifications = async (event) => {
    const loadingNotifications = notificationStore.cargar(false).catch(() => {
        toast.add({ severity: 'error', summary: 'Notificaciones', detail: 'No se pudieron cargar las notificaciones', life: 3000 });
    });
    notificationsPanel.value?.toggle(event);
    await loadingNotifications;
};

const marcarLeida = async (notificacion) => {
    try {
        await notificationStore.marcarLeida(notificacion.id);
    } catch {
        toast.add({ severity: 'error', summary: 'Notificaciones', detail: 'No se pudo marcar como leída', life: 3000 });
    }
};

const marcarTodasLeidas = async () => {
    try {
        await notificationStore.marcarTodasLeidas();
    } catch {
        toast.add({ severity: 'error', summary: 'Notificaciones', detail: 'No se pudieron marcar las notificaciones', life: 3000 });
    }
};

const handleLogout = () => {
    notificationStore.limpiar();
    authStore.logout();
    
    toast.add({
        severity: 'info',
        summary: 'Sesión cerrada',
        detail: 'Has cerrado sesión correctamente',
        life: 3000
    });
    
    router.push('/v1/auth/login');
};

onMounted(async () => {
    if (!authStore.isAuthenticated) return;
    try {
        await notificationStore.cargar(false);
    } catch {
        /* Se reintenta con el intervalo. */
    }

    setupOneSignalForUser(authStore.currentUser).then((result) => {
        if (result?.ok) {
            toast.add({
                severity: 'success',
                summary: 'Notificaciones push activas',
                detail: `Recibirás avisos como ${result.role}`,
                life: 2500
            });
        } else {
            const detalle = result?.reason === 'permission-denied'
                ? 'Permite las notificaciones del navegador para recibir alertas push'
                : `No se activaron push notifications (motivo: ${result?.reason || 'desconocido'})`;
            toast.add({
                severity: 'warn',
                summary: 'Push notifications no activas',
                detail: detalle,
                life: 5000
            });
        }
    });

    refreshTimer = window.setInterval(() => {
        notificationStore.cargar(false).catch(() => {});
    }, 30000);
});

onUnmounted(() => {
    if (refreshTimer) {
        window.clearInterval(refreshTimer);
    }
});
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>

            <a href="/v1/" class="flex items-center gap-3 no-underline">
                <img
                    :src="logo"
                    alt="Logo"
                    class="h-10 w-auto logo-rounded shadow-md"
                />
                <span class="text-xl font-semibold tracking-wide text-primary">
                    Tiendas Redu!
                </span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action notification-action" @click="toggleNotifications">
                    <i class="pi pi-bell"></i>
                    <span v-if="pendingCount > 0" class="notification-badge">{{ pendingCount }}</span>
                </button>
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
          
            </div>

            <Popover ref="notificationsPanel" class="notifications-panel">
                <div class="notifications-header">
                    <div>
                        <h3>Notificaciones</h3>
                        <small>{{ pendingCount }} pendientes</small>
                    </div>
                    <Button
                        v-if="pendingCount > 0"
                        label="Leer todas"
                        size="small"
                        text
                        @click="marcarTodasLeidas"
                    />
                </div>

                <div v-if="notificationStore.isLoading" class="notifications-empty">
                    Cargando...
                </div>
                <div v-else-if="visibleNotifications.length === 0" class="notifications-empty">
                    No tienes notificaciones.
                </div>
                <div v-else class="notifications-list">
                    <div
                        v-for="notificacion in visibleNotifications"
                        :key="notificacion.id"
                        :class="['notification-item', { unread: !notificacion.leida }]"
                    >
                        <div class="notification-content">
                            <strong>{{ notificacion.titulo }}</strong>
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
                    </div>
                </div>
            </Popover>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                  
                    <button type="button" class="layout-topbar-action" @click="handleLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-action {
    position: relative;
}

.notification-badge {
    position: absolute;
    top: 0.15rem;
    right: 0.15rem;
    min-width: 1.1rem;
    height: 1.1rem;
    padding: 0 0.25rem;
    border-radius: 999px;
    background: var(--red-500);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.notifications-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.notifications-header h3 {
    margin: 0;
    font-size: 1rem;
}

.notifications-header small,
.notification-item small {
    color: var(--text-color-secondary);
}

.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: min(360px, 80vw);
}

.notification-item {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    background: var(--surface-card);
}

.notification-item.unread {
    border-color: color-mix(in srgb, var(--primary-color) 35%, var(--surface-200));
    background: color-mix(in srgb, var(--primary-color) 7%, var(--surface-card));
}

.notification-content {
    min-width: 0;
}

.notification-content p {
    margin: 0.25rem 0;
    color: var(--text-color-secondary);
    line-height: 1.35;
}

.notifications-empty {
    width: 260px;
    padding: 1rem 0;
    color: var(--text-color-secondary);
    text-align: center;
}
</style>
