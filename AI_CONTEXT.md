# 🤖 AI Context & Project Guidelines (Frontend)

Este archivo contiene el contexto técnico y las reglas de arquitectura para los asistentes de IA que generen código para este proyecto frontend. **Lee esto antes de procesar cualquier requerimiento.**

Actúa como un **Desarrollador Frontend Senior** experto en Vue.js (Vue 3, Composition API), Pinia, Axios y PrimeVue.

---

## 1. Stack Tecnológico

| Capa               | Tecnología                                                                |
|---------------------|--------------------------------------------------------------------------|
| **Framework**       | Vue 3.4+ (`<script setup>`, Composition API)                            |
| **State Management**| Pinia 3+ (stores con `defineStore` + Composition API style)             |
| **HTTP Client**     | Axios 1.13+ con instancia centralizada (`apiClient.js`)                 |
| **UI Library**      | PrimeVue 4.3+ (tema Aura customizado con paleta verde)                  |
| **Icons**           | PrimeIcons 7+                                                           |
| **Router**          | Vue Router 4+ (`createWebHistory`, lazy loading)                        |
| **Build Tool**      | Vite 5+ con auto-import de componentes PrimeVue                        |
| **CSS**             | SCSS scoped + Tailwind CSS 3 (con `tailwindcss-primeui`)                |
| **Lint / Format**   | ESLint 8 + Prettier 3                                                   |

---

## 2. Estructura del Proyecto

```
sakai-vue/
├── index.html
├── vite.config.mjs            # Proxy /api → backend, port 3000, base /v1/
├── package.json
├── .env                       # VITE_API_BASE_URL (opcional, proxy preferido)
│
├── src/
│   ├── main.js                # App bootstrap: Pinia → Router → PrimeVue (Aura/green)
│   ├── App.vue                # Root component (limpio, solo <RouterView>)
│   │
│   ├── assets/
│   │   └── styles.scss        # Estilos globales
│   │
│   ├── router/
│   │   └── index.js           # Rutas con guards (requiresAuth / requiresGuest)
│   │
│   ├── service/               # Capa HTTP (Axios) — una clase estática por dominio
│   │   ├── apiClient.js       # Instancia Axios + interceptors (JWT + refresh token)
│   │   ├── AuthService.js     # Login, register, refresh, logout
│   │   ├── UserService.js     # CRUD usuarios (soft/hard delete)
│   │   ├── RoleService.js     # CRUD roles
│   │   ├── PermissionService.js
│   │   ├── SincronizacionService.js   # CRUD sincronización + getDepartamentos
│   │   ├── TransactionService.js
│   │   ├── MovimientoService.js
│   │   ├── UserStatusService.js
│   │   ├── MenuService.js     # GET menú dinámico desde backend
│   │   └── ProductService.js
│   │
│   ├── stores/                # Pinia stores — uno por dominio
│   │   ├── auth.js            # Token, user, menu, role, permissions + localStorage
│   │   ├── user.js
│   │   ├── role.js
│   │   ├── permission.js
│   │   ├── sincronizacion.js  # Config sync: CRUD + toggleActivoOptimista
│   │   ├── transaction.js
│   │   └── movimiento.js
│   │
│   ├── views/                 # Vistas de página (una por ruta)
│   │   ├── Dashboard.vue
│   │   ├── Users.vue          # CRUD usuarios con DataTable, Dialog, soft delete
│   │   ├── Roles.vue          # CRUD roles con permisos ManyToMany
│   │   ├── Permissions.vue    # CRUD permisos
│   │   ├── Transaccion.vue    # Tabla con filtro select tipoDocumento
│   │   ├── Movimientos.vue    # Tabla movimientos con filtros
│   │   ├── Sincronizacion.vue # Panel automatización: CRUD + toggle + badges
│   │   └── pages/
│   │       ├── auth/          # Login.vue, Register.vue, Access.vue, Error.vue
│   │       ├── Landing.vue
│   │       ├── NotFound.vue
│   │       └── Empty.vue
│   │
│   ├── layout/                # Shell de la aplicación
│   │   ├── AppLayout.vue      # Layout principal (sidebar + topbar + content)
│   │   ├── AppTopbar.vue      # Barra superior con usuario y logout
│   │   ├── AppSidebar.vue     # Sidebar wrapper
│   │   ├── AppMenu.vue        # Menú dinámico (agrupado por categoryLabel)
│   │   ├── AppMenuItem.vue    # Item recursivo del menú
│   │   ├── AppFooter.vue
│   │   ├── AppConfigurator.vue
│   │   └── composables/
│   │       └── layout.js      # Composable de estado del layout
│   │
│   └── components/            # Componentes reutilizables
│       ├── FloatingConfigurator.vue
│       ├── dashboard/         # Widgets del dashboard
│       └── landing/           # Componentes de la landing page
```

