<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted, ref } from 'vue';
import AppMenu from './AppMenu.vue';

const authStore = useAuthStore();
const menuItems = computed(() => authStore.menu);
const loadingMenu = ref(true);

onMounted(async () => {
    try {
        if (!authStore.menu?.length) {
            await authStore.loadUserPermissions();
        }
    } catch {
        // fallback a menú por defecto desde localStorage o vacío
    } finally {
        loadingMenu.value = false;
    }
});
</script>

<template>
    <div class="layout-sidebar">
        <app-menu :menu-items="menuItems"></app-menu>
    </div>
</template>

<style lang="scss" scoped></style>
