# 📚 API de Catálogos - Documentación

## Descripción General

Esta API proporciona endpoints para gestionar los catálogos del sistema e-commerce: **Marcas**, **Categorías**, **Tipos de Producto** y **Líneas de Producto**. Los catálogos incluyen soporte para descuentos automáticos a nivel de línea de producto.

---

## 🎯 Índice

1. [Marcas](#-marcas)
2. [Categorías](#-categorías)
3. [Tipos de Producto](#-tipos-de-producto)
4. [Líneas de Producto](#-líneas-de-producto-con-descuentos)
5. [Productos](#-productos)
6. [Sistema de Descuentos](#-sistema-de-descuentos)

---

## 🏷️ Marcas

### Listar Marcas
```http
GET /api/marcas
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "HP"
    },
    {
      "id": 2,
      "nombre": "Dell"
    }
  ]
}
```

---

### Obtener Marca por ID
```http
GET /api/marcas/:id
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "HP",
    "productos": [
      {
        "id": 10,
        "sku": "HP-LAP-001",
        "nombre": "Laptop HP Pavilion",
        "precio": "799.99",
        "activo": true
      }
    ]
  }
}
```

---

### Crear Marca
```http
POST /api/marcas
```

**Acceso:** Private (Admin)

**Headers:**
```
Cookie: accessToken=<jwt_token>
```

**Body:**
```json
{
  "nombre": "Lenovo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Marca creada exitosamente",
  "data": {
    "id": 3,
    "nombre": "Lenovo"
  }
}
```

---

### Actualizar Marca
```http
PUT /api/marcas/:id
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "nombre": "Lenovo ThinkPad"
}
```

---

### Eliminar Marca
```http
DELETE /api/marcas/:id
```

**Acceso:** Private (Admin)

**Nota:** Solo se puede eliminar si no tiene productos asociados.

---

## 📁 Categorías

### Listar Categorías
```http
GET /api/categorias
```

**Acceso:** Público

**Características:**
- Incluye jerarquía (categoría padre e hijos)
- Ordenadas alfabéticamente

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Electrónica",
      "categoriaPadreId": null,
      "categoriaPadre": null,
      "subcategorias": [
        {
          "id": 2,
          "nombre": "Laptops"
        },
        {
          "id": 3,
          "nombre": "Tablets"
        }
      ]
    },
    {
      "id": 2,
      "nombre": "Laptops",
      "categoriaPadreId": 1,
      "categoriaPadre": {
        "id": 1,
        "nombre": "Electrónica"
      },
      "subcategorias": []
    }
  ]
}
```

---

### Obtener Categoría por ID
```http
GET /api/categorias/:id
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Laptops",
    "categoriaPadreId": 1,
    "categoriaPadre": {
      "id": 1,
      "nombre": "Electrónica"
    },
    "subcategorias": [],
    "productos": [
      {
        "id": 10,
        "sku": "HP-LAP-001",
        "nombre": "Laptop HP Pavilion",
        "precio": "799.99",
        "activo": true
      }
    ]
  }
}
```

---

### Crear Categoría
```http
POST /api/categorias
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "nombre": "Accesorios",
  "categoriaPadreId": 1  // opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": 5,
    "nombre": "Accesorios",
    "categoriaPadreId": 1,
    "categoriaPadre": {
      "id": 1,
      "nombre": "Electrónica"
    }
  }
}
```

---

### Actualizar Categoría
```http
PUT /api/categorias/:id
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "nombre": "Accesorios de Tecnología",
  "categoriaPadreId": 1  // opcional, null para quitar padre
}
```

---

### Eliminar Categoría
```http
DELETE /api/categorias/:id
```

**Acceso:** Private (Admin)

**Nota:** Solo se puede eliminar si no tiene productos ni subcategorías.

---

## 🔧 Tipos de Producto

### Listar Tipos de Producto
```http
GET /api/tipos-producto
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "TECH",
      "nombre": "Tecnología",
      "lineas": [
        {
          "id": 1,
          "codigo": "PREMIUM",
          "nombre": "Línea Premium",
          "descuentoPorcentaje": "10.00"
        },
        {
          "id": 2,
          "codigo": "BASICA",
          "nombre": "Línea Básica",
          "descuentoPorcentaje": "0.00"
        }
      ]
    }
  ]
}
```

---

### Obtener Tipo de Producto por ID
```http
GET /api/tipos-producto/:id
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "TECH",
    "nombre": "Tecnología",
    "lineas": [
      {
        "id": 1,
        "codigo": "PREMIUM",
        "nombre": "Línea Premium",
        "descuentoPorcentaje": "10.00"
      }
    ],
    "productos": [
      {
        "id": 10,
        "sku": "HP-LAP-001",
        "nombre": "Laptop HP Pavilion",
        "precio": "799.99"
      }
    ]
  }
}
```

---

### Crear Tipo de Producto
```http
POST /api/tipos-producto
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "codigo": "ELECTRO",
  "nombre": "Electrodomésticos"
}
```

**Validaciones:**
- `codigo`: Requerido, único, máximo 50 caracteres
- `nombre`: Requerido, máximo 255 caracteres

---

### Actualizar Tipo de Producto
```http
PUT /api/tipos-producto/:id
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "codigo": "ELEC",
  "nombre": "Electrodomésticos del Hogar"
}
```

---

### Eliminar Tipo de Producto
```http
DELETE /api/tipos-producto/:id
```

**Acceso:** Private (Admin)

**Nota:** Solo se puede eliminar si no tiene líneas ni productos.

---

## 📊 Líneas de Producto (Con Descuentos)

### Listar Líneas de Producto
```http
GET /api/lineas-producto
GET /api/lineas-producto?tipoProductoId=1
```

**Acceso:** Público

**Query Parameters:**
- `tipoProductoId` (opcional): Filtrar por tipo de producto

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipoProductoId": 1,
      "codigo": "PREMIUM",
      "nombre": "Línea Premium",
      "descuentoPorcentaje": "10.00",
      "tipoProducto": {
        "id": 1,
        "codigo": "TECH",
        "nombre": "Tecnología"
      }
    },
    {
      "id": 2,
      "tipoProductoId": 1,
      "codigo": "PROMO",
      "nombre": "Línea Promocional",
      "descuentoPorcentaje": "25.00",
      "tipoProducto": {
        "id": 1,
        "codigo": "TECH",
        "nombre": "Tecnología"
      }
    }
  ]
}
```

