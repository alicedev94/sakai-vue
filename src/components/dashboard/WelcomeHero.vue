<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const userName = computed(() => {
    const user = authStore.currentUser;
    return user?.nombre || 'Usuario';
});

const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
});

const currentDate = computed(() => {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-ES', options);
});
</script>

<template>
    <div class="welcome-hero">
        <div class="mesh-gradient"></div>
        <div class="content-wrapper">
            <div class="text-content">
                <h1 class="greeting">{{ greeting }}, <span class="user-name">{{ userName }}</span>!</h1>
                <p class="date">{{ currentDate }}</p>
                <p class="subtitle">Bienvenido a tu panel de control</p>
            </div>
            <div class="decorative-elements">
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.welcome-hero {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    padding: 3rem 2rem;
    min-height: 280px;
    display: flex;
    align-items: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        padding: 2rem 1.5rem;
        min-height: 220px;
    }
}

.mesh-gradient {
    position: absolute;
    inset: 0;
    background: 
        radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.8) 0px, transparent 50%),
        radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.6) 0px, transparent 50%),
        radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.5) 0px, transparent 50%),
        radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.7) 0px, transparent 50%),
        radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.6) 0px, transparent 50%),
        radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.8) 0px, transparent 50%),
        radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.7) 0px, transparent 50%);
    filter: blur(60px);
    animation: mesh-animation 20s ease infinite;
    opacity: 0.9;
}

@keyframes mesh-animation {
    0%, 100% {
        transform: scale(1) rotate(0deg);
    }
    33% {
        transform: scale(1.1) rotate(5deg);
    }
    66% {
        transform: scale(0.95) rotate(-5deg);
    }
}

.content-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
}

.text-content {
    flex: 1;
}

.greeting {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
}

.user-name {
    background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
}

.date {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.75rem 0;
    text-transform: capitalize;
    font-weight: 500;
}

.subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    font-weight: 400;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
}

.decorative-elements {
    position: relative;
    width: 200px;
    height: 200px;
    display: none;

    @media (min-width: 1024px) {
        display: block;
    }
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    animation: float 6s ease-in-out infinite;
}

.circle-1 {
    width: 100px;
    height: 100px;
    top: 0;
    right: 0;
    animation-delay: 0s;
}

.circle-2 {
    width: 70px;
    height: 70px;
    bottom: 20px;
    right: 60px;
    animation-delay: 2s;
}

.circle-3 {
    width: 50px;
    height: 50px;
    top: 80px;
    right: 120px;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px) scale(1);
        opacity: 0.7;
    }
    50% {
        transform: translateY(-20px) scale(1.05);
        opacity: 1;
    }
}

/* Dark mode adjustments */
:global(.dark) .welcome-hero {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

:global(.dark) .mesh-gradient {
    opacity: 0.95;
}

:global(.dark) .greeting {
    text-shadow: 0 2px 25px rgba(0, 0, 0, 0.4);
}
</style>
