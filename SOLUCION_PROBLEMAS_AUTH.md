# 🔧 Solución de Problemas de Autenticación

## 🐛 Problema: "Al recargar la página no carga nada"

### Síntomas
- La aplicación funciona bien después del login
- Al recargar la página (F5), la pantalla queda en blanco o no carga datos
- Tienes que limpiar el `localStorage` manualmente para que vuelva a funcionar

### Causas Comunes

#### 1. Backend No Disponible
El problema más común es que el backend no está corriendo o no responde.

**Solución**:
```bash
# Verifica que tu backend esté corriendo en el puerto 8080
# Por ejemplo, con Spring Boot:
./mvnw spring-boot:run

# O con Maven Wrapper en Windows:
mvnw.cmd spring-boot:run
```

#### 2. Token Expirado sin Refresh
El token guardado en `localStorage` expiró y el sistema no puede refrescarlo.

**Cómo funciona ahora (después del fix)**:
- ✅ El sistema detecta si el backend no responde
- ✅ Limpia automáticamente el `localStorage`
- ✅ Te redirige al login con un mensaje claro
- ✅ Ya NO necesitas limpiar manualmente el localStorage

#### 3. Datos Corruptos en localStorage
A veces el `localStorage` puede tener datos mal formateados.

**Solución Automática Implementada**:
- ✅ El store valida los datos al cargar
- ✅ Si detecta datos corruptos, los limpia automáticamente
- ✅ Logs en consola para debugging

---

## 🔍 Cómo Diagnosticar el Problema

### 1. Abre la Consola del Navegador (F12)

Busca estos mensajes:

#### ✅ Funcionamiento Normal
```
✅ Sesión guardada correctamente
🔄 Intentando refrescar token...
✅ Token refrescado correctamente
```

#### ⚠️ Backend No Disponible
```
❌ Backend no disponible: Network Error
⚠️ Backend no responde. Limpiando sesión...
```

#### ❌ Token Expirado
```
🔄 Intentando refrescar token...
❌ Error al refrescar token: 401
🚪 Cerrando sesión...
```

#### ⚠️ Datos Corruptos
```
⚠️ Usuario en localStorage corrupto, limpiando...
⚠️ Datos de autenticación incompletos, limpiando...
```

---

## 🛠️ Soluciones Implementadas

### 1. Validación Mejorada del Store

**Archivo**: `src/stores/auth.js`

**Mejoras**:
- ✅ Valida que `token` Y `refreshToken` existan juntos
- ✅ Verifica que el JSON del usuario no esté corrupto
- ✅ Limpia automáticamente datos incompletos o inválidos
- ✅ Nueva función `validateSession()` para verificar salud de la sesión

**Código**:
```javascript
// Ahora carga con validación
const storedData = loadFromStorage();
const token = ref(storedData.token);
const user = ref(storedData.user);
const refreshToken = ref(storedData.refreshToken);

// isAuthenticated ahora verifica ambos tokens
const isAuthenticated = computed(() => !!token.value && !!refreshToken.value);
```

### 2. Interceptor Mejorado de Axios

**Archivo**: `src/service/AuthService.js`

**Mejoras**:
- ✅ Detecta cuando el backend no está disponible
- ✅ Limpia la sesión automáticamente si no hay conexión
- ✅ Verifica que exista `refreshToken` antes de intentar refresh
- ✅ Logs detallados para debugging
- ✅ Evita bucles infinitos de refresh

**Flujo**:
```
1. Petición falla (401 o sin respuesta)
   ↓
2. ¿Hay respuesta del servidor?
   NO → Limpiar sesión y redirigir al login
   SÍ → Continuar
   ↓
3. ¿Tenemos refreshToken?
   NO → Limpiar sesión y redirigir al login
   SÍ → Intentar refresh
   ↓
4. ¿Refresh exitoso?
   SÍ → Actualizar token y reintentar petición
   NO → Limpiar sesión y redirigir al login
```

### 3. Router Guard Mejorado

**Archivo**: `src/router/index.js`

**Mejoras**:
- ✅ Llama a `validateSession()` antes de cada navegación
- ✅ Limpia sesión corrupta antes de redirigir
- ✅ Logs informativos en consola

### 4. Manejo de Errores en Vistas

**Archivo**: `src/views/Users.vue`

**Mejoras**:
- ✅ Mensajes de error más específicos
- ✅ Diferencia entre error de red y error de servidor
- ✅ No limpia lista si es solo un problema temporal de red

---

## 📋 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El backend está corriendo (`localhost:8080`)
- [ ] El proxy de Vite está configurado correctamente (`vite.config.mjs`)
- [ ] No hay errores en la consola del backend
- [ ] La consola del navegador muestra los logs de debug
- [ ] Has intentado hacer login después de limpiar el localStorage
- [ ] Los endpoints de autenticación responden correctamente

---

## 🧪 Cómo Probar que Funciona

### Test 1: Login Normal
1. Limpia el localStorage (F12 → Application → Local Storage → Clear)
2. Ve a `/auth/login`
3. Inicia sesión
4. Verifica que puedas navegar normalmente
5. ✅ Debería funcionar sin problemas

### Test 2: Recarga con Backend Activo
1. Con sesión activa, recarga la página (F5)
2. La página debería cargar normalmente
3. Si el token expiró, debería refrescarse automáticamente
4. ✅ Debería funcionar sin intervención manual

### Test 3: Recarga sin Backend
1. Con sesión activa, detén el backend
2. Recarga la página (F5)
3. Deberías ver: "Backend no disponible" en la consola
4. La aplicación te redirige automáticamente al login
5. ✅ Ya NO necesitas limpiar manualmente el localStorage

### Test 4: Token Expirado
1. Deja la aplicación abierta por mucho tiempo (hasta que el token expire)
2. Intenta hacer una acción (ej: navegar a Usuarios)
3. El sistema intenta refrescar el token
4. Si falla, te redirige al login automáticamente
5. ✅ No debería quedarse colgado

---

## 🔧 Comandos Útiles para Debug

### Limpiar localStorage desde Consola del Navegador
```javascript
localStorage.clear()
console.log('✅ localStorage limpiado')
```

### Ver contenido del localStorage
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))
console.log('Usuario:', JSON.parse(localStorage.getItem('user')))
```

### Verificar estado del Auth Store
```javascript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
console.log('Autenticado:', authStore.isAuthenticated)
console.log('Usuario:', authStore.currentUser)
console.log('Token válido:', authStore.validateSession())
```

---

## 🚀 Configuración del Backend

### CORS en Spring Boot

Asegúrate de tener esto en tu backend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Endpoints de Autenticación Requeridos

Tu backend debe tener estos endpoints:

```
POST /api/v1/auth/login       - Login de usuario
POST /api/v1/auth/register    - Registro de usuario
POST /api/v1/auth/refresh     - Refrescar token (requiere refresh token en header)
```

---

## 📊 Logs de Debug

Ahora verás estos logs útiles en la consola:

### Al Iniciar Sesión
```
✅ Sesión guardada correctamente
```

### Al Recargar Página
```
🔒 Ruta protegida, redirigiendo al login...
// O
👤 Usuario ya autenticado, redirigiendo al dashboard...
```

### Al Refrescar Token
```
🔄 Intentando refrescar token...
✅ Token refrescado correctamente
```

### Cuando Hay Problemas
```
⚠️ Datos de autenticación incompletos, limpiando...
❌ Backend no disponible: Network Error
❌ Error al refrescar token: 401
🚪 Cerrando sesión...
```

---

## 🎯 Resultado Final

Con estos cambios:
- ✅ Ya NO necesitas limpiar manualmente el localStorage
- ✅ El sistema detecta automáticamente cuando el backend no está disponible
- ✅ Se limpia la sesión corrupta automáticamente
- ✅ Mensajes claros en consola para debugging
- ✅ Mejor experiencia de usuario

---

## 💡 Recomendaciones

### Para Desarrollo
1. Mantén el backend corriendo mientras desarrollas el frontend
2. Revisa la consola del navegador regularmente
3. Si algo falla, lee los logs antes de limpiar el localStorage

### Para Producción
1. Considera usar `httpOnly cookies` en lugar de `localStorage` para mayor seguridad
2. Implementa un timeout de sesión por inactividad
3. Agrega logging en el backend para trackear problemas de autenticación
4. Configura un health check endpoint para verificar que el backend esté disponible

---

## 🆘 ¿Aún tienes problemas?

1. **Abre la consola del navegador** (F12) y busca mensajes de error
2. **Verifica que el backend esté corriendo** en `http://localhost:8080`
3. **Revisa los logs del backend** para ver si las peticiones llegan
4. **Intenta con Postman** hacer login directamente al endpoint del backend
5. **Verifica la configuración de CORS** en el backend

Si el problema persiste:
- Comparte los logs de la consola del navegador
- Comparte los logs del backend
- Indica en qué momento exacto ocurre el problema

---

**Fecha de actualización**: Febrero 2026  
**Archivos modificados**:
- `src/stores/auth.js`
- `src/service/AuthService.js`
- `src/router/index.js`
- `src/views/Users.vue`
