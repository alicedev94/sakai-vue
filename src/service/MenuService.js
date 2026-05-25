import apiClient from '@/service/apiClient';

// Servicio para obtener el menú desde el backend
export async function getMenu() {
    try {
        const response = await apiClient.get('/auth/menu');
        return response.data;
    } catch (e) {
        // Devuelve un menú por defecto si hay error
        return [
            { categoryLabel: 'Principal', label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/v1/' },
            { categoryLabel: 'Gestión', label: 'Usuarios', icon: 'pi pi-fw pi-users', to: '/v1/usuarios' },
            { categoryLabel: 'Gestión', label: 'Roles', icon: 'pi pi-fw pi-shield', to: '/v1/roles' },
            { categoryLabel: 'Gestión', label: 'Permisos', icon: 'pi pi-fw pi-lock', to: '/v1/permisos' },
            { categoryLabel: 'Gestión', label: 'Notificaciones', icon: 'pi pi-fw pi-bell', to: '/v1/reglas-notificacion' }
        ];
    }
}

