import SincronizacionGroupService from '@/service/SincronizacionGroupService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSincronizacionGroupStore = defineStore('sincronizacionGroup', () => {
    const grupos = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const getGrupos = computed(() => grupos.value);
    const totalGrupos = computed(() => grupos.value.length);
    const gruposActivos = computed(() => grupos.value.filter((g) => g.esActivo));

    async function fetchGrupos() {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await SincronizacionGroupService.obtenerTodos();
            grupos.value = Array.isArray(data) ? data : data.content || [];
            return grupos.value;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar los grupos';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function crearGrupo(payload) {
        isLoading.value = true;
        error.value = null;
        try {
            const nuevo = await SincronizacionGroupService.crear(payload);
            grupos.value.push(nuevo);
            return nuevo;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear el grupo';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function actualizarGrupo(id, payload) {
        isLoading.value = true;
        error.value = null;
        try {
            const actualizado = await SincronizacionGroupService.actualizar(id, payload);
            const idx = grupos.value.findIndex((g) => g.id === id);
            if (idx !== -1) {
                grupos.value[idx] = actualizado;
            }
            return actualizado;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar el grupo';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function eliminarGrupo(id) {
        isLoading.value = true;
        error.value = null;
        try {
            await SincronizacionGroupService.eliminar(id);
            grupos.value = grupos.value.filter((g) => g.id !== id);
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar el grupo';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function toggleActivoOptimista(id, esActivo) {
        const idx = grupos.value.findIndex((g) => g.id === id);
        if (idx !== -1) {
            grupos.value[idx] = { ...grupos.value[idx], esActivo };
        }
    }

    return {
        grupos,
        isLoading,
        error,
        getGrupos,
        totalGrupos,
        gruposActivos,
        fetchGrupos,
        crearGrupo,
        actualizarGrupo,
        eliminarGrupo,
        toggleActivoOptimista
    };
});
