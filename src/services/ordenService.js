// 🛍️ Servicio de Órdenes
// Gestión de órdenes de venta

const prisma = require('../config/prisma');
const { convertBigIntToString } = require('../utils/bigint');

/**
 * 📝 Crea una nueva orden con detalle y descuenta stock
 * @param {string} usuarioId - UUID del usuario
 * @param {Array} items - Array de items: [{producto_id, precio_unitario, cantidad}]
 * @returns {Promise<number>} ID de la orden creada
 * 
 * @example
 * const ordenId = await crearOrden('uuid-usuario', [
 *   { producto_id: 10, precio_unitario: 100.00, cantidad: 2 },
 *   { producto_id: 15, precio_unitario: 50.00, cantidad: 1 }
 * ]);
 */
async function crearOrden(usuarioId, items) {
  const itemsJson = JSON.stringify(items);
  
  try {
    const result = await prisma.$queryRaw`
      SELECT proc_crear_orden(
        ${usuarioId}::UUID,
        ${itemsJson}::JSON
      ) as orden_id
    `;
    
    return Number(result[0].orden_id);
  } catch (error) {
    // Capturar errores de stock insuficiente
    if (error.message.includes('Stock insuficiente')) {
      throw new Error('Stock insuficiente para uno o más productos');
    }
    throw error;
  }
}

/**
 * ✅ Confirma una orden existente
 * @param {number} ordenId - ID de la orden
 * @returns {Promise<void>}
 */
async function confirmarOrden(ordenId) {
  try {
    await prisma.$executeRaw`
      SELECT proc_confirmar_orden(${ordenId}::BIGINT)
    `;
  } catch (error) {
    if (error.message.includes('Orden no encontrada')) {
      throw new Error(`Orden ${ordenId} no encontrada`);
    }
    throw error;
  }
}

/**
 * 📋 Obtiene el detalle completo de una orden
 * @param {number} ordenId - ID de la orden
 * @returns {Promise<Object>} Orden con sus detalles
 */
async function obtenerOrden(ordenId) {
  const orden = await prisma.orden.findUnique({
    where: { id: BigInt(ordenId) },
    include: {
      usuario: {
        select: {
          id: true,
          nombreCompleto: true,
          correo: true
        }
      },
      detalles: {
        include: {
          producto: {
            select: {
              id: true,
              sku: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      }
    }
  });

  return convertBigIntToString(orden);
}

/**
 * 📊 Lista las órdenes con filtros opcionales
 * @param {Object} filtros - { usuarioId, estado, fechaDesde, fechaHasta }
 * @param {number} pagina - Número de página (default: 1)
 * @param {number} limite - Registros por página (default: 20)
 * @returns {Promise<Object>} { ordenes, total, pagina, totalPaginas }
 */
async function listarOrdenes(filtros = {}, pagina = 1, limite = 20) {
  const where = {};

  if (filtros.usuarioId) {
    where.usuarioId = filtros.usuarioId;
  }

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    where.fechaCreacion = {};
    if (filtros.fechaDesde) where.fechaCreacion.gte = new Date(filtros.fechaDesde);
    if (filtros.fechaHasta) where.fechaCreacion.lte = new Date(filtros.fechaHasta);
  }

  const [ordenes, total] = await Promise.all([
    prisma.orden.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            correo: true
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      },
      skip: (pagina - 1) * limite,
      take: limite
    }),
    prisma.orden.count({ where })
  ]);

  return convertBigIntToString({
    ordenes,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  });
}

/**
 * 📈 Obtiene las órdenes de un usuario específico
 * @param {string} usuarioId - UUID del usuario
 * @param {number} limite - Cantidad de órdenes a devolver (default: 10)
 * @returns {Promise<Array>} Lista de órdenes del usuario
 */
async function ordenesDelUsuario(usuarioId, limite = 10) {
  const ordenes = await prisma.orden.findMany({
    where: { usuarioId },
    include: {
      detalles: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              sku: true
            }
          }
        }
      }
    },
    orderBy: {
      fechaCreacion: 'desc'
    },
    take: limite
  });

  return convertBigIntToString(ordenes);
}

/**
 * ❌ Cancela una orden (solo si está en estado 'pendiente')
 * @param {number} ordenId - ID de la orden
 * @param {string} usuarioId - UUID del usuario que realiza la acción
 * @returns {Promise<Object>} Orden cancelada
 */
async function cancelarOrden(ordenId, usuarioId) {
  const orden = await prisma.orden.findUnique({
    where: { id: BigInt(ordenId) }
  });

  if (!orden) {
    throw new Error('Orden no encontrada');
  }

  if (orden.estado !== 'pendiente') {
    throw new Error('Solo se pueden cancelar órdenes en estado pendiente');
  }

  // Devolver stock (revertir movimientos)
  const detalles = await prisma.ordenDetalle.findMany({
    where: { ordenId: BigInt(ordenId) }
  });

  for (const detalle of detalles) {
    await prisma.$executeRaw`
      SELECT proc_actualizar_stock(
        ${detalle.productoId}::INT,
        ${detalle.cantidad}::INT,
        'devolucion'::VARCHAR,
        ${'Cancelación orden #' + ordenId}::VARCHAR,
        ${usuarioId}::UUID
      )
    `;
  }

  const ordenActualizada = await prisma.orden.update({
    where: { id: BigInt(ordenId) },
    data: {
      estado: 'cancelada'
    }
  });

  return convertBigIntToString(ordenActualizada);
}

module.exports = {
  crearOrden,
  confirmarOrden,
  obtenerOrden,
  listarOrdenes,
  ordenesDelUsuario,
  cancelarOrden
};
