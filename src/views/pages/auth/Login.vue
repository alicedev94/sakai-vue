<script setup>
import logoEnterprise from '@/assets/img/logo_aaea.png';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');

const router = useRouter();

function handleLogin() {
    if (email.value == 'admin') {
        if (password.value == '5*u&D9q£qx)1') {
            localStorage.setItem('userToken', password.value);
            router.push('/');
        }
    }
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex flex-col items-center">
                        <img :src="logoEnterprise" width="250" height="250" alt="logo" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl mb-4 p-3 font-mono uppercase">aa global car group REPORT</div>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo Electronico</label>
                        <InputText id="email1" type="text" placeholder="Correo Electronico" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="password" placeholder="Contraseña" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <Button @click="handleLogin" label="Iniciar sesion" class="w-full"></Button>
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
