import OperacionesService from '@/service/OperacionesService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useOperacionesStore = defineStore('operaciones', () => {
    const ordenes = ref([]);
    const ordenActiva = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const totalRecords = ref(0);

    const totalOrdenes = computed(() => totalRecords.value || ordenes.value.length);
    const ordenesPendientes = computed(() => ordenes.value.filter((o) => o.estado === 'PENDIENTE'));
    const ordenesEnProceso = computed(() => ordenes.value.filter((o) => o.estado === 'EN_PROCESO'));
    const ordenesListas = computed(() => ordenes.value.filter((o) => o.estado === 'LISTA'));

    async function fetchOrdenes(params = {}) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await OperacionesService.listarTodas(params);
            if (data && data.content !== undefined) {
                ordenes.value = data.content;
                totalRecords.value = data.totalElements;
            } else {
                ordenes.value = Array.isArray(data) ? data : [];
                totalRecords.value = ordenes.value.length;
            }
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar las órdenes';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function cargarOrdenDetalle(id) {
        isLoading.value = true;
        try {
            const data = await OperacionesService.obtenerPorId(id);
            ordenActiva.value = data;
            const idx = ordenes.value.findIndex((o) => o.id === id);
            if (idx !== -1) ordenes.value[idx] = data;
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar la orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function iniciarOrden(id) {
        isLoading.value = true;
        try {
            const actualizada = await OperacionesService.iniciarOrden(id);
            _actualizarEnLista(actualizada);
            ordenActiva.value = actualizada;
            return actualizada;
        } catch (err) {
            error.value = err.userMessage || 'Error al iniciar la orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function escanear(ordenId, codigoBarra, cantidad = 1) {
        try {
            const resultado = await OperacionesService.escanearProducto(ordenId, codigoBarra, cantidad);
            if (resultado.orden) {
                _actualizarEnLista(resultado.orden);
                ordenActiva.value = resultado.orden;
            }
            return resultado;
        } catch (err) {
            error.value = err.userMessage || 'Error en el escaneo';
            throw err;
        }
    }

    function _actualizarEnLista(orden) {
        const idx = ordenes.value.findIndex((o) => o.id === orden.id);
        if (idx !== -1) {
            ordenes.value[idx] = orden;
        }
    }

    function limpiarOrdenActiva() {
        ordenActiva.value = null;
    }

    async function finalizarOrden(id) {
        isLoading.value = true;
        try {
            const actualizada = await OperacionesService.finalizarOrden(id);
            _actualizarEnLista(actualizada);
            ordenActiva.value = actualizada;
            return actualizada;
        } catch (err) {
            error.value = err.userMessage || 'Error al finalizar la orden';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function obtenerInventarioFinal(codigoBarra) {
        try {
            return await OperacionesService.obtenerInventarioFinal(codigoBarra);
        } catch (err) {
            console.error('Error al consultar inventario:', err);
            return 0;
        }
    }

    async function obtenerInventarioUbicacion(codigoBarra) {
        try {
            return await OperacionesService.obtenerInventarioUbicacion(codigoBarra);
        } catch (err) {
            console.error('Error al consultar inventario por ubicación:', err);
            return null;
        }
    }

    return {
        ordenes,
        ordenActiva,
        isLoading,
        error,
        totalOrdenes,
        ordenesPendientes,
        ordenesEnProceso,
        ordenesListas,
        fetchOrdenes,
        cargarOrdenDetalle,
        iniciarOrden,
        escanear,
        limpiarOrdenActiva,
        finalizarOrden,
        obtenerInventarioFinal,
        obtenerInventarioUbicacion
    };
});
