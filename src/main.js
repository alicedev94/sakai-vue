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

app.use(router);

const dkPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.950}',
            100: '{blue.950}',
            200: '{blue.950}',
            300: '{blue.950}',
            400: '{blue.950}',
            500: '{blue.950}',
            600: '{blue.950}',
            700: '{blue.950}',
            800: '{blue.950}',
            900: '{blue.950}',
            950: '{blue.950}'
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
