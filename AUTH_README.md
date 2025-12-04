# 🔐 Sistema de Autenticación - E-commerce Backend

## ✅ Implementación Completada

### 📦 Dependencias Instaladas
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Tokens JWT
- `express-validator` - Validación de datos
- `cookie-parser` - Manejo de cookies httpOnly
- `express-rate-limit` - Protección contra fuerza bruta

### 🗂️ Archivos Creados

#### Utilidades
- `src/utils/auth.js` - Funciones de hash, JWT y validaciones
- `src/utils/prisma.js` - Singleton de Prisma Client

#### Middleware
- `src/middleware/auth.middleware.js`
  - `authenticateToken` - Verificar access token
  - `authenticateRefreshToken` - Verificar refresh token
  - `requireRole()` - Verificar roles específicos
  - `optionalAuth` - Autenticación opcional

#### Controladores
- `src/controllers/auth.controller.js`
  - `register` - Registro de clientes
  - `login` - Inicio de sesión
  - `refresh` - Renovar access token
  - `logout` - Cerrar sesión
  - `getCurrentUser` - Obtener usuario actual
  - `createAdminUser` - Crear usuarios admin (solo admin)

#### Rutas
- `src/routes/auth.routes.js` - Endpoints de autenticación con validaciones y rate limiting

#### Servidor
- `src/server.js` - Configuración completa con CORS, cookies y manejo de errores

---

## 🔑 Endpoints Disponibles

### **Públicos**

#### POST `/api/auth/register`
Registrar nuevo cliente
```json
{
  "correo": "cliente@example.com",
  "contrasena": "Password123",
  "nombreCompleto": "Juan Pérez"
}
```
**Rate Limit:** 3 registros/hora por IP

#### POST `/api/auth/login`
Iniciar sesión
```json
{
  "correo": "usuario@example.com",
  "contrasena": "Password123"
}
```
**Rate Limit:** 5 intentos/15 minutos por IP

#### POST `/api/auth/refresh`
Renovar access token (requiere refresh token en cookie)

### **Protegidos** (requieren token)

#### GET `/api/auth/me`
Obtener información del usuario actual

#### POST `/api/auth/logout`
Cerrar sesión (limpia cookies)

#### POST `/api/auth/admin/users/create` (Solo Admin)
Crear usuario administrador
```json
{
  "correo": "admin@example.com",
  "contrasena": "AdminPass123",
  "nombreCompleto": "Admin Principal",
  "rol": "admin"
}
```

---

## 🚀 Configuración Inicial Requerida

### **1. Variables de Entorno**

Verifica que `.env` tenga:
```env
DATABASE_URL="tu_conexion_postgresql"
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion-2025
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=otra-clave-diferente-para-refresh-token-muy-segura-2025
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

---

## 🧪 Pruebas con cURL o Thunder Client

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Registrar Cliente
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "cliente@test.com",
    "contrasena": "Test1234",
    "nombreCompleto": "Cliente Test"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "correo": "cliente@test.com",
    "contrasena": "Test1234"
  }'
```

### 4. Obtener Usuario Actual
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

## 🔒 Seguridad Implementada

### ✅ Contraseñas
- Hash con bcrypt (10 rounds)
- Validación de fortaleza:
  - Mínimo 8 caracteres
  - 1 mayúscula
  - 1 minúscula
  - 1 número

### ✅ Tokens JWT
- **Access Token:** 30 minutos (operaciones frecuentes)
- **Refresh Token:** 7 días (mantener sesión)
- Almacenados en cookies httpOnly (protección XSS)
- SameSite: lax (protección CSRF)

### ✅ Rate Limiting
- **Login:** 5 intentos/15 min
- **Registro:** 3 intentos/hora

### ✅ Validaciones
- Email válido y único
- Sanitización de inputs
- Prisma previene SQL injection

### ✅ CORS
- Configurado para Next.js frontend
- Credentials habilitado para cookies

---

## 🎯 Integración con Frontend (Next.js)

El frontend debe configurar axios o fetch así:

```javascript
// Configuración axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // ← IMPORTANTE: permite cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (correo, contrasena) => {
  const response = await api.post('/auth/login', { correo, contrasena });
  return response.data;
};

// Request protegido (cookies se envían automáticamente)
const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
```

---

## 📝 Próximos Pasos

1. **Insertar roles en la base de datos** (Ya esta echo)
2. **Crear primer usuario admin manualmente:**
   - Primero registra un cliente normal
   - Luego en la DB, actualiza su rol a admin
   - O usa ese usuario para llamar `/api/auth/admin/users/create`

3. **Probar todos los endpoints**
4. **Integrar con el frontend Next.js**

---

## 🐛 Troubleshooting

### Error: "Rol no encontrado"
→ Ejecuta el SQL para insertar roles

### Error: "CORS"
→ Verifica `FRONTEND_URL` en `.env` coincida con tu frontend

### Tokens no funcionan
→ Verifica que frontend use `withCredentials: true`

### Rate limit bloqueando
→ Espera 15 minutos o reinicia servidor

---

## 📚 Recursos

- Documentación Prisma: https://www.prisma.io/docs
- JWT Best Practices: https://jwt.io/introduction
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
