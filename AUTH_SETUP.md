# 🔐 Sistema de Autenticación - Sakai Vue

## 📋 Resumen

Se ha implementado un sistema de autenticación completo con Vue 3, PrimeVue y Pinia, listo para conectar con tu backend Spring Boot.

## 🗂️ Estructura del Proyecto

```
src/
├── stores/
│   └── auth.js                 # Store de Pinia para gestión de autenticación
├── service/
│   └── AuthService.js          # Servicio de autenticación con Axios
├── views/pages/auth/
│   ├── Login.vue               # Vista de inicio de sesión
│   ├── Register.vue            # Vista de registro
│   ├── Access.vue              # Vista de acceso denegado
│   └── Error.vue               # Vista de error
├── layout/
│   └── AppTopbar.vue           # Barra superior con logout
└── router/
    └── index.js                # Router con guards de navegación
```

## 🚀 Características Implementadas

### ✅ 1. Store de Autenticación (Pinia)
- **Archivo**: `src/stores/auth.js`
- **Estado gestionado**:
  - `token`: Token JWT del usuario
  - `refreshToken`: Token de refresco
  - `user`: Datos del usuario autenticado
  - `isAuthenticated`: Computed que verifica si hay sesión activa

### ✅ 2. Servicio de Autenticación
- **Archivo**: `src/service/AuthService.js`
- **Funciones**:
  - `register(userData)`: Registro de nuevos usuarios
  - `login(credentials)`: Inicio de sesión
  - `refresh()`: Renovación de token
  - `logout()`: Cierre de sesión

### ✅ 3. Interceptores de Axios
- **Auto-adjunta tokens**: Agrega automáticamente el token JWT a todas las peticiones
- **Refresh automático**: Si el token expira (401), intenta renovarlo automáticamente
- **Cola de peticiones**: Gestiona múltiples peticiones fallidas durante el refresh

### ✅ 4. Vistas de Autenticación

#### Login.vue
- Formulario con email y contraseña
- Validación de campos
- Checkbox "Recuérdame"
- Manejo de errores con Toast
- Link a registro

#### Register.vue
- Formulario completo de registro
- Validación de email y contraseña
- Confirmación de contraseña
- Indicador de fortaleza de contraseña
- Link a login

### ✅ 5. Router Guards
- **Rutas protegidas**: Redirige al login si no está autenticado
- **Rutas de invitados**: Redirige al dashboard si ya está autenticado
- **Parámetro redirect**: Guarda la ruta destino para redirigir después del login

### ✅ 6. Proxy de Vite
- **Configurado en**: `vite.config.mjs`
- **Proxy**: `/api` → `http://localhost:8080`
- **Logs**: Muestra las peticiones en consola para debug

### ✅ 7. Persistencia de Sesión
- Los datos se guardan en `localStorage`
- La sesión persiste al recargar la página
- Se limpia al hacer logout

### ✅ 8. Integración con PrimeVue
- Notificaciones Toast para feedback
- Componentes PrimeVue (InputText, Password, Button, etc.)
- Diseño consistente con el template Sakai

## 🔧 Configuración

### Backend Esperado

El sistema espera estos endpoints en tu backend:

