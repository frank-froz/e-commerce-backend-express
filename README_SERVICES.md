# 📦 Servicios E-Commerce con Prisma y Procedimientos Almacenados

Este proyecto integra **Prisma ORM** con **Procedimientos Almacenados** de PostgreSQL para operaciones críticas de negocio.

---

## 🚀 Instalación de Procedimientos

### 1️⃣ Aplicar procedimientos en Supabase

```bash
# Copiar el contenido de prisma/migrations/procedures.sql
# Ejecutar en Supabase SQL Editor
```

O si tienes acceso directo a PostgreSQL:

```bash
psql -h aws-1-us-east-2.pooler.supabase.com -U postgres -d postgres -f prisma/migrations/procedures.sql
```

---

## 📚 Servicios Disponibles

### 🔹 Stock Service (`src/services/stockService.js`)

**Gestión de inventario y movimientos de stock**

```javascript
const stockService = require('./services/stockService');

// Actualizar stock
await stockService.actualizarStock(
  10,                    // productoId
  20,                    // cantidad (positivo: entrada, negativo: salida)
  'compra',             // tipoMovimiento
  'Compra #123',        // referencia
  'uuid-usuario'        // usuarioId
);

// Verificar stock disponible
await stockService.verificarStock(10, 5);

// Obtener stock actual
const stock = await stockService.obtenerStock(10);
console.log(stock.cantidad); // 20

// Ver historial de movimientos
const movimientos = await stockService.obtenerMovimientos(10);

// Productos con stock bajo
const bajoStock = await stockService.productosConStockBajo(10);
```

---

### 🔹 Compra Service (`src/services/compraService.js`)

**Gestión de compras a proveedores**

```javascript
const compraService = require('./services/compraService');

// Registrar compra
const compraId = await compraService.registrarCompra(
  1,                     // proveedorId
  'uuid-usuario',        // usuarioId
  [
    { producto_id: 10, precio_unitario: 50.00, cantidad: 20 },
    { producto_id: 15, precio_unitario: 30.00, cantidad: 50 }
  ]
);

// Obtener detalle de compra
const compra = await compraService.obtenerCompra(compraId);

// Listar compras con filtros
const resultado = await compraService.listarCompras(
  { proveedorId: 1, estado: 'borrador' },
  1,    // página
  20    // límite
);

// Confirmar recepción
await compraService.confirmarRecepcion(compraId);

// Cancelar compra
await compraService.cancelarCompra(compraId);
```

---

### 🔹 Orden Service (`src/services/ordenService.js`)

**Gestión de órdenes de venta**

```javascript
const ordenService = require('./services/ordenService');

// Crear orden (descuenta stock automáticamente)
const ordenId = await ordenService.crearOrden(
  'uuid-usuario',
  [
    { producto_id: 10, precio_unitario: 100.00, cantidad: 2 },
    { producto_id: 15, precio_unitario: 50.00, cantidad: 1 }
  ]
);

// Confirmar orden
await ordenService.confirmarOrden(ordenId);

// Obtener detalle de orden
const orden = await ordenService.obtenerOrden(ordenId);

// Listar órdenes
const ordenes = await ordenService.listarOrdenes(
  { estado: 'pendiente' },
  1,
  20
);

// Órdenes de un usuario
const misOrdenes = await ordenService.ordenesDelUsuario('uuid-usuario', 10);

// Cancelar orden (devuelve el stock)
await ordenService.cancelarOrden(ordenId, 'uuid-usuario');
```

---

### 🔹 Carrito Service (`src/services/carritoService.js`)

**Gestión del carrito de compras**

```javascript
const carritoService = require('./services/carritoService');

// Agregar producto al carrito
await carritoService.actualizarCarrito(
  'uuid-usuario',
  10,           // productoId
  2,            // cantidad
  100.00        // precio
);

// Actualizar cantidad
await carritoService.actualizarCantidad('uuid-usuario', 10, 5);

// Eliminar producto
await carritoService.eliminarDelCarrito('uuid-usuario', 10);

// Obtener carrito completo
const carrito = await carritoService.obtenerCarrito('uuid-usuario');
console.log(carrito.subtotal);
console.log(carrito.cantidadProductos);

// Resumen rápido
const resumen = await carritoService.resumenCarrito('uuid-usuario');

// Convertir carrito en orden
const ordenId = await carritoService.checkoutCarrito('uuid-usuario');

// Vaciar carrito
await carritoService.vaciarCarrito('uuid-usuario');
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── config/
│   └── prisma.js              # Cliente Prisma centralizado
└── services/
    ├── stockService.js        # Gestión de stock
    ├── compraService.js       # Gestión de compras
    ├── ordenService.js        # Gestión de órdenes
    └── carritoService.js      # Gestión de carrito

prisma/
├── schema.prisma              # Schema de base de datos
├── prisma.config.ts           # Configuración de conexión
└── migrations/
    └── procedures.sql         # Procedimientos almacenados
```

---

## ⚡ Ejemplo Completo: Flujo de Compra

```javascript
const stockService = require('./services/stockService');
const carritoService = require('./services/carritoService');
const ordenService = require('./services/ordenService');

async function flujoCompraCompleto(usuarioId) {
  try {
    // 1. Usuario agrega productos al carrito
    await carritoService.actualizarCarrito(usuarioId, 10, 2, 100.00);
    await carritoService.actualizarCarrito(usuarioId, 15, 1, 50.00);
    
    // 2. Ver carrito
    const carrito = await carritoService.obtenerCarrito(usuarioId);
    console.log('Total a pagar:', carrito.subtotal);
    
    // 3. Verificar stock antes de checkout
    for (const item of carrito.detalles) {
      await stockService.verificarStock(item.productoId, item.cantidad);
    }
    
    // 4. Checkout (crea orden y descuenta stock)
    const ordenId = await carritoService.checkoutCarrito(usuarioId);
    console.log('Orden creada:', ordenId);
    
    // 5. Confirmar orden
    await ordenService.confirmarOrden(ordenId);
    
    // 6. Ver orden final
    const orden = await ordenService.obtenerOrden(ordenId);
    console.log('Orden confirmada:', orden);
    
    return orden;
    
  } catch (error) {
    console.error('Error en el flujo:', error.message);
    throw error;
  }
}

// Ejecutar
flujoCompraCompleto('uuid-del-usuario');
```

---

## 🔐 Variables de Entorno

Asegúrate de tener configurado tu `.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/database"
DIRECT_URL="postgresql://usuario:password@host:6543/database"
```

---

## 🧪 Generar Cliente de Prisma

```bash
npx prisma generate
```

---

## ✅ Ventajas de esta Arquitectura

- ✨ **Transaccional**: Los procedimientos garantizan atomicidad
- 🚀 **Performance**: Operaciones complejas en una sola llamada a BD
- 🔒 **Seguridad**: Lógica crítica protegida en la base de datos
- 📦 **Stock en tiempo real**: Actualizaciones inmediatas y consistentes
- 🎯 **Clean Code**: Servicios reutilizables y bien documentados
- 🔄 **Historial completo**: Todos los movimientos quedan registrados

---

## 📝 Próximos Pasos

1. Crear controladores Express para exponer estos servicios
2. Agregar autenticación JWT
3. Implementar middleware de validación
4. Crear tests unitarios
5. Documentar API con Swagger

---

<div align="center">

**¡Listo para construir tu e-commerce!** 🚀

</div>