---

## 3. Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vista (.vue)                            │
│  <script setup> con refs, computed, funciones handler           │
│  Usa el store para leer/mutar estado reactivo                   │
│  Muestra toasts (PrimeVue ToastService) en éxito/error          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ import useXxxStore()
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Pinia Store (.js)                           │
│  State: refs reactivos (configuraciones, isLoading, error)      │
│  Getters: computed derivados                                    │
│  Actions: funciones async con try/catch + isLoading guard       │
│  Llama al Service para HTTP, actualiza state al retorno         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ import XxxService
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Service (clase estática)                       │
│  Métodos estáticos: static async getAll(), create(), etc.       │
│  Usa apiClient (Axios) — NO accede a stores ni DOM              │
│  handleError() centralizado: adjunta error.userMessage          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ import apiClient
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   apiClient.js (Axios)                          │
│  baseURL: /api/v1 (proxy Vite → backend)                        │
│  Interceptor REQUEST: adjunta Bearer token (store o localStorage)│
│  Interceptor RESPONSE: refresh token (401), redirect (403),     │
│    queue de peticiones durante el refresh                        │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de datos para una acción CRUD

```
Usuario clickea "Guardar"
  → Vista: guardar() valida campos → store.crearConfiguracion(payload)
    → Store: isLoading=true → SincronizacionService.crear(payload)
      → Service: apiClient.post('/sincronizacion', payload)
        → apiClient: adjunta JWT, envía request
        ← Response 201: devuelve data
      ← Service: return response.data
    ← Store: push al array reactivo, isLoading=false, return
  ← Vista: toast success, cerrar dialog
  
  (en caso de error):
      ← Service: handleError(error) → error.userMessage = "Ya existe..."
    ← Store: isLoading=false, throw err
  ← Vista: toast error con err.userMessage
```

---

## 4. Patrones y Convenciones

### 4.1 Servicios HTTP

- **Patrón:** Clases estáticas con `export default class XxxService`.
- **Import:** Los stores importan `import XxxService from '@/service/XxxService'`.
- **apiClient:** Todos los servicios usan la instancia compartida `apiClient`.
- **handleError():** Método estático que extrae el mensaje del backend y lo adjunta en `error.userMessage`. El store y la vista leen `err.userMessage` para mostrar al usuario.
- **Convención de respuesta:** Los servicios retornan `response.data` (sin el wrapper de Axios), excepto cuando se necesita acceso a headers o status.

```js
// Patrón estándar de un método de servicio
static async obtenerTodos() {
    try {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    } catch (error) {
        this.handleError(error, 'obtener configuraciones');
        throw error;  // ← siempre relanzar para que el store lo capture
    }
}
```

### 4.2 Pinia Stores

- **Estilo:** Composition API (`defineStore('name', () => { ... })`). **No usar Options API.**
- **State mínimo:** `items` (ref), `isLoading` (ref), `error` (ref).
- **Getters:** `computed()` derivados del state.
- **Actions:** Funciones `async` con patrón:
  ```
  isLoading = true → try { await Service.xxx() } catch { error = err.userMessage; throw err } finally { isLoading = false }
  ```
- **Actualización optimista:** Se permite (ej. `toggleActivoOptimista`) siempre que se revierta en el catch.

### 4.3 Vistas (.vue)

- **Siempre `<script setup>`**. Prohibido Options API.
- **Estructura del script:**
  1. Imports
  2. Composables (`useToast`, `useConfirm`, `useXxxStore`)
  3. State de la vista (`ref`, constantes)
  4. Computed
  5. Helpers / formatters
  6. Acciones CRUD (funciones async)
  7. `onMounted`
- **Componentes PrimeVue:** Auto-importados via `unplugin-vue-components` + `PrimeVueResolver`. No requieren import manual.
- **Estilos:** `<style scoped lang="scss">`. Usar variables CSS de PrimeVue (`var(--primary-color)`, `var(--surface-card)`, etc.).
- **Notificaciones:** Siempre `toast.add({ severity, summary, detail, life })` vía `useToast()`. Nunca `alert()` ni `console.log` al usuario.
- **Validación de formularios:** Manual con flag `submitted` y `:invalid` binding en cada campo. Los mensajes de validación se muestran con `<small class="p-error">`.

### 4.4 Tabla CRUD (Patrón Vista Estándar)

Todas las vistas CRUD siguen este template:

