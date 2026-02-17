<script setup>
import { ref, onMounted } from 'vue';
import AppMenu from './AppMenu.vue';
import { getMenu } from '@/service/MenuService';

const menuItems = ref([]);

onMounted(async () => {
    menuItems.value = await getMenu();
});
</script>

<template>
    <div class="layout-sidebar">
        <app-menu :menu-items="menuItems"></app-menu>
    </div>
</template>

<style lang="scss" scoped></style>
