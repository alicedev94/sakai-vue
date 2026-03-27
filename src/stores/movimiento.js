import MovimientoService from '@/service/MovimientoService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useMovimientoStore = defineStore('movimiento', () => {
    const movimientos = ref([]);
    const totalRecords = ref(0);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const getMovimientosList = computed(() => movimientos.value);

    // Actions
    async function fetchMovimientos(params) {
        loading.value = true;
        error.value = null;
        try {
            const data = await MovimientoService.getMovimientos(params);
            
            if (data && data.content !== undefined) {
                movimientos.value = data.content;
                
                if (data.page && data.page.totalElements !== undefined) {
                    totalRecords.value = data.page.totalElements;
                } else {
                    totalRecords.value = data.totalElements || data.totalRecords || data.total || data.count || data.content.length;
                }
            } else if (data && data.data !== undefined) {
                movimientos.value = data.data;
                totalRecords.value = data.totalElements || data.totalRecords || data.total || data.count || data.data.length;
            } else {
                movimientos.value = Array.isArray(data) ? data : [];
                const size = params?.size || 10;
                if (movimientos.value.length === size) {
                    totalRecords.value = ((params?.page || 0) + 2) * size;
                } else {
                    totalRecords.value = ((params?.page || 0) * size) + movimientos.value.length;
                }
            }
            
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar movimientos';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        movimientos,
        totalRecords,
        loading,
        error,
        getMovimientosList,
        fetchMovimientos
    };
});
