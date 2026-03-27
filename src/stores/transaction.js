import TransactionService from '@/service/TransactionService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useTransactionStore = defineStore('transaction', () => {
    const transactions = ref([]);
    const totalRecords = ref(0);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const getTransactionsList = computed(() => transactions.value);

    // Actions
    async function fetchTransaccionesProductos(params) {
        loading.value = true;
        error.value = null;
        try {
            const data = await TransactionService.getTransaccionesProductos(params);
            // Extraer registros del objeto devuelto
            if (data && data.content !== undefined) {
                transactions.value = data.content;
                
                // Extraer el total priorizando el nuevo formato de Spring (data.page)
                if (data.page && data.page.totalElements !== undefined) {
                    totalRecords.value = data.page.totalElements;
                } else {
                    totalRecords.value = data.totalElements || data.totalRecords || data.total || data.count || data.content.length;
                }
            } else if (data && data.data !== undefined) {
                // Otro formato común
                transactions.value = data.data;
                totalRecords.value = data.totalElements || data.totalRecords || data.total || data.count || data.data.length;
            } else {
                // Es un array simple o ignoramos la envoltura
                transactions.value = Array.isArray(data) ? data : [];
                // Si es un array y trae la cantidad de la paginacion completa, asumimos que hay siguiente pagina si trae el size
                const size = params?.size || 10;
                if (transactions.value.length === size) {
                    // Hack: si trae la página llena, asumimos que hay otra pagina mas para habilitar el botón "Next"
                    totalRecords.value = ((params?.page || 0) + 2) * size;
                } else {
                    totalRecords.value = ((params?.page || 0) * size) + transactions.value.length;
                }
            }
            
            return data;
        } catch (err) {
            error.value = err.userMessage || 'Error al cargar transacciones';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    return {
        transactions,
        totalRecords,
        loading,
        error,
        getTransactionsList,
        fetchTransaccionesProductos
    };
});
