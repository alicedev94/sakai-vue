<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted } from 'vue';
import AppMenu from './AppMenu.vue';

const authStore = useAuthStore();
const menuItems = computed(() => authStore.menu);

onMounted(async () => {
    await authStore.loadUserPermissions();
});
</script>

<template>
    <div class="layout-sidebar">
        <app-menu :menu-items="menuItems"></app-menu>
    </div>
</template>

<style lang="scss" scoped></style>
