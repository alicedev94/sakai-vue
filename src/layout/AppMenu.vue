<script setup>
import { ref, computed } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

// Recibe el array plano desde el backend como prop
const props = defineProps({
    menuItems: {
        type: Array,
        default: () => []
    }
});

// Agrupa los items por categoryLabel
function groupByCategory(items) {
    const grouped = {};
    items.forEach((item) => {
        if (!grouped[item.categoryLabel]) {
            grouped[item.categoryLabel] = [];
        }
        grouped[item.categoryLabel].push({
            label: item.label,
            icon: item.icon,
            to: item.to
        });
    });
    return Object.entries(grouped).map(([label, items]) => ({ label, items }));
}

const model = computed(() => groupByCategory(props.menuItems));
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
