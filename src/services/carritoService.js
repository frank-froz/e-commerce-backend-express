// 🛒 Servicio de Carrito
// Gestión del carrito de compras

const prisma = require('../config/prisma');
const { convertBigIntToString } = require('../utils/bigint');

/**
 * ➕ Agrega, actualiza o elimina un producto del carrito
 * @param {string} usuarioId - UUID del usuario
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad (0 para eliminar)
 * @param {number} precio - Precio unitario del producto
 * @returns {Promise<void>}
 * 
 * @example
 * // Agregar 2 unidades
 * await actualizarCarrito('uuid-usuario', 10, 2, 100.00);
 * 
 * // Eliminar producto
 * await actualizarCarrito('uuid-usuario', 10, 0, 100.00);
 */
async function actualizarCarrito(usuarioId, productoId, cantidad, precio) {
  await prisma.$executeRaw`
    SELECT proc_actualizar_carrito(
      ${usuarioId}::UUID,
      ${productoId}::INT,
      ${cantidad}::INT,
      ${precio}::NUMERIC
    )
  `;
}

/**
 * 🛍️ Convierte el carrito en una orden
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<number>} ID de la orden creada
 */
async function checkoutCarrito(usuarioId) {
  // Obtener el carrito activo del usuario
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    }
  });

  if (!carrito) {
    throw new Error('No hay carrito activo para este usuario');
  }

  try {
    const result = await prisma.$queryRaw`
      SELECT proc_checkout_carrito(
        ${carrito.id}::BIGINT,
        ${usuarioId}::UUID
      ) as orden_id
    `;
    
    return Number(result[0].orden_id);
  } catch (error) {
    if (error.message.includes('carrito está vacío')) {
      throw new Error('El carrito está vacío');
    }
    if (error.message.includes('Stock insuficiente')) {
      throw new Error('Stock insuficiente para uno o más productos');
    }
    throw error;
  }
}

/**
 * 📋 Obtiene el carrito activo del usuario con sus productos
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<Object|null>} Carrito con detalles o null si no existe
 */
async function obtenerCarrito(usuarioId) {
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    },
    include: {
      detalles: {
        include: {
          producto: {
            select: {
              id: true,
              sku: true,
              nombre: true,
              descripcion: true,
              precio: true,
              stock: {
                select: {
                  cantidad: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!carrito) {
    return null;
  }

  // Calcular totales
  const subtotal = carrito.detalles.reduce((sum, item) => {
    return sum + (Number(item.precioUnitario) * item.cantidad);
  }, 0);

  const result = {
    ...carrito,
    detalles: carrito.detalles.map(d => ({
      ...d,
      subtotalItem: Number(d.precioUnitario) * d.cantidad,
      stockDisponible: d.producto.stock?.cantidad || 0
    })),
    subtotal,
    cantidadItems: carrito.detalles.length,
    cantidadProductos: carrito.detalles.reduce((sum, item) => sum + item.cantidad, 0)
  };

  return convertBigIntToString(result);
}

/**
 * 🗑️ Vacía completamente el carrito del usuario
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<void>}
 */
async function vaciarCarrito(usuarioId) {
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    }
  });

  if (!carrito) {
    return; // No hay carrito activo
  }

  await prisma.carritoDetalle.deleteMany({
    where: {
      carritoId: carrito.id
    }
  });
}

/**
 * ➖ Elimina un producto específico del carrito
 * @param {string} usuarioId - UUID del usuario
 * @param {number} productoId - ID del producto a eliminar
 * @returns {Promise<void>}
 */
async function eliminarDelCarrito(usuarioId, productoId) {
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    }
  });

  if (!carrito) {
    throw new Error('No hay carrito activo');
  }

  await prisma.carritoDetalle.deleteMany({
    where: {
      carritoId: carrito.id,
      productoId
    }
  });
}

/**
 * 🔢 Actualiza solo la cantidad de un producto en el carrito
 * @param {string} usuarioId - UUID del usuario
 * @param {number} productoId - ID del producto
 * @param {number} nuevaCantidad - Nueva cantidad
 * @returns {Promise<Object>} Detalle actualizado
 */
async function actualizarCantidad(usuarioId, productoId, nuevaCantidad) {
  if (nuevaCantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0. Use eliminarDelCarrito para quitar el producto.');
  }

  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    }
  });

  if (!carrito) {
    throw new Error('No hay carrito activo');
  }

  const detalle = await prisma.carritoDetalle.findFirst({
    where: {
      carritoId: carrito.id,
      productoId
    }
  });

  if (!detalle) {
    throw new Error('Producto no encontrado en el carrito');
  }

  const updated = await prisma.carritoDetalle.update({
    where: {
      id: detalle.id
    },
    data: {
      cantidad: nuevaCantidad,
      fechaActualizacion: new Date()
    },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          precio: true
        }
      }
    }
  });

  return convertBigIntToString(updated);
}

/**
 * 📊 Obtiene el resumen del carrito (sin detalles completos)
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<Object>} Resumen del carrito
 */
async function resumenCarrito(usuarioId) {
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    },
    include: {
      detalles: {
        select: {
          cantidad: true,
          precioUnitario: true
        }
      }
    }
  });

  if (!carrito) {
    return {
      existe: false,
      cantidadItems: 0,
      cantidadProductos: 0,
      total: 0
    };
  }

  const cantidadProductos = carrito.detalles.reduce((sum, item) => sum + item.cantidad, 0);
  const total = carrito.detalles.reduce((sum, item) => {
    return sum + (Number(item.precioUnitario) * item.cantidad);
  }, 0);

  const result = {
    existe: true,
    carritoId: carrito.id,
    cantidadItems: carrito.detalles.length,
    cantidadProductos,
    total
  };

  return convertBigIntToString(result);
}

module.exports = {
  actualizarCarrito,
  checkoutCarrito,
  obtenerCarrito,
  vaciarCarrito,
  eliminarDelCarrito,
  actualizarCantidad,
  resumenCarrito
};
