<template>
    <div class="flex flex-column gap-3">
        <div class="flex justify-content-between align-items-center">
            <h2 class="m-0">Configuración de Notificaciones</h2>
            <Button label="Nueva Regla" icon="pi pi-plus" @click="abrirDialogo()" />
        </div>

        <DataTable :value="reglas" :loading="cargando" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
            <Column field="evento" header="Evento">
                <template #body="{ data }">
                    <Tag :value="data.evento" severity="info" />
                </template>
            </Column>
            <Column field="rolDestino" header="Enviar a" />
            <Column field="titulo" header="Título" />
            <Column field="mensaje" header="Mensaje" />
            <Column header="Estado">
                <template #body="{ data }">
                    <Tag :value="data.enabled ? 'Activa' : 'Inactiva'" :severity="data.enabled ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column header="Acciones">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" text rounded severity="warn" @click="abrirDialogo(data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="eliminar(data.id)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="dialogoVisible" :header="reglaEditando ? 'Editar Regla' : 'Nueva Regla'" modal style="width: 500px;">
            <div class="flex flex-column gap-3">
                <div class="flex flex-column">
                    <label class="font-bold mb-2">Evento</label>
                    <Select v-model="reglaForm.evento" :options="eventos" placeholder="Seleccionar evento" />
                </div>
                <div class="flex flex-column">
                    <label class="font-bold mb-2">Rol Destino</label>
                    <Dropdown v-model="reglaForm.rolId" :options="roles" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" />
                </div>
                <div class="flex flex-column">
                    <label class="font-bold mb-2">Título</label>
                    <InputText v-model="reglaForm.titulo" placeholder="Título de la notificación" />
                </div>
                <div class="flex flex-column">
                    <label class="font-bold mb-2">Mensaje</label>
                    <Textarea v-model="reglaForm.mensaje" rows="3" placeholder="Mensaje (usa {numero}, {departamento}, {estado})" autoResize />
                </div>
                <div class="flex align-items-center gap-2">
                    <Checkbox v-model="reglaForm.enabled" :binary="true" inputId="enabled" />
                    <label for="enabled">Activo</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" text @click="cerrarDialogo()" />
                <Button label="Guardar" @click="guardar()" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import NotificationService from '@/service/NotificationService';
import RoleService from '@/service/RoleService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Toast from 'primevue/toast';

const toast = useToast();
const cargando = ref(false);
const reglas = ref([]);
const eventos = ref([]);
const roles = ref([]);
const dialogoVisible = ref(false);
const reglaEditando = ref(null);
const reglaForm = ref({
    evento: null,
    rolId: null,
    titulo: '',
    mensaje: '',
    enabled: true
});

const cargarDatos = async () => {
    cargando.value = true;
    try {
        const [reglasData, eventosData, rolesData] = await Promise.all([
            NotificationService.listarReglas(),
            NotificationService.listarEventos(),
            RoleService.listar()
        ]);
        reglas.value = reglasData;
        eventos.value = eventosData;
        roles.value = rolesData.map(r => ({ label: r.name, value: r.id }));
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
    } finally {
        cargando.value = false;
    }
};

const abrirDialogo = (regla = null) => {
    if (regla) {
        reglaEditando.value = regla;
        reglaForm.value = {
            evento: regla.evento,
            rolId: regla.rolId,
            titulo: regla.titulo,
            mensaje: regla.mensaje,
            enabled: regla.enabled
        };
    } else {
        reglaEditando.value = null;
        reglaForm.value = { evento: null, rolId: null, titulo: '', mensaje: '', enabled: true };
    }
    dialogoVisible.value = true;
};

const cerrarDialogo = () => {
    dialogoVisible.value = false;
    reglaEditando.value = null;
};

const guardar = async () => {
    try {
        if (reglaEditando.value) {
            await NotificationService.actualizarRegla(reglaEditando.value.id, reglaForm.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Regla actualizada', life: 3000 });
        } else {
            await NotificationService.crearRegla(reglaForm.value);
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Regla creada', life: 3000 });
        }
        cerrarDialogo();
        cargarDatos();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la regla', life: 3000 });
    }
};

const eliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta regla?')) return;
    try {
        await NotificationService.eliminarRegla(id);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Regla eliminada', life: 3000 });
        cargarDatos();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la regla', life: 3000 });
    }
};

onMounted(cargarDatos);
</script>