import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/v1/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/v1/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/Users.vue')
                },
                {
                    path: '/v1/roles',
                    name: 'roles',
                    component: () => import('@/views/Roles.vue')
                },
                {
                    path: '/v1/permisos',
                    name: 'permisos',
                    component: () => import('@/views/Permissions.vue')
                },
                {
                    path: '/v1/transacciones',
                    name: 'transacciones',
                    component: () => import('@/views/Transaccion.vue')
                },
                {
                    path: '/v1/movimientos',
                    name: 'movimientos',
                    component: () => import('@/views/Movimientos.vue')
                },
                {
                    path: '/v1/sincronizacion',
                    name: 'sincronizacion',
                    component: () => import('@/views/SincronizacionGroup.vue')
                },
                {
                    path: '/v1/reglas-notificacion',
                    name: 'reglasNotificacion',
                    component: () => import('@/views/ReglasNotificacion.vue')
                },
                {
                    path: '/v1/operaciones',
                    name: 'operaciones',
                    component: () => import('@/views/Operaciones.vue')
                },
                {
                    path: '/v1/escaneo-producto',
                    name: 'escaneoProducto',
                    component: () => import('@/views/EscaneoProducto.vue')
                },
                {
                    path: '/v1/preorden',
                    name: 'preorden',
                    component: () => import('@/views/PreOrdenes.vue')
                },
                {
                    path: '/v1/ubicaciones',
                    name: 'ubicaciones',
                    component: () => import('@/views/Ubications.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },
        /* {
            path: '/v1/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        }, */
        {
            path: '/v1/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/v1/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { requiresGuest: true }
        },
        /* {
            path: '/v1/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue'),
            meta: { requiresGuest: true }
        }, */
        {
            path: '/v1/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/v1/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/v1/pages/notfound'
        }
    ]
});

// Navigation Guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Validar la sesión antes de cada navegación
    const isAuthenticated = authStore.validateSession();

    // Si la ruta requiere autenticación
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('🔒 Ruta protegida, redirigiendo al login...');

        // Limpiar cualquier dato corrupto
        authStore.logout();

        // Redirigir al login
        next({
            name: 'login',
            query: { redirect: to.fullPath }
        });
    }
    // Si la ruta es solo para invitados (login, register)
    else if (to.meta.requiresGuest && isAuthenticated) {
        console.log('👤 Usuario ya autenticado, redirigiendo al dashboard...');
        // Redirigir al dashboard si ya está autenticado
        next({ name: 'dashboard' });
    }
    // Permitir navegación
    else {
        next();
    }
});

export default router;
