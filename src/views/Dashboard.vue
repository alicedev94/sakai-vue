<script setup>
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import WelcomeHero from '@/components/dashboard/WelcomeHero.vue';
</script>

<template>
    <div class="dashboard-container">
        <WelcomeHero />
        <NotificationsWidget />
    </div>
</template>

<style scoped lang="scss">
.dashboard-container {
    padding: 0;
}
</style>
