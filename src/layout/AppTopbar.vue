<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import logoEnterprise from '@/assets/img/logo_aaea.png';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const router = useRouter();

function handleLogout() {
    localStorage.removeItem('userToken');
    router.push('/auth/login');
}
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-left">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>

            <img :src="logoEnterprise" alt="logo" class="topbar-logo-img" />

            <div class="topbar-title">aa global car group REPORT</div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <div @click="handleLogout" class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-sign-out"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.layout-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
    padding: 0 1.5rem;
    background-color: var(--surface-card);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 999;
}

.layout-topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
}

.topbar-logo-img {
    max-height: 3rem;
    width: auto;
    display: block;
    object-fit: contain;
}

.topbar-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--surface-900);
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.layout-topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.layout-topbar-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-color);
    transition:
        background-color 0.2s,
        color 0.2s;
}

.layout-topbar-action:hover {
    background-color: var(--surface-hover);
}

.layout-topbar-action i {
    font-size: 1.5rem;
}
</style>
