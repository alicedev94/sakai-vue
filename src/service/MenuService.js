// Servicio para obtener el menú desde el backend
export async function getMenu() {
    try {
        const token = localStorage.getItem('token'); // O ajusta según donde guardes el JWT
        const response = await fetch('/api/v1/auth/menu', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            // Devuelve un menú por defecto si hay error
            return [
                { categoryLabel: 'Principal', label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                { categoryLabel: 'Gestión', label: 'Usuarios', icon: 'pi pi-fw pi-users', to: '/usuarios' },
                { categoryLabel: 'Gestión', label: 'Roles', icon: 'pi pi-fw pi-shield', to: '/roles' },
                { categoryLabel: 'Gestión', label: 'Permisos', icon: 'pi pi-fw pi-lock', to: '/permisos' }
            ];
        }
    } catch (e) {
        return [];
    }
}
