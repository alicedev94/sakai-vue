<script setup>
import logo from '@/assets/img/logo.jpeg';
import AuthService from '@/service/AuthService';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);

onMounted(() => {
    if (route.query.error === 'forbidden') {
        toast.add({
            severity: 'error',
            summary: 'Acceso Denegado',
            detail: 'Tu sesión no tiene permisos suficientes para realizar esta acción. Por favor, inicia sesión con una cuenta autorizada.',
            life: 6000
        });
    }
});

const handleLogin = async () => {
    // Validaciones básicas
    if (!email.value || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Campos requeridos',
            detail: 'Por favor, completa todos los campos',
            life: 3000
        });
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        toast.add({
            severity: 'warn',
            summary: 'Email inválido',
            detail: 'Por favor, ingresa un email válido',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        const credentials = {
            email: email.value,
            password: password.value
        };

        const response = await AuthService.login(credentials);

        authStore.setAuth(response);

        await authStore.loadUserPermissions();

        toast.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: `¡Hola ${response.username || 'Usuario'}!`,
            life: 3000
        });

        router.push('/v1/');
    } catch (error) {
        console.error('Error en login:', error);

        let errorMessage = 'Ocurrió un error al iniciar sesión';

        if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.message) {
            errorMessage = error.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Error de autenticación',
            detail: errorMessage,
            life: 4000
        });
    } finally {
        loading.value = false;
    }
};

// Manejar Enter para submit
const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
};
</script>

<template>
    <Toast />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center w-full px-4 sm:w-auto sm:px-0">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)" class="w-full sm:w-auto">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-6 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <img :src="logo" alt="Logo" class="w-35 h-24 mx-auto logo-rounded mb-4" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">¡Bienvenido!</div>
                        <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="email" placeholder="correo@ejemplo.com" class="w-full md:w-[30rem] mb-8" v-model="email" @keypress="handleKeyPress" :disabled="loading" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true" class="mb-4" fluid :feedback="false" @keypress="handleKeyPress" :disabled="loading"></Password>

                        <!-- <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="rememberMe" id="rememberme1" binary class="mr-2" :disabled="loading"></Checkbox>
                                <label for="rememberme1">Recuérdame</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">¿Olvidaste tu contraseña?</span>
                        </div> -->

                        <Button label="Iniciar Sesión" class="w-full mb-4 mt-4" @click="handleLogin" :loading="loading" :disabled="loading" />

                        <!-- <div class="text-center mt-4">
                            <span class="text-muted-color">¿No tienes cuenta? </span>
                            <router-link to="/v1/auth/register" class="font-medium no-underline cursor-pointer text-primary">
                                Regístrate aquí
                            </router-link>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.logo-rounded {
    border-radius: 10px;
}
</style>
