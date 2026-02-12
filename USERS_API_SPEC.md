# 📋 Especificación API de Usuarios - Backend

## 🎯 Resumen

Esta guía detalla los endpoints que el backend debe implementar para el módulo de gestión de usuarios con **eliminado lógico**.

## 🗄️ Modelo de Datos

### Entidad Usuario

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private Boolean status = true;  // Para eliminado lógico
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;  // Fecha de eliminación lógica
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters y Setters
}
```

### Campos Importantes

- **status**: `true` = activo, `false` = eliminado lógicamente
- **deletedAt**: Timestamp de cuándo se eliminó (null si está activo)
- **createdAt**: Fecha de creación del usuario
- **updatedAt**: Última actualización

---

## 🔌 Endpoints Requeridos

### 1. Obtener Usuarios (GET)

**Endpoint**: `GET /api/v1/users`

**Query Parameters**:
- `search` (opcional): Búsqueda por nombre o email
- `includeDeleted` (opcional): `false` por defecto (solo usuarios activos)
- `page` (opcional): Número de página (paginación)
- `size` (opcional): Tamaño de página

**Response 200 OK**:
```json
{
    "content": [
        {
            "id": 1,
            "nombre": "Juan Pérez",
            "email": "juan@ejemplo.com",
            "status": true,
            "deletedAt": null,
            "createdAt": "2024-01-15T10:30:00",
            "updatedAt": "2024-01-15T10:30:00"
        },
        {
            "id": 2,
            "nombre": "María García",
            "email": "maria@ejemplo.com",
            "status": true,
            "deletedAt": null,
            "createdAt": "2024-01-16T14:20:00",
            "updatedAt": "2024-01-16T14:20:00"
        }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "page": 0,
    "size": 50
}
```

**Lógica del Backend**:
```java
@GetMapping
public ResponseEntity<Page<UserDTO>> getUsers(
    @RequestParam(required = false) String search,
    @RequestParam(defaultValue = "false") Boolean includeDeleted,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    
    // Por defecto, solo usuarios activos (status = true)
    Specification<User> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
        
        if (!includeDeleted) {
            predicates.add(cb.isTrue(root.get("status")));
        }
        
        if (search != null && !search.isEmpty()) {
            String searchPattern = "%" + search.toLowerCase() + "%";
            predicates.add(cb.or(
                cb.like(cb.lower(root.get("nombre")), searchPattern),
                cb.like(cb.lower(root.get("email")), searchPattern)
            ));
        }
        
        return cb.and(predicates.toArray(new Predicate[0]));
    };
    
    Page<User> users = userRepository.findAll(spec, pageable);
    return ResponseEntity.ok(users.map(this::toDTO));
}
```

---

### 2. Obtener Usuario por ID (GET)

**Endpoint**: `GET /api/v1/users/{id}`

**Response 200 OK**:
```json
{
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "status": true,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
}
```

**Response 404 Not Found**:
```json
{
    "message": "Usuario no encontrado"
}
```

---

### 3. Crear Usuario (POST)

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
    "nombre": "Pedro López",
    "email": "pedro@ejemplo.com",
    "password": "password123"
}
```

**Response 201 Created**:
```json
{
    "id": 3,
    "nombre": "Pedro López",
    "email": "pedro@ejemplo.com",
    "status": true,
    "deletedAt": null,
    "createdAt": "2024-01-17T09:15:00",
    "updatedAt": "2024-01-17T09:15:00"
}
```

**Response 400 Bad Request**:
```json
{
    "message": "Email ya existe"
}
```

**Lógica del Backend**:
```java
@PostMapping
public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
    // Verificar si el email ya existe
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BadRequestException("Email ya existe");
    }
    
    User user = new User();
    user.setNombre(request.getNombre());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setStatus(true);
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    
    User savedUser = userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedUser));
}
```

---

### 4. Actualizar Usuario (PUT)

**Endpoint**: `PUT /api/v1/users/{id}`

**Request Body**:
```json
{
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.nuevo@ejemplo.com"
}
```

**Response 200 OK**:
```json
{
    "id": 1,
    "nombre": "Juan Pérez Actualizado",
    "email": "juan.nuevo@ejemplo.com",
    "status": true,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-17T11:45:00"
}
```

---

### 5. Eliminado Lógico (DELETE - Soft Delete) ⭐

**Endpoint Opción 1 (Preferido)**: `DELETE /api/v1/users/{id}/soft`

**Endpoint Opción 2 (Alternativo)**: `PATCH /api/v1/users/{id}` con body `{"status": false, "deletedAt": "..."}`

**Response 200 OK**:
```json
{
    "message": "Usuario eliminado correctamente",
    "id": 1
}
```