---

### Obtener Línea de Producto por ID
```http
GET /api/lineas-producto/:id
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipoProductoId": 1,
    "codigo": "PREMIUM",
    "nombre": "Línea Premium",
    "descuentoPorcentaje": "10.00",
    "tipoProducto": {
      "id": 1,
      "codigo": "TECH",
      "nombre": "Tecnología"
    },
    "productos": [
      {
        "id": 10,
        "sku": "HP-LAP-001",
        "nombre": "Laptop HP Pavilion",
        "precio": "799.99"
      }
    ]
  }
}
```

---

### Crear Línea de Producto
```http
POST /api/lineas-producto
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "tipoProductoId": 1,
  "codigo": "PROMO",
  "nombre": "Línea Promocional",
  "descuentoPorcentaje": 25.0
}
```

**Validaciones:**
- `tipoProductoId`: Requerido, debe existir
- `codigo`: Requerido, único dentro del tipo de producto
- `nombre`: Requerido, máximo 255 caracteres
- `descuentoPorcentaje`: Opcional, entre 0 y 100

**Respuesta:**
```json
{
  "success": true,
  "message": "Línea de producto creada exitosamente",
  "data": {
    "id": 3,
    "tipoProductoId": 1,
    "codigo": "PROMO",
    "nombre": "Línea Promocional",
    "descuentoPorcentaje": "25.00",
    "tipoProducto": {
      "id": 1,
      "codigo": "TECH",
      "nombre": "Tecnología"
    }
  }
}
```

---

### Actualizar Línea de Producto
```http
PUT /api/lineas-producto/:id
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "codigo": "SUPERPROMO",
  "nombre": "Línea Super Promocional",
  "descuentoPorcentaje": 30.0
}
```

**Nota:** Todos los campos son opcionales. El cambio de descuento afecta a todos los productos de esta línea.

---

### Eliminar Línea de Producto
```http
DELETE /api/lineas-producto/:id
```

**Acceso:** Private (Admin)

**Nota:** Solo se puede eliminar si no tiene productos asociados.

---

## 📦 Productos

### Listar Productos
```http
GET /api/productos
```

**Acceso:** Público

**Query Parameters:**
- `categoriaId`: Filtrar por categoría
- `marcaId`: Filtrar por marca
- `tipoProductoId`: Filtrar por tipo de producto
- `lineaProductoId`: Filtrar por línea de producto
- `busqueda`: Buscar en nombre, SKU o descripción
- `precioMin`: Precio mínimo
- `precioMax`: Precio máximo
- `activo`: true/false
- `pagina`: Número de página (default: 1)
- `limite`: Productos por página (default: 20)

**Ejemplo:**
```http
GET /api/productos?categoriaId=2&precioMin=500&precioMax=1000&pagina=1&limite=10
```