```
┌─ Card ──────────────────────────────────────────────────────┐
│  Header (título + botón "Nuevo")                            │
│  Stats Banner (opcional: contadores)                        │
│  Toolbar (botón refresh + búsqueda)                         │
│  DataTable (paginada, sorteable, stripedRows)               │
│    → Columnas con templates #body personalizados            │
│    → Columna Acciones: botones Editar / Eliminar            │
│  Dialog Crear/Editar (form + footer con Cancelar/Guardar)   │
│  Dialog Confirmar Eliminación                               │
│  ConfirmDialog + Toast (globales)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Autenticación y Seguridad

### Flujo JWT

```
Login → AuthService.login({email, password})
  ← Backend devuelve { token, refreshToken, user }
  → authStore.setAuth(data) → persiste en localStorage

Cada request:
  → apiClient interceptor: lee token del store (o localStorage como fallback)
  → Adjunta header: Authorization: Bearer <token>

Token expirado (401):
  → apiClient interceptor: intenta POST /auth/refresh con refreshToken
  → Cola las peticiones que fallen durante el refresh
  ← Nuevo token → actualiza store y localStorage → retries queued requests

Refresh fallido:
  → authStore.logout() → limpia localStorage y state
  → Redirect a /v1/auth/login
```

### Navigation Guards (Router)

| Meta              | Comportamiento                                                   |
|-------------------|------------------------------------------------------------------|
| `requiresAuth`    | Si no autenticado → redirect a login con `?redirect=fullPath`    |
| `requiresGuest`   | Si ya autenticado → redirect a dashboard (evita doble login)     |

### Menú Dinámico

- El backend provee el menú como array plano con `categoryLabel`, `label`, `icon`, `to`.
- `AppMenu.vue` agrupa por `categoryLabel` y renderiza recursivamente con `AppMenuItem.vue`.
- Menú persistido en `localStorage.menu` y estado en `authStore.menu`.

---

## 6. Configuración del Entorno

### Vite Dev Server

| Config       | Valor                                                    |
|--------------|----------------------------------------------------------|
| `port`       | 3000                                                     |
| `base`       | `/v1/`                                                   |
| `proxy`      | `/api` → `http://localhost:8080` (o IP remoto)           |

### Variables de Entorno (.env)

```
VITE_API_BASE_URL=http://localhost:8080/api/v1   # Opcional: si se omite, usa proxy
```

> ⚠️ **Proxy preferido:** En desarrollo usar el proxy de Vite (`/api`). Solo usar `VITE_API_BASE_URL` para conectar a un backend remoto sin proxy.

### PrimeVue Theme

- Base: **Aura** (de `@primeuix/themes`)
- Customización: paleta `primary` sobrescrita con tonos **green** (`{green.100}` a `{green.950}`)
- Dark mode: activado vía selector `.app-dark` (toggle en `AppConfigurator`)

---

## 7. Rutas Principales

| Ruta                    | Vista                | Descripción                          |
|-------------------------|----------------------|--------------------------------------|
| `/v1/`                  | `Dashboard.vue`      | Panel principal                      |
| `/v1/usuarios`          | `Users.vue`          | CRUD de usuarios                     |
| `/v1/roles`             | `Roles.vue`          | CRUD de roles con permisos           |
| `/v1/permisos`          | `Permissions.vue`    | CRUD de permisos                     |
| `/v1/transacciones`     | `Transaccion.vue`    | Tabla de transacciones               |
| `/v1/movimientos`       | `Movimientos.vue`    | Tabla de movimientos                 |
| `/v1/sincronizacion`    | `Sincronizacion.vue` | Panel de automatización              |
| `/v1/auth/login`        | `Login.vue`          | Inicio de sesión                     |
| `/v1/auth/register`     | `Register.vue`       | Registro de usuario                  |

---

## 8. Relación con el Backend

### API Base

Todas las peticiones apuntan a `/api/v1/*` a través del proxy de Vite o la variable `VITE_API_BASE_URL`.

### Módulos y Endpoints Principales

| Módulo Frontend       | Endpoint Backend              | Métodos                       |
|-----------------------|-------------------------------|-------------------------------|
| `AuthService`         | `/api/v1/auth/*`              | POST login, register, refresh |
| `UserService`         | `/api/v1/users/*`             | GET, POST, PUT, DELETE, PATCH |
| `RoleService`         | `/api/v1/roles/*`             | GET, POST, PUT, DELETE        |
| `PermissionService`   | `/api/v1/permissions/*`       | GET, POST, PUT, DELETE        |
| `SincronizacionService`| `/api/v1/sincronizacion/*`   | GET, POST, PUT, DELETE        |
| `TransactionService`  | `/api/v1/transacciones/*`     | GET                           |
| `MovimientoService`   | `/api/v1/movimientos/*`       | GET                           |
| `MenuService`         | `/api/v1/auth/menu`           | GET                           |

