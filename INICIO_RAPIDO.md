# 🚀 Inicio Rápido - Sistema de Autenticación

## ⚡ En 3 Pasos

### 1️⃣ El servidor ya está corriendo
```
✅ http://localhost:3000/
```

### 2️⃣ Elige cómo probar

#### Opción A: Con Mock (Sin Backend) ⭐ Recomendado
```bash
# 1. Renombra los archivos para usar el mock
cd src/service
ren AuthService.js AuthService.real.js
ren AuthService.mock.js AuthService.js

# 2. Recarga el navegador
```

**Credenciales de prueba:**
- Email: `admin@test.com`
- Password: `123456`

#### Opción B: Con tu Backend Real
```bash
# 1. Asegúrate de que tu backend Spring Boot esté corriendo en el puerto 8080
# 2. Las peticiones se redirigirán automáticamente gracias al proxy de Vite
```

### 3️⃣ Abre el navegador y prueba

```
http://localhost:3000/auth/login
```

---

## 🎯 Rutas Disponibles

| Ruta | Descripción | Requiere Auth |
|------|-------------|---------------|
| `/auth/login` | Inicio de sesión | ❌ No |
| `/auth/register` | Registro de usuario | ❌ No |
| `/` | Dashboard | ✅ Sí |
| `/auth/access` | Acceso denegado | ❌ No |

---

## 🧪 Flujo de Prueba

### Test 1: Registro de Usuario
1. Ve a: `http://localhost:3000/auth/register`
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: mínimo 6 caracteres
   - Confirmar Contraseña: igual a la anterior
3. Haz clic en "Crear Cuenta"
4. ✅ Deberías ser redirigido al dashboard automáticamente

### Test 2: Inicio de Sesión
1. Ve a: `http://localhost:3000/auth/login`
2. Ingresa credenciales:
   - Mock: `admin@test.com` / `123456`
   - Backend: tus credenciales reales
3. Haz clic en "Iniciar Sesión"
4. ✅ Deberías ver el dashboard

### Test 3: Persistencia de Sesión
1. Estando logueado, recarga la página (F5)
2. ✅ Deberías seguir logueado

### Test 4: Protección de Rutas
1. Sin estar logueado, intenta acceder a: `http://localhost:3000/`
2. ✅ Deberías ser redirigido al login

### Test 5: Logout
1. Estando logueado, busca tu nombre en la barra superior derecha
2. Haz clic en "Cerrar Sesión"
3. ✅ Deberías ser redirigido al login

---

## 🎨 Interfaz

### Login
![Login Screenshot](docs/login-preview.png)
- Email
- Contraseña
- Checkbox "Recuérdame"
- Botón "Iniciar Sesión"
- Link a registro

### Register
![Register Screenshot](docs/register-preview.png)
- Nombre completo
- Email
- Contraseña (con indicador de fortaleza)
- Confirmar contraseña
- Botón "Crear Cuenta"
- Link a login

### Dashboard (Protegido)
- Barra superior con tu nombre
- Botón "Cerrar Sesión"
- Contenido del dashboard

---

## 🔍 Verificar el Estado

### En la Consola del Navegador (F12):

```javascript
// Ver datos del localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Ver estado del store (después de importar)
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
console.log('Autenticado:', authStore.isAuthenticated);
console.log('Usuario actual:', authStore.currentUser);
```

### En las DevTools:
1. Abre DevTools (F12)
2. Ve a Application > Storage > Local Storage
3. Verifica que existan:
   - `token`
   - `refreshToken`
   - `user`

---

## 🐛 Problemas Comunes

### "No se pudo conectar con el servidor"
✅ **Solución**: Usa la versión mock del AuthService

### "Credenciales incorrectas"
✅ **Solución con mock**: `admin@test.com` / `123456`
✅ **Solución con backend**: Verifica que el usuario exista en la BD

### El formulario no hace nada
✅ **Solución**: Abre la consola (F12) y busca errores

### La página se queda en blanco
✅ **Solución**: Verifica que no haya errores de compilación en la terminal donde corre `npm run dev`

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `AUTH_SETUP.md` - Documentación técnica completa
- `RESUMEN_IMPLEMENTACION.md` - Resumen de la implementación

---

## 🎉 ¡Listo!

El sistema está completamente funcional y listo para usar.

**Servidor corriendo en**: http://localhost:3000/

**Próximo paso**: Abre el navegador y empieza a probar 🚀
