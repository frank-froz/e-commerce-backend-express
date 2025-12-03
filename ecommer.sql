-- ===============================
--          ROLES Y USUARIOS
-- ===============================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    nombre_completo VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT now()
);

CREATE TABLE usuarios_roles (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, rol_id)
);

-- ===============================
--     CATÁLOGOS DE PRODUCTO
-- ===============================

CREATE TABLE tipo_producto (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE linea_producto (
    id SERIAL PRIMARY KEY,
    tipo_producto_id INT NOT NULL REFERENCES tipo_producto(id),
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descuento_porcentaje NUMERIC(5,2) DEFAULT 0,
    UNIQUE(tipo_producto_id, codigo)
);

-- ===============================
--         CATEGORÍAS Y MARCAS
-- ===============================

CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    categoria_padre_id INT REFERENCES categorias(id)
);

-- ===============================
--             PRODUCTOS
-- ===============================

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    marca_id INT REFERENCES marcas(id),
    categoria_id INT REFERENCES categorias(id),
    tipo_producto_id INT REFERENCES tipo_producto(id),
    linea_producto_id INT REFERENCES linea_producto(id),
    precio NUMERIC(12,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT now()
);

-- ===============================
--               STOCK
-- ===============================

-- NOTA: Ya no existe la tabla de almacenes,
--       así que stock se lleva por producto globalmente.

CREATE TABLE stock_producto (
    id BIGSERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT now(),
    UNIQUE(producto_id)
);

CREATE TABLE movimientos_stock (
    id BIGSERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    tipo_movimiento VARCHAR(100) NOT NULL,
    referencia VARCHAR(255),
    creado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT now()
);

-- ===============================
--             PROVEEDORES
-- ===============================

CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contacto_nombre VARCHAR(255),
    contacto_correo VARCHAR(255),
    telefono VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT now()
);

-- ===============================
--              COMPRAS
-- ===============================

CREATE TABLE compras (
    id BIGSERIAL PRIMARY KEY,
    proveedor_id INT REFERENCES proveedores(id),
    creado_por UUID REFERENCES usuarios(id),
    monto_total NUMERIC(14,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'borrador',
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_recepcion TIMESTAMP
);

CREATE TABLE compras_detalle (
    id BIGSERIAL PRIMARY KEY,
    compra_id BIGINT NOT NULL REFERENCES compras(id),
    producto_id INT NOT NULL REFERENCES productos(id),
    precio_unitario NUMERIC(12,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL
);

-- ===============================
--                VENTAS
-- ===============================

CREATE TABLE ordenes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    monto_total NUMERIC(14,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'carrito',
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_confirmacion TIMESTAMP
);

CREATE TABLE ordenes_detalle (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT NOT NULL REFERENCES ordenes(id),
    producto_id INT NOT NULL REFERENCES productos(id),
    precio_unitario NUMERIC(12,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL
);

-- ===============================
--              CARRITO
-- ===============================

CREATE TABLE carritos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    estado VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_actualizacion TIMESTAMP DEFAULT now()
);

CREATE TABLE carrito_detalle (
    id BIGSERIAL PRIMARY KEY,
    carrito_id BIGINT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT now(),
    fecha_actualizacion TIMESTAMP DEFAULT now(),
    UNIQUE(carrito_id, producto_id)
);
