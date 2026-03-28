import SincronizacionService from '@/service/SincronizacionService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSincronizacionStore = defineStore('sincronizacion', () => {
    // ─── State ────────────────────────────────────────────────────────────────
    const configuraciones = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // ─── Getters ──────────────────────────────────────────────────────────────
    const getConfiguraciones = computed(() => configuraciones.value);
    const totalConfiguraciones = computed(() => configuraciones.value.length);
    const configuracionesActivas = computed(() => configuraciones.value.filter((c) => c.esActivo));

    // ─── Actions ──────────────────────────────────────────────────────────────

    /**
     * Carga todas las configuraciones de sincronización desde la API.
     */
    async function fetchConfiguraciones() {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await SincronizacionService.obtenerTodos();
            configuraciones.value = Array.isArray(data) ? data : data.content || [];
            return configuraciones.value;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar las configuraciones';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Crea una nueva configuración y la añade al estado local.
     * @param {Object} payload - { departamento, intervaloMinutos, esActivo }
     */
    async function crearConfiguracion(payload) {
        isLoading.value = true;
        error.value = null;
        try {
            const nueva = await SincronizacionService.crear(payload);
            configuraciones.value.push(nueva);
            return nueva;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear la configuración';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Actualiza una configuración existente en la API y en el estado local.
     * @param {number} id
     * @param {Object} payload - { departamento, intervaloMinutos, esActivo }
     */
    async function actualizarConfiguracion(id, payload) {
        isLoading.value = true;
        error.value = null;
        try {
            const actualizada = await SincronizacionService.actualizar(id, payload);
            const idx = configuraciones.value.findIndex((c) => c.id === id);
            if (idx !== -1) {
                configuraciones.value[idx] = actualizada;
            }
            return actualizada;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar la configuración';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Elimina una configuración de la API y del estado local.
     * @param {number} id
     */
    async function eliminarConfiguracion(id) {
        isLoading.value = true;
        error.value = null;
        try {
            await SincronizacionService.eliminar(id);
            configuraciones.value = configuraciones.value.filter((c) => c.id !== id);
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar la configuración';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Actualiza el campo esActivo de una configuración localmente de forma optimista.
     * Se usa en conjunto con actualizarConfiguracion para el toggle rápido.
     * @param {number} id
     * @param {boolean} esActivo
     */
    function toggleActivoOptimista(id, esActivo) {
        const idx = configuraciones.value.findIndex((c) => c.id === id);
        if (idx !== -1) {
            configuraciones.value[idx] = { ...configuraciones.value[idx], esActivo };
        }
    }

    return {
        // State
        configuraciones,
        isLoading,
        error,
        // Getters
        getConfiguraciones,
        totalConfiguraciones,
        configuracionesActivas,
        // Actions
        fetchConfiguraciones,
        crearConfiguracion,
        actualizarConfiguracion,
        eliminarConfiguracion,
        toggleActivoOptimista
    };
});