#### 1. POST `/api/v1/auth/register`
```json
// Request
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}

// Response (opcional, puede devolver token o no)
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

#### 2. POST `/api/v1/auth/login`
```json
// Request
{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

#### 3. POST `/api/v1/auth/refresh`
```json
// Headers
Authorization: Bearer {refreshToken}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🏃 Cómo Usar

### 1. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:3000`

### 2. Probar con Backend Mockeado (Backend Offline)

Actualmente, el sistema está configurado pero el backend no está disponible. Para probar:

**Opción A: Crear un backend mock**
Puedes usar herramientas como:
- **JSON Server**: Mock REST API
- **MSW (Mock Service Worker)**: Interceptor de peticiones
- **Mockoon**: Servidor mock con UI

**Opción B: Modificar temporalmente AuthService.js**
```javascript
// En AuthService.js, puedes mockear las respuestas temporalmente:
static async login(credentials) {
    // Mock temporal
    return {
        token: 'mock-token-123',
        refreshToken: 'mock-refresh-token-456',
        user: {
            id: 1,
            nombre: 'Usuario Demo',
            email: credentials.email
        }
    };
}
```

### 3. Conectar con Backend Real

Cuando tu backend Spring Boot esté disponible:

1. **Asegúrate que el backend esté en el puerto 8080**
2. **Inicia el backend**
3. **El proxy de Vite redirigirá automáticamente las peticiones**

```bash
# Terminal 1: Backend Spring Boot
./mvnw spring-boot:run

# Terminal 2: Frontend Vue
npm run dev
```

## 📝 Flujo de Autenticación

### Registro de Usuario
1. Usuario completa el formulario en `/auth/register`
2. Se validan los campos (email, contraseña, etc.)
3. Se envía la petición a `/api/v1/auth/register`
4. Si el backend devuelve token, se guarda y se redirige al dashboard
5. Si no, se redirige al login para que inicie sesión

### Inicio de Sesión
1. Usuario ingresa credenciales en `/auth/login`
2. Se envía la petición a `/api/v1/auth/login`
3. Se guarda el token en el store y localStorage
4. Se redirige al dashboard o la ruta solicitada
5. Todas las peticiones subsecuentes incluyen el token automáticamente

### Renovación de Token
1. Una petición recibe un error 401 (Unauthorized)
2. El interceptor detecta el error
3. Se envía el refreshToken a `/api/v1/auth/refresh`
4. Se obtiene un nuevo token
5. Se reintenta la petición original con el nuevo token
6. Si el refresh falla, se hace logout automático

### Cierre de Sesión
1. Usuario hace clic en "Cerrar Sesión" en el AppTopbar
2. Se limpia el store y localStorage
3. Se redirige al login

## 🔐 Seguridad

### Implementaciones de Seguridad
- ✅ Tokens almacenados en localStorage (considera httpOnly cookies para producción)
- ✅ Refresh automático de tokens
- ✅ Guards de navegación
- ✅ Logout automático en errores de autenticación
- ✅ Validación de formularios en cliente
- ✅ Manejo de errores centralizado

### Mejoras Recomendadas para Producción
- [ ] Usar httpOnly cookies en lugar de localStorage
- [ ] Implementar CSRF protection
- [ ] Rate limiting en el backend
- [ ] Timeout de sesión por inactividad
- [ ] 2FA (Two-Factor Authentication)
- [ ] Verificación de email

## 🐛 Debug y Troubleshooting

### Ver peticiones del proxy
Abre la consola del terminal donde ejecutas `npm run dev`. Verás logs como:
```
Sending Request: POST /api/v1/auth/login
Received Response: 200 /api/v1/auth/login
```

### Ver errores de autenticación
Los errores se muestran automáticamente con Toast de PrimeVue.

### Verificar estado del store
En la consola del navegador:
```javascript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
console.log(authStore.token)
console.log(authStore.isAuthenticated)
console.log(authStore.currentUser)
```

### Limpiar sesión manualmente
```javascript
localStorage.clear()
// O en el navegador: Application > Storage > Local Storage > Clear All
```

## 📦 Dependencias Instaladas

```json
{
  "axios": "^1.x.x",      // Cliente HTTP
  "pinia": "^2.x.x"       // State Management
}
```

## 🎨 Personalización

### Cambiar textos
Busca y reemplaza en los archivos `.vue`:
- "¡Bienvenido!"
- "Inicia sesión para continuar"
- Mensajes de error/éxito

### Agregar campos al registro
Edita `Register.vue` y actualiza el objeto `formData`:
```javascript
const formData = ref({
    nombre: '',
    apellido: '',     // Nuevo campo
    telefono: '',     // Nuevo campo
    email: '',
    password: '',
    confirmPassword: ''
});
```

### Cambiar validaciones
Modifica la función `validateForm()` en cada vista.

### Personalizar manejo de errores
Edita `AuthService.handleError()` para adaptar los mensajes.

## 📞 Estructura de Datos del Usuario

El store espera esta estructura del backend:

```javascript
{
  token: "JWT_TOKEN_STRING",
  refreshToken: "REFRESH_TOKEN_STRING",
  user: {
    id: number,
    nombre: string,
    email: string,
    // ... otros campos opcionales
  }
}
```

Si tu backend usa una estructura diferente, ajusta el código en:
- `src/stores/auth.js` (método `setAuth`)
- `src/service/AuthService.js` (respuestas de las funciones)
- `src/layout/AppTopbar.vue` (computed `userName` y `userEmail`)

## ✨ Próximos Pasos

1. **Conectar con el backend real** cuando esté disponible
2. **Ajustar campos** del registro según tu modelo de datos
3. **Probar flujos** de login, registro y refresh
4. **Personalizar diseño** según las necesidades del proyecto
5. **Implementar recuperación de contraseña** (opcional)
6. **Agregar verificación de email** (opcional)

## 🎯 Testing

Para probar el sistema localmente SIN backend:

1. Instala **JSON Server** (opcional):
```bash
npm install -g json-server
```

2. Crea un archivo `db.json`:
```json
{
  "users": []
}
```

3. Ejecuta el mock server:
```bash
json-server --watch db.json --port 8080
```

4. Adapta temporalmente los endpoints en `AuthService.js` para que apunten a `/users`

---

## 📄 Resumen de Archivos Modificados/Creados

### Nuevos Archivos
- ✅ `src/stores/auth.js`
- ✅ `src/service/AuthService.js`
- ✅ `src/views/pages/auth/Register.vue`

### Archivos Modificados
- ✅ `src/main.js` - Agregada configuración de Pinia
- ✅ `src/router/index.js` - Agregados guards y ruta de registro
- ✅ `src/views/pages/auth/Login.vue` - Funcionalidad completa
- ✅ `src/layout/AppTopbar.vue` - Agregado logout y nombre de usuario
- ✅ `vite.config.mjs` - Configurado proxy para CORS

### Archivos Eliminados
- ❌ `src/service/CountryService.js`
- ❌ `src/service/CustomerService.js`
- ❌ `src/service/NodeService.js`
- ❌ `src/service/PhotoService.js`
- ❌ `src/service/ProductService.js`

---

¡El sistema está listo para usar! 🚀
