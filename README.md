# 🛒 E-commerce Backend - Express + Prisma + PostgreSQL

Backend API REST para sistema de e-commerce con autenticación JWT y gestión de productos.

## 🚀 Características

- ✅ **Autenticación JWT** con Access + Refresh tokens
- ✅ **Cookies httpOnly** para seguridad contra XSS
- ✅ **Control de Roles** (Cliente/Admin)
- ✅ **Rate Limiting** contra fuerza bruta
- ✅ **Prisma ORM** con PostgreSQL
- ✅ **Validación de datos** con express-validator
- ✅ **CORS** configurado para Next.js frontend

---

## 📋 Requisitos

- Node.js 18.x o superior
- PostgreSQL 14+
- npm o yarn

---

## 🛠️ Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/frank-froz/e-commerce-backend-express.git
cd E-commerce-Backend-Express
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
DATABASE_URL="postgresql://usuario:password@host:5432/database"
JWT_SECRET="tu-secreto-seguro"
JWT_REFRESH_SECRET="otro-secreto-diferente"
```

### 4. Generar cliente de Prisma
```bash
npx prisma generate
```

### 5. Sincronizar base de datos
```bash
npx prisma db push
```

### 6. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

Servidor corriendo en: **http://localhost:3000**

---

## 📁 Estructura del Proyecto

```
├── src/
│   ├── controllers/        # Lógica de negocio
│   │   └── auth.controller.js
│   ├── middleware/         # Middleware de autenticación
│   │   └── auth.middleware.js
│   ├── routes/            # Definición de rutas
│   │   └── auth.routes.js
│   ├── utils/             # Utilidades
│   │   ├── auth.js        # JWT, hash, validaciones
│   │   └── prisma.js      # Cliente Prisma
│   └── server.js          # Punto de entrada
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── .env.example           # Variables de entorno ejemplo
└── package.json
```

---

## 🔐 Endpoints de Autenticación

### Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Registrar cliente |
| POST | `/api/auth/login` | Iniciar sesión |

### Protegidos (requieren autenticación)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/auth/me` | Usuario actual | Todos |
| POST | `/api/auth/logout` | Cerrar sesión | Todos |
| POST | `/api/auth/refresh` | Renovar token | Todos |
| POST | `/api/auth/admin/users/create` | Crear admin | Admin |

---

## 🧪 Pruebas

### Usuarios de prueba
Ver `PRUEBAS_AUTH.md` para credenciales de prueba

---

## 📚 Documentación

- **[AUTH_README.md](AUTH_README.md)** - Guía completa de autenticación
- **[PRUEBAS_AUTH.md](PRUEBAS_AUTH.md)** - Resultados de pruebas

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación: mínimo 8 caracteres, mayúscula, minúscula, número
- ✅ Cookies httpOnly (protección XSS)
- ✅ Rate limiting: 5 intentos login/15min
- ✅ CORS configurado
- ✅ Sanitización de inputs

---

## 🌐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://...` |
| `JWT_SECRET` | Secreto para access token | `clave-segura-64-chars` |
| `JWT_REFRESH_SECRET` | Secreto para refresh token | `otra-clave-diferente` |
| `JWT_EXPIRES_IN` | Duración access token | `30m` |
| `JWT_REFRESH_EXPIRES_IN` | Duración refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Ambiente | `development` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3001` |

---


## 📄 Licencia

Este proyecto es parte de un trabajo académico.

---