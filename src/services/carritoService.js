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
  // 1) Buscar carrito activo del usuario, crear si no existe
  let carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo',
    },
  });

  if (!carrito) {
    carrito = await prisma.carrito.create({
      data: {
        usuarioId,
        estado: 'activo',
        fechaCreacion: new Date(),
      },
    });
  }

  // 2) Si cantidad es 0, eliminar el detalle (equivalente a quitar del carrito)
  if (cantidad === 0) {
    await prisma.carritoDetalle.deleteMany({
      where: {
        carritoId: carrito.id,
        productoId: Number(productoId),
      },
    });
    return;
  }

  // 3) Buscar si ya existe un detalle para ese producto
  const detalleExistente = await prisma.carritoDetalle.findFirst({
    where: {
      carritoId: carrito.id,
      productoId: Number(productoId),
    },
  });

  const now = new Date();

  if (!detalleExistente) {
    // 4) Si no existe, crear nuevo detalle
    await prisma.carritoDetalle.create({
      data: {
        carritoId: carrito.id,
        productoId,
        cantidad,
        precioUnitario: precio,
        fechaCreacion: now,
        fechaActualizacion: now,
      },
    });
  } else {
    // 5) Si existe, actualizar cantidad y fechaActualizacion
    await prisma.carritoDetalle.update({
      where: {
        id: detalleExistente.id,
      },
      data: {
        cantidad,
        precioUnitario: precio,
        fechaActualizacion: now,
      },
    });
  }
}

/**
 * 🛍️ Convierte el carrito en una orden usando Prisma puro (sin stored procedure)
 * @param {string} usuarioId - UUID del usuario
 * @returns {Promise<number>} ID de la orden creada
 */
async function checkoutCarrito(usuarioId) {
  // Cargar carrito activo con sus detalles, producto y stock
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo'
    },
    include: {
      detalles: {
        include: {
          producto: {
            include: {
              stock: true,
            },
          },
        },
      },
    },
  });

  if (!carrito || carrito.detalles.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Validar stock disponible para cada producto
  for (const d of carrito.detalles) {
    const disponible = d.producto.stock?.cantidad ?? 0;
    if (disponible < d.cantidad) {
      throw new Error('Stock insuficiente para uno o más productos');
    }
  }

  // Calcular monto total de la orden
  const montoTotal = carrito.detalles.reduce((sum, d) => {
    const precioUnitario = Number(d.precioUnitario);
    return sum + precioUnitario * d.cantidad;
  }, 0);

  // Transacción: crear orden, detalles, actualizar stock y marcar carrito como completado
  const ordenCreada = await prisma.$transaction(async (tx) => {
    // 1) Crear orden
    const orden = await tx.orden.create({
      data: {
        usuarioId,
        montoTotal,
        estado: 'confirmada',
        fechaConfirmacion: new Date(),
      },
    });

    // 2) Crear detalles de la orden
    for (const d of carrito.detalles) {
      const precioUnitario = Number(d.precioUnitario);
      const subtotal = precioUnitario * d.cantidad;

      await tx.ordenDetalle.create({
        data: {
          ordenId: orden.id,
          productoId: d.productoId,
          precioUnitario,
          cantidad: d.cantidad,
          subtotal,
        },
      });

      // 3) Actualizar stock del producto
      if (d.producto.stock) {
        await tx.stockProducto.update({
          where: { productoId: d.productoId },
          data: {
            cantidad: d.producto.stock.cantidad - d.cantidad,
            fechaActualizacion: new Date(),
          },
        });
      } else {
        // Si no existe registro de stock, crearlo en negativo/cero según tu regla de negocio
        await tx.stockProducto.create({
          data: {
            productoId: d.productoId,
            cantidad: -d.cantidad,
          },
        });
      }
    }

    // 4) Marcar carrito como completado y limpiar detalles
    await tx.carritoDetalle.deleteMany({
      where: { carritoId: carrito.id },
    });

    await tx.carrito.update({
      where: { id: carrito.id },
      data: {
        estado: 'completado',
        fechaActualizacion: new Date(),
      },
    });

    return orden;
  });

  return Number(ordenCreada.id);
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
              imagen: true,
              lineaProducto: {
                select: {
                  id: true,
                  nombre: true,
                  descuentoPorcentaje: true
                }
              },
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

  // Calcular totales con descuentos
  let subtotal = 0;
  let totalDescuentos = 0;

  const detallesConDescuento = carrito.detalles.map(d => {
    const precioUnitario = Number(d.precioUnitario);
    const cantidad = d.cantidad;
    const descuentoPorcentaje = d.producto.lineaProducto?.descuentoPorcentaje 
      ? parseFloat(d.producto.lineaProducto.descuentoPorcentaje) 
      : 0;
    
    const tieneDescuento = descuentoPorcentaje > 0;
    const precioConDescuento = tieneDescuento 
      ? precioUnitario - (precioUnitario * descuentoPorcentaje / 100)
      : precioUnitario;
    
    const subtotalSinDescuento = precioUnitario * cantidad;
    const subtotalItem = precioConDescuento * cantidad;
    const descuentoItem = subtotalSinDescuento - subtotalItem;

    subtotal += subtotalItem;
    totalDescuentos += descuentoItem;

    return {
      ...d,
      precioUnitario,
      descuentoPorcentaje,
      precioConDescuento,
      tieneDescuento,
      subtotalSinDescuento,
      subtotalItem,
      descuentoItem,
      stockDisponible: d.producto.stock?.cantidad || 0
    };
  });

  const result = {
    ...carrito,
    detalles: detallesConDescuento,
    subtotal,
    totalDescuentos,
    total: subtotal,
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
      productoId: Number(productoId)
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
  // 1) Buscar carrito activo
  const carrito = await prisma.carrito.findFirst({
    where: {
      usuarioId,
      estado: 'activo',
    },
  });

  if (!carrito) {
    throw new Error('No hay carrito activo');
  }

  // 2) Buscar detalle del producto en el carrito
  const detalle = await prisma.carritoDetalle.findFirst({
    where: {
      carritoId: carrito.id,
      productoId: Number(productoId),
    },
  });

  if (!detalle) {
    throw new Error('Producto no encontrado en el carrito');
  }

  // 3) Actualizar solo la cantidad (se mantiene el precioUnitario que ya tiene el detalle)
  await prisma.carritoDetalle.update({
    where: { id: detalle.id },
    data: {
      cantidad: nuevaCantidad,
      fechaActualizacion: new Date(),
    },
  });

  // 4) Devolver el carrito actualizado
  const carritoActualizado = await obtenerCarrito(usuarioId);
  return carritoActualizado;
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