**Lógica del Backend**:
```java
@DeleteMapping("/{id}/soft")
public ResponseEntity<Map<String, Object>> softDeleteUser(@PathVariable Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    
    // Eliminado lógico
    user.setStatus(false);
    user.setDeletedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    
    userRepository.save(user);
    
    Map<String, Object> response = new HashMap<>();
    response.put("message", "Usuario eliminado correctamente");
    response.put("id", id);
    
    return ResponseEntity.ok(response);
}
```

**🔴 IMPORTANTE**: 
- El usuario NO debe eliminarse físicamente de la base de datos
- Solo se actualiza `status = false` y `deletedAt = fecha_actual`
- El frontend filtrará automáticamente estos usuarios

---

### 6. Restaurar Usuario (PATCH)

**Endpoint**: `PATCH /api/v1/users/{id}/restore`

**Response 200 OK**:
```json
{
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "status": true,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-17T12:00:00"
}
```

**Lógica del Backend**:
```java
@PatchMapping("/{id}/restore")
public ResponseEntity<UserDTO> restoreUser(@PathVariable Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    
    user.setStatus(true);
    user.setDeletedAt(null);
    user.setUpdatedAt(LocalDateTime.now());
    
    User restoredUser = userRepository.save(user);
    return ResponseEntity.ok(toDTO(restoredUser));
}
```

---

### 7. Eliminado Físico (DELETE - Hard Delete) 🔴

**Endpoint**: `DELETE /api/v1/users/{id}/hard`

**Solo para administradores**: Este endpoint borra permanentemente el registro

**Response 204 No Content**

**Lógica del Backend**:
```java
@DeleteMapping("/{id}/hard")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Void> hardDeleteUser(@PathVariable Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    
    // Eliminado físico permanente
    userRepository.delete(user);
    
    return ResponseEntity.noContent().build();
}
```

---

## 🔐 Seguridad y Validaciones

### Validaciones Requeridas

1. **Email único**: Verificar que el email no exista antes de crear/actualizar
2. **Campos obligatorios**: nombre, email, password (al crear)
3. **Formato de email**: Validar formato correcto
4. **Contraseña**: Mínimo 6 caracteres, encriptar con BCrypt

### Permisos

- **Crear, editar, ver**: Usuarios autenticados
- **Eliminar (soft)**: Usuarios autenticados con rol adecuado
- **Eliminar (hard)**: Solo ADMIN
- **Restaurar**: Solo ADMIN

---

## 🧪 Ejemplo de Servicio Completo en Spring Boot

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Obtener usuarios activos
    public Page<User> getActiveUsers(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return userRepository.findByStatusTrueAndNombreContainingOrEmailContaining(
                search, search, pageable
            );
        }
        return userRepository.findByStatusTrue(pageable);
    }
    
    // Crear usuario
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email ya existe");
        }
        
        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    // Eliminado lógico
    public void softDelete(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        
        user.setStatus(false);
        user.setDeletedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
    }
    
    // Restaurar usuario
    public User restore(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        
        user.setStatus(true);
        user.setDeletedAt(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
}
```

---

## 📊 Repository con Query Methods

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    // Usuarios activos
    Page<User> findByStatusTrue(Pageable pageable);
    
    // Buscar usuarios activos con filtro
    Page<User> findByStatusTrueAndNombreContainingOrEmailContaining(
        String nombre, String email, Pageable pageable
    );
    
    // Verificar email existente
    boolean existsByEmail(String email);
    
    // Buscar por email (usuarios activos)
    Optional<User> findByEmailAndStatusTrue(String email);
}
```

---

## ✅ Checklist de Implementación

- [ ] Agregar campos `status` y `deletedAt` a la entidad User
- [ ] Implementar endpoint GET `/api/v1/users` con filtro por status
- [ ] Implementar endpoint DELETE `/api/v1/users/{id}/soft` para eliminado lógico
- [ ] Implementar endpoint PATCH `/api/v1/users/{id}/restore` para restaurar
- [ ] Configurar validaciones de email único
- [ ] Encriptar contraseñas con BCrypt
- [ ] Configurar CORS para permitir peticiones del frontend
- [ ] Agregar manejo de excepciones personalizado
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Documentar API con Swagger/OpenAPI

---

## 🔗 Referencias

- **Frontend**: El servicio `UserService.js` hace las peticiones a estos endpoints
- **Vista**: `Users.vue` consume el servicio y maneja el estado
- **Filtrado**: El frontend filtra automáticamente usuarios con `status = false`

---

## 📞 Contacto

Si tienes dudas sobre la implementación del backend, revisa:
- `src/service/UserService.js` - Servicio del frontend
- `src/views/Users.vue` - Vista de gestión de usuarios
- Este documento para la especificación completa

¡El módulo de usuarios está listo en el frontend! 🚀