**Respuesta con Descuentos:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": 10,
        "sku": "HP-LAP-001",
        "nombre": "Laptop HP Pavilion",
        "descripcion": "Laptop 15.6 pulgadas, Intel i5",
        "precio": "799.99",
        "activo": true,
        "marca": {
          "id": 1,
          "nombre": "HP"
        },
        "categoria": {
          "id": 2,
          "nombre": "Laptops"
        },
        "lineaProducto": {
          "id": 1,
          "nombre": "Línea Premium",
          "descuentoPorcentaje": "10.00"
        },
        "stock": {
          "cantidad": 50
        },
        "precioOriginal": 799.99,
        "descuentoPorcentaje": 10,
        "descuentoMonto": 80,
        "precioConDescuento": 719.99,
        "tieneDescuento": true
      }
    ],
    "total": 25,
    "pagina": 1,
    "totalPaginas": 3
  }
}
```

---

### Obtener Producto por ID
```http
GET /api/productos/:id
```

**Acceso:** Público

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "sku": "HP-LAP-001",
    "nombre": "Laptop HP Pavilion",
    "descripcion": "Laptop 15.6 pulgadas, Intel i5, 8GB RAM, 512GB SSD",
    "precio": "799.99",
    "activo": true,
    "fechaCreacion": "2025-01-15T10:30:00.000Z",
    "marca": {
      "id": 1,
      "nombre": "HP"
    },
    "categoria": {
      "id": 2,
      "nombre": "Laptops"
    },
    "tipoProducto": {
      "id": 1,
      "codigo": "TECH",
      "nombre": "Tecnología"
    },
    "lineaProducto": {
      "id": 1,
      "tipoProductoId": 1,
      "codigo": "PREMIUM",
      "nombre": "Línea Premium",
      "descuentoPorcentaje": "10.00"
    },
    "stock": {
      "cantidad": 50,
      "fechaActualizacion": "2025-01-20T15:45:00.000Z"
    },
    "precioOriginal": 799.99,
    "descuentoPorcentaje": 10,
    "descuentoMonto": 80,
    "precioConDescuento": 719.99,
    "tieneDescuento": true
  }
}
```

---

### Buscar Producto por SKU
```http
GET /api/productos/sku/:sku
```

**Acceso:** Público

**Ejemplo:**
```http
GET /api/productos/sku/HP-LAP-001
```

---

### Crear Producto
```http
POST /api/productos
```

**Acceso:** Private (Admin)

**Body:**
```json
{
  "sku": "DELL-LAP-001",
  "nombre": "Laptop Dell Inspiron",
  "descripcion": "Laptop 14 pulgadas, Intel i7",
  "precio": 999.99,
  "marcaId": 2,
  "categoriaId": 2,
  "tipoProductoId": 1,
  "lineaProductoId": 1,
  "activo": true
}
```

**Validaciones:**
- `sku`: Requerido, único, máximo 100 caracteres
- `nombre`: Requerido, máximo 255 caracteres
- `precio`: Requerido, número positivo
- IDs: Opcionales, deben existir si se proporcionan

**Nota:** Se crea automáticamente un registro de stock con cantidad 0.

---

### Actualizar Producto
```http
PUT /api/productos/:id
```

**Acceso:** Private (Admin)

**Body (todos los campos opcionales):**
```json
{
  "nombre": "Laptop Dell Inspiron 15",
  "precio": 899.99,
  "lineaProductoId": 2
}
```

---

### Desactivar Producto
```http
DELETE /api/productos/:id
```

**Acceso:** Private (Admin)

**Nota:** Soft delete - solo cambia `activo` a `false`.

---

### Activar Producto
```http
PATCH /api/productos/:id/activar
```

**Acceso:** Private (Admin)

---

## 💰 Sistema de Descuentos

### Cómo Funcionan los Descuentos

1. **Configuración:**
   - Los descuentos se configuran a nivel de **Línea de Producto**
   - Rango: 0% - 100%
   - Se aplican automáticamente a todos los productos de esa línea

2. **Cálculo:**
   ```javascript
   precioOriginal = producto.precio
   descuentoPorcentaje = lineaProducto.descuentoPorcentaje
   descuentoMonto = precioOriginal * (descuentoPorcentaje / 100)
   precioConDescuento = precioOriginal - descuentoMonto
   ```

3. **Aplicación en APIs:**

   **Productos:**
   ```json
   {
     "precio": "1000.00",
     "precioOriginal": 1000,
     "descuentoPorcentaje": 15,
     "descuentoMonto": 150,
     "precioConDescuento": 850,
     "tieneDescuento": true
   }
   ```

   **Carrito:**
   ```json
   {
     "detalles": [
       {
         "cantidad": 2,
         "precioUnitario": 1000,
         "descuentoPorcentaje": 15,
         "precioConDescuento": 850,
         "subtotalSinDescuento": 2000,
         "subtotalItem": 1700,
         "descuentoItem": 300,
         "tieneDescuento": true
       }
     ],
     "subtotal": 1700,
     "totalDescuentos": 300,
     "total": 1700
   }
   ```

