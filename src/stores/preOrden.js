import PreOrdenesService from '@/service/PreOrdenesService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const usePreOrdenStore = defineStore('preOrden', () => {
    const preOrdenes = ref([]);
    const preOrdenActiva = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const totalPreOrdenes = computed(() => preOrdenes.value.length);
    const preOrdenesPendientes = computed(() => preOrdenes.value.filter((o) => o.estado === 'PENDIENTE'));
    const preOrdenesEnProceso = computed(() => preOrdenes.value.filter((o) => o.estado === 'EN_PROCESO'));
    const preOrdenesListas = computed(() => preOrdenes.value.filter((o) => o.estado === 'LISTA'));

    async function fetchPreOrdenes() {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await PreOrdenesService.listarTodas();
            preOrdenes.value = Array.isArray(data) ? data : [];
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar las pre ordenes';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function cargarOrdenDetalle(id) {
        isLoading.value = true;
        try {
            const data = await PreOrdenesService.obtenerPorId(id);
            preOrdenActiva.value = data;
            const idx = preOrdenes.value.findIndex((o) => o.id === id);
            if (idx !== -1) preOrdenes.value[idx] = data;
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar la pre orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function iniciarOrden(id) {
        isLoading.value = true;
        try {
            const actualizada = await PreOrdenesService.iniciarOrden(id);
            _actualizarEnLista(actualizada);
            preOrdenActiva.value = actualizada;
            return actualizada;
        } catch (err) {
            error.value = err.userMessage || 'Error al iniciar la pre-orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function escanear(ordenId, codigoBarra) {
        try {
            const resultado = await PreOrdenesService.escanearProducto(ordenId, codigoBarra);
            if (resultado.orden) {
                _actualizarEnLista(resultado.orden);
                preOrdenActiva.value = resultado.orden;
            }
            return resultado;
        } catch (err) {
            error.value = err.userMessage || 'Error en el escaneo';
            throw err;
        }
    }

    function _actualizarEnLista(orden) {
        const idx = preOrdenes.value.findIndex((o) => o.id === orden.id);
        if (idx !== -1) {
            preOrdenes.value[idx] = orden;
        }
    }

    async function crearPreOrden(payload) {
        isLoading.value = true;
        try {
            const data = await PreOrdenesService.crearPreOrden(payload);
            await fetchPreOrdenes(); // Refresh the list
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al crear la pre-orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    function limpiarOrdenActiva() {
        preOrdenActiva.value = null;
    }

    async function actualizarPreOrden(id, payload) {
        isLoading.value = true;
        try {
            const data = await PreOrdenesService.actualizarPreOrden(id, payload);
            await fetchPreOrdenes();
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al actualizar la pre-orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function eliminarPreOrden(id) {
        isLoading.value = true;
        try {
            await PreOrdenesService.eliminarPreOrden(id);
            await fetchPreOrdenes();
        } catch (err) {
            error.value = err.userMessage || 'Error al eliminar la pre-orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function aprobarPreOrden(id) {
        isLoading.value = true;
        try {
            const data = await PreOrdenesService.aprobarPreOrden(id);
            await fetchPreOrdenes();
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al aprobar la pre-orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        preOrdenes,
        preOrdenActiva,
        isLoading,
        error,
        totalPreOrdenes,
        preOrdenesPendientes,
        preOrdenesEnProceso,
        preOrdenesListas,
        fetchPreOrdenes,
        cargarOrdenDetalle,
        iniciarOrden,
        escanear,
        crearPreOrden,
        actualizarPreOrden,
        eliminarPreOrden,
        aprobarPreOrden,
        limpiarOrdenActiva,
    };
});
