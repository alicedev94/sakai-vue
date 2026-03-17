<script setup>
import logo from '@/assets/img/logo.jpeg';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const userName = computed(() => {
    return authStore.currentUser?.nombre || 'Usuario';
});

const userEmail = computed(() => {
    return authStore.currentUser?.email || '';
});

const handleLogout = () => {
    authStore.logout();
    
    toast.add({
        severity: 'info',
        summary: 'Sesión cerrada',
        detail: 'Has cerrado sesión correctamente',
        life: 3000
    });
    
    router.push('/v1/auth/login');
};
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
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
          
            </div>

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
