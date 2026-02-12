<script setup>
import WelcomeHero from '@/components/dashboard/WelcomeHero.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
</script>

<template>
    <div class="dashboard-container">
        <WelcomeHero />
        
        <div class="grid grid-cols-12 gap-6">
            <StatsWidget />

            <div class="col-span-12 xl:col-span-6">
                <RecentSalesWidget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <NotificationsWidget />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dashboard-container {
    padding: 0;
}
</style>
