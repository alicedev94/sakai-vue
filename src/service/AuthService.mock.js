/**
 * AuthService Mock - Versión mockeada para desarrollo sin backend
 *
 * INSTRUCCIONES:
 * 1. Renombra este archivo a AuthService.js (guarda una copia del original)
 * 2. Usa esta versión para probar el frontend sin backend
 * 3. Cuando el backend esté disponible, vuelve a usar el AuthService.js original
 */

import { useAuthStore } from '@/stores/auth';

// Simular base de datos en memoria
const mockDatabase = {
    users: [
        {
            id: 1,
            nombre: 'Admin Usuario',
            email: 'admin@test.com',
            password: '123456' // En producción NUNCA guardes passwords en texto plano
        }
    ]
};

// Simular delay de red
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simular generación de tokens
const generateToken = (user) => {
    return btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 3600000 }));
};

const generateRefreshToken = (user) => {
    return btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
};

// Servicio de autenticación MOCKEADO
export default class AuthService {
    /**
     * Registro de usuario (MOCK)
     */
    static async register(userData) {
        try {
            // Simular delay de red
            await delay(500);

            // Verificar si el email ya existe
            const existingUser = mockDatabase.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());

            if (existingUser) {
                throw {
                    status: 409,
                    message: 'Este email ya está registrado'
                };
            }

            // Crear nuevo usuario
            const newUser = {
                id: mockDatabase.users.length + 1,
                nombre: userData.nombre,
                email: userData.email,
                password: userData.password
            };

            mockDatabase.users.push(newUser);

            // Generar tokens
            const token = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            // Retornar respuesta (sin password)
            return {
                token,
                refreshToken,
                user: {
                    id: newUser.id,
                    nombre: newUser.nombre,
                    email: newUser.email
                }
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Login de usuario (MOCK)
     */
    static async login(credentials) {
        try {
            // Simular delay de red
            await delay(500);

            // Buscar usuario
            const user = mockDatabase.users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

            // Verificar si existe y la contraseña es correcta
            if (!user || user.password !== credentials.password) {
                throw {
                    status: 401,
                    message: 'Credenciales incorrectas'
                };
            }

            // Generar tokens
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Retornar respuesta (sin password)
            return {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email
                }
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Refresh token (MOCK)
     */
    static async refresh() {
        try {
            // Simular delay de red
            await delay(300);

            const authStore = useAuthStore();

            // Verificar si hay refresh token
            if (!authStore.refreshToken) {
                throw {
                    status: 401,
                    message: 'No hay refresh token'
                };
            }

            // Decodificar refresh token (en un caso real verificarías firma, expiración, etc.)
            try {
                const decoded = JSON.parse(atob(authStore.refreshToken));

                // Verificar expiración
                if (decoded.exp < Date.now()) {
                    throw {
                        status: 401,
                        message: 'Refresh token expirado'
                    };
                }

                // Buscar usuario
                const user = mockDatabase.users.find((u) => u.id === decoded.userId);

                if (!user) {
                    throw {
                        status: 401,
                        message: 'Usuario no encontrado'
                    };
                }

                // Generar nuevo token
                const newToken = generateToken(user);

                return {
                    token: newToken
                };
            } catch (e) {
                throw {
                    status: 401,
                    message: 'Token inválido'
                };
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout (MOCK)
     */
    static async logout() {
        try {
            await delay(200);

            const authStore = useAuthStore();
            authStore.logout();

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Manejo de errores
     */
    static handleError(error) {
        if (error.status) {
            return error;
        }

        return {
            status: -1,
            message: error.message || 'Error desconocido',
            data: null
        };
    }
}

// Exportar también una función para agregar usuarios de prueba
export const addMockUser = (user) => {
    mockDatabase.users.push({
        id: mockDatabase.users.length + 1,
        ...user
    });
};

// Exportar función para ver usuarios (solo para debug)
export const getMockUsers = () => {
    return mockDatabase.users.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email
        // NO retornamos password
    }));
};

// Logs de información
console.log('🔧 AuthService Mock activado');
console.log('📝 Usuario de prueba: admin@test.com / 123456');
console.log('💡 Para ver usuarios: import { getMockUsers } from "@/service/AuthService"; console.log(getMockUsers())');
