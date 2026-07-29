import UbicationsService from '@/service/UbicationsService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUbicationsStore = defineStore('ubications', () => {
    const ubications = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    /**
     * Carga todas las ubicaciones desde el servidor.
     */
    async function fetchUbications() {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await UbicationsService.getAll();
            ubications.value = Array.isArray(data) ? data : [];
            return data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar las ubicaciones';
            console.error('Error fetching ubications:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Busca ubicaciones para un código de barras específico.
     * @param {string} barcode 
     * @returns {Promise<Array>}
     */
    async function getUbicacionesByBarcode(barcode) {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await UbicationsService.getUbicaciones(barcode);
            return data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener ubicaciones por código de barras';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Crea una nueva ubicación.
     * @param {Object} data 
     */
    async function createUbication(data) {
        isLoading.value = true;
        error.value = null;
        try {
            const newUbication = await UbicationsService.createUbicacion(data);
            ubications.value.push(newUbication);
            return newUbication;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al crear la ubicación';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Actualiza una ubicación existente.
     * @param {number|string} id 
     * @param {Object} data 
     */
    async function updateUbication(id, data) {
        isLoading.value = true;
        error.value = null;
        try {
            const updated = await UbicationsService.updateUbicacion(id, data);
            const index = ubications.value.findIndex(u => u.id === id);
            if (index !== -1) {
                ubications.value[index] = updated;
            }
            return updated;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al actualizar la ubicación';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Elimina una ubicación.
     * @param {number|string} id 
     */
    async function deleteUbication(id) {
        isLoading.value = true;
        error.value = null;
        try {
            await UbicationsService.deleteUbicacion(id);
            ubications.value = ubications.value.filter(u => u.id !== id);
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al eliminar la ubicación';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Elimina múltiples ubicaciones de forma asíncrona en paralelo.
     * @param {Array<number|string>} ids Lista de IDs a eliminar.
     */
    async function deleteMultipleUbications(ids) {
        if (!ids || ids.length === 0) return;
        isLoading.value = true;
        error.value = null;
        try {
            await Promise.all(ids.map(id => UbicationsService.deleteUbicacion(id)));
            const idsSet = new Set(ids);
            ubications.value = ubications.value.filter(u => !idsSet.has(u.id));
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al eliminar ubicaciones';
            await fetchUbications();
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        ubications,
        isLoading,
        error,
        fetchUbications,
        getUbicacionesByBarcode,
        createUbication,
        updateUbication,
        deleteUbication,
        deleteMultipleUbications
    };
});