4. **Actualización de Descuentos:**
   - Al cambiar el descuento de una línea, se aplica automáticamente
   - Los precios en el carrito se recalculan en tiempo real
   - Los precios en órdenes ya confirmadas NO cambian

---

## 🔐 Autenticación

### Endpoints Públicos
- `GET` - Todos los endpoints de consulta (listar, obtener)

### Endpoints Protegidos (Admin)
- `POST` - Crear recursos
- `PUT` - Actualizar recursos
- `DELETE` - Eliminar recursos
- `PATCH` - Activar/desactivar

**Headers requeridos para Admin:**
```
Cookie: accessToken=<jwt_token>
```

**Obtener token:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "admin@example.com",
  "contrasena": "Password123"
}
```

---

## 📊 Jerarquía de Datos

```
TipoProducto (TECH)
  └── LineaProducto (PREMIUM - 10% descuento)
      └── Producto (Laptop HP - $799.99)
          ├── Marca (HP)
          ├── Categoria (Laptops)
          └── Stock (50 unidades)
```

---

## ⚠️ Errores Comunes

### 400 - Validation Error
```json
{
  "success": false,
  "error": {
    "message": "Datos inválidos",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "nombre",
        "message": "Nombre es requerido"
      }
    ]
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "message": "Marca no encontrada",
    "code": "NOT_FOUND"
  }
}
```

### 409 - Conflict (Duplicate)
```json
{
  "success": false,
  "error": {
    "message": "La marca ya existe",
    "code": "DUPLICATE"
  }
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Token inválido o expirado",
    "code": "INVALID_TOKEN"
  }
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "message": "No tienes permisos para realizar esta acción",
    "code": "FORBIDDEN"
  }
}
```

---

## 🧪 Ejemplos de Uso

### Flujo Completo: Crear Producto con Descuento

**1. Crear Tipo de Producto:**
```http
POST /api/tipos-producto
{
  "codigo": "TECH",
  "nombre": "Tecnología"
}
```

**2. Crear Línea con Descuento:**
```http
POST /api/lineas-producto
{
  "tipoProductoId": 1,
  "codigo": "PROMO",
  "nombre": "Línea Promocional",
  "descuentoPorcentaje": 20
}
```

**3. Crear Marca:**
```http
POST /api/marcas
{
  "nombre": "HP"
}
```

**4. Crear Categoría:**
```http
POST /api/categorias
{
  "nombre": "Laptops"
}
```

**5. Crear Producto:**
```http
POST /api/productos
{
  "sku": "HP-LAP-001",
  "nombre": "Laptop HP Pavilion",
  "precio": 1000,
  "marcaId": 1,
  "categoriaId": 1,
  "tipoProductoId": 1,
  "lineaProductoId": 1
}
```

**6. Consultar con Descuento Aplicado:**
```http
GET /api/productos/1

Respuesta:
{
  "precio": "1000.00",
  "precioOriginal": 1000,
  "descuentoPorcentaje": 20,
  "descuentoMonto": 200,
  "precioConDescuento": 800,
  "tieneDescuento": true
}
```

---

## 📝 Notas Importantes

1. **Soft Delete:** Los productos se desactivan (`activo: false`) en lugar de eliminarse
2. **Stock:** Al crear un producto, el stock inicial es 0
3. **Descuentos:** Los cambios en líneas afectan inmediatamente a sus productos
4. **Jerarquías:** No se puede eliminar si hay registros dependientes
5. **Unicidad:** SKU de producto y código de tipo deben ser únicos
6. **BigInt:** Los IDs se convierten automáticamente a string en respuestas JSON

---

## 🚀 Próximas Mejoras

- [ ] Descuentos temporales con fecha inicio/fin
- [ ] Descuentos acumulables (línea + promoción)
- [ ] Historial de cambios de precio
- [ ] Importación masiva de catálogos (CSV/Excel)
- [ ] API de búsqueda avanzada con Elasticsearch
- [ ] Cache con Redis para consultas frecuentes

---

## 📚 Recursos Relacionados

- [Documentación de Autenticación](./AUTH_README.md)
- [Documentación de Stock](./README_STOCK.md)
- [Documentación de Carrito](./README_CARRITO.md)
- [Schema de Base de Datos](./prisma/schema.prisma)

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 4, 2025  
**Base URL:** `http://localhost:3000/api`
