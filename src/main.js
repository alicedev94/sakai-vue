import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const dkPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{green.100}',
            100: '{green.200}',
            200: '{green.300}',
            300: '{green.400}',
            400: '{green.500}',
            500: '{green.600}', // tono principal, verde fuerte
            600: '{green.700}',
            700: '{green.800}',
            800: '{green.900}',
            900: '{green.950}',
            950: '{green.950}'
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: dkPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