### Estructura de Respuesta de Error del Backend

```json
{
    "message": "Ya existe una sincronización para el departamento 09 ROPA"
}
```

Los servicios extraen `error.response.data` directamente y lo asignan a `error.userMessage`.

---

## 9. Reglas de Generación de Código

### General

1. **Minimalismo:** Cero saludos o explicaciones teóricas. Solo el código que cambia.
2. **Idioma:** Nombres de variables y funciones en **español** (como el resto del codebase): `cargarDatos`, `abrirNuevo`, `eliminar`, `configuraciones`, `isLoading`.
3. **Alias de imports:** Siempre usar `@/` para referir a `src/`. Nunca rutas relativas largas (`../../`).

### Componentes Vue

1. **`<script setup>`** obligatorio. Prohibido `export default { }` (Options API).
2. **Auto-import:** Los componentes PrimeVue (`DataTable`, `Column`, `Dialog`, `Button`, `Select`, `InputText`, etc.) se auto-importan. **No agregarlos en imports manuales.**
3. **Refs y Computed:** Usar `ref()` para estado local, `computed()` para derivados. No usar `reactive()` salvo objetos complejos anidados.
4. **Desestructuración de stores:** Acceder vía `store.propiedad`, **no** desestructurar (`const { x } = store`) para mantener reactividad.
5. **Estilos:** `<style scoped lang="scss">`. Usar variables CSS de PrimeVue para colores (`--primary-color`, `--surface-card`, `--green-500`, `--red-500`, etc.). No hardcodear hex.
6. **Responsive:** Usar `clamp()`, media queries y breakpoints de PrimeVue Dialog (`:breakpoints="{ '1199px': '75vw', '575px': '92vw' }"`) .

### Servicios

1. **Clase estática** con `export default class XxxService`.
2. **`apiClient`** como única dependencia HTTP. No crear instancias de Axios ad-hoc.
3. **`handleError(error, action)`** en cada servicio. Asignar `error.userMessage` con el mensaje legible. Usar `error.response.data` del backend.
4. **Relanzar siempre:** Después de `handleError`, siempre `throw error` para que el store lo capture.
5. **No acceder a stores ni DOM** desde los servicios. Los servicios son capa pura de red.

### Pinia Stores

1. **Composition API:** `defineStore('name', () => { ... })`.
2. **Tripleta obligatoria de state:** `items` (ref array), `isLoading` (ref boolean), `error` (ref string|null).
3. **`isLoading` guard:** Activar ANTES del try, desactivar en `finally`. **Nunca** olvidar el `finally`.
4. **No tragarse errores:** Siempre hacer `throw err` después de capturar en catch para que la vista pueda mostrar el toast.
5. **Actualización de estado local** tras cada mutación exitosa (push, splice, replace en el array reactivo). No refetch completo salvo que sea necesario.

### Notificaciones al Usuario

1. **Toast de PrimeVue.** Severidades: `success` (verde), `info` (azul), `warn` (amarillo), `error` (rojo).
2. **Siempre con `life`:** 2500-3000ms para éxito, 4000-5000ms para errores.
3. **Nunca** silenciar errores de API. Si una petición falla, el usuario **debe** ver un toast.
4. **Dialogs de confirmación:** Usar `<Dialog>` propio con footer de botones. El botón destructivo muestra severidad `danger` y loading state.

---

## 10. Componentes PrimeVue Comunes

| Componente       | Uso típico                                                |
|------------------|-----------------------------------------------------------|
| `DataTable`      | Tablas paginadas con sort, filtros, stripedRows           |
| `Column`         | Columnas con slot `#body` para render custom              |
| `Dialog`         | Modales de formulario (crear/editar) y confirmación       |
| `Button`         | Acciones con `icon`, `severity`, `outlined`, `rounded`    |
| `InputText`      | Campos de texto con `:invalid` binding                    |
| `InputNumber`    | Campos numéricos con `showButtons`, `min`, `max`          |
| `Select`         | Dropdowns con `optionLabel`, `optionValue`, `:filter`     |
| `ToggleSwitch`   | Toggle de estados booleanos (activo/inactivo)             |
| `Toolbar`        | Barra de herramientas (slots `#start`, `#end`)            |
| `Avatar`         | Iniciales en tablas (`:label`, `shape="circle"`)          |
| `Toast`          | Notificaciones (via `ToastService` + `useToast()`)        |
| `ConfirmDialog`  | Confirmación (via `ConfirmationService` + `useConfirm()`) |
| `IconField`      | Wrapper para inputs con icono                             |

---

**Instrucción final para la IA:** Si has leído y comprendido este contexto, responde únicamente con: *"Contexto asimilado."*.
