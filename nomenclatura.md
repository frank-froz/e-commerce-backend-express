<div align="center">

# 📘 Guía de Nomenclatura y Buenas Prácticas

### *Tu manual definitivo para código limpio y profesional* 🚀

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Maintenance](https://img.shields.io/badge/maintained-yes-brightgreen.svg)

**Variables** · **Ramas** · **Commits** · **Archivos .env**

---

Este documento define un estándar consistente para mantener la **claridad**, **escalabilidad** y **mantenibilidad** en cualquier proyecto.

Incluye reglas para nombrado de variables, ramas, commits y manejo de variables de entorno.

</div>

---

## 📌 1. Nombres de Variables

> 💡 **Tip:** Un buen nombre es autodocumentado

### 🔹 Reglas Generales

✅ Usa nombres claros y descriptivos, en español.

✅ Evita abreviaturas innecesarias.

✅ Sigue un estándar uniforme.

### 🟦 Formatos recomendados
| Tipo | Formato | Ejemplo |
|------|---------|---------|
| 🔤 Variables | `camelCase` | `numeroClientes` |
| ⚡ Funciones | `camelCase` | `calcularTotal()` |
| 🏗️ Clases / Modelos | `PascalCase` | `Usuario`, `GestorPagos` |
| 🔒 Constantes | `MAYÚSCULAS_CON_GUIONES` | `MAXIMO_INTENTOS` |

---

## 📁 2. Nombres de Ramas (Git)

> 🌿 **Git Flow:** Organiza tu trabajo con prefijos claros

Usa **kebab-case** y prefijos según la naturaleza del cambio:

| Prefijo | Uso | Emoji |
|---------|-----|-------|
| `feature/` | Nueva funcionalidad | ✨ |
| `fix/` | Corrección de bugs | 🐛 |
| `hotfix/` | Parche urgente | 🚑 |
| `refactor/` | Cambios internos sin alterar funcionalidad | ♻️ |
| `docs/` | Documentación | 📝 |
| `style/` | Cambios de formato | 💄 |
| `test/` | Pruebas | 🧪 |
| `perf/` | Optimización | ⚡ |

### ✅ Ejemplos

```bash
feature/registro-usuarios
fix/error-validacion-formulario
refactor/servicio-pedidos
docs/actualizar-guia-de-instalacion
```

---

## 📝 3. Mensajes de Commit

> 📜 **Conventional Commits:** Historial limpio y semántico

### 📐 Formato recomendado:

```
tipo(sección): descripción breve
```

### 🏷️ Tipos permitidos

| Tipo | Significado | Emoji |
|------|-------------|-------|
| `feat` | Nueva funcionalidad | ✨ |
| `fix` | Corrección | 🐛 |
| `refactor` | Mejora interna | ♻️ |
| `docs` | Documentación | 📚 |
| `style` | Estilo y formato | 💄 |
| `perf` | Performance | ⚡ |
| `test` | Pruebas | ✅ |
| `chore` | Mantenimiento | 🔧 |

### 🌟 Ejemplos generales

```bash
feat(api-usuarios): agregar endpoint de registro
fix(ui-login): corregir validación de contraseña
refactor(servicio-pagos): optimizar cálculos
docs(readme): agregar sección de instalación
```

### 📦 Ejemplos específicos por secciones
#### 🎨 Frontend
```bash
feat(ui-header): agregar menú desplegable
fix(form-registro): corregir error en campos obligatorios
style(card-producto): mejorar espaciado
```

#### ⚙️ Backend
```bash
feat(api-pedidos): crear endpoint de creación de pedidos
fix(repositorio-usuarios): corregir consulta SQL
refactor(gestor-auth): simplificar lógica JWT
```

#### 🏗️ Infraestructura
```bash
chore(ci): agregar pipeline de pruebas
perf(docker): reducir tamaño de imagen base
```

---

## 🔐 4. Buenas Prácticas para Archivos .env

> ⚠️ **Seguridad primero:** Protege tus secretos como oro

### 📋 Reglas generales

🚫 **Nunca** subir `.env` al git → agregar a `.gitignore`

✅ Usar **MAYÚSCULAS**, sin espacios, y nombres claros

📂 Mantener un archivo por entorno:
- `.env.development`
- `.env.production`
- `.env.local` (solo en tu máquina)

### ✅ Ejemplos correctos

```env
API_URL=https://api.misitio.com
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secreto123
JWT_SECRET=clave-ultrasecreta
```

### ❌ Ejemplos incorrectos

```env
url
password
data123
clave
```

### 🛡️ Recomendaciones

- 🔄 Rotar claves sensibles periódicamente
- ☁️ Usar **Secret Manager** en producción:
  - AWS Secrets Manager
  - GCP Secret Manager
  - Azure Key Vault
- 🚫 No imprimir valores del `.env` en logs o consola

---

## 🗃️ 5. Ejemplo Integrado

> 🎯 **Todo junto:** Ve cómo se aplica en un caso real

### 💻 Variables
```javascript
let nombreUsuario = "";
const MAXIMO_INTENTOS = 5;

class FormularioRegistroUsuario {}
```

### 🌿 Rama
```bash
feature/formulario-registro-usuario
```

### 📝 Commits
```bash
feat(ui-formulario): crear formulario inicial
fix(ui-formulario): corregir validación del email
docs(formulario): documentar uso en README
```

### 🔐 .env
```env
API_URL=https://api.misitio.com
DB_PORT=5432
JWT_SECRET=supersecreto
```

---

<div align="center">

### 🎉 ¡Listo! Ya tienes todo para escribir código profesional

**Mantén estas reglas a mano y tu código te lo agradecerá** 💪

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com)

</div>