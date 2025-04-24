<script setup>
import axios from 'axios';
import { ref } from 'vue';

import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const checked = ref(false);
const error = ref(false);

const errorMessage = ref('');

const handleLogin = () => {
    axios
        .post('http://localhost:3000/api/auth/login', {
            email: email.value,
            password: password.value
        })
        .then((response) => {
            localStorage.setItem('token', response.data.access_token);
            router.push('/');
        })
        .catch((err) => {
            error.value = true;
            if (err.response && err.response.status === 401) {
                errorMessage.value = 'Credenciales inválidas. Por favor, verifique su correo y contraseña.';
            } else {
                errorMessage.value = err.response?.data?.message || 'Error al iniciar sesión';
            }
            console.log(err);
        });
};
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex flex-col items-center justify-center gap-4 text-center mb-8">
                        <img src="@/assets/images/logo.png" alt="Logo" class="w-30 h-20 rounded-md" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido al Portal de Ingreso</div>
                        <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo Electrónico</label>
                        <InputText id="email1" type="text" placeholder="Correo Electrónico" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <Button label="Ingresar" class="w-full" @click="handleLogin"></Button>
                        <Message v-if="error" class="mt-4" severity="error">{{ errorMessage ? errorMessage : 'Error al iniciar sesión' }}</Message>
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
</style>
