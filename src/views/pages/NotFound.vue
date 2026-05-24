<script setup>
</script>

<template>
  
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center"
                    style="border-radius: 53px">
                    <div class="gap-4 flex flex-col items-center">
                        <span class="text-primary font-bold text-3xl">404</span>
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-4xl lg:text-5xl mb-2">Página no encontrada</h1>
                        <span class="text-muted-color mb-8">La página que estás buscando no existe.</span>
                        <div class="col-span-12 mt-8 text-center">
                            <Button as="router-link" label="Regresar al inicio" to="/v1/" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
