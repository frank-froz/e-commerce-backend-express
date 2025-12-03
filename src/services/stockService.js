// 📦 Servicio de Stock
// Gestión de inventario y movimientos de stock

const prisma = require('../config/prisma');

/**
 * 🔄 Actualiza el stock de un producto y registra el movimiento
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad a agregar/restar (negativo para salidas)
 * @param {string} tipoMovimiento - Tipo: 'compra', 'venta', 'ajuste', 'devolución'
 * @param {string} referencia - Referencia del documento
 * @param {string} usuarioId - UUID del usuario que realiza el movimiento
 */
async function actualizarStock(productoId, cantidad, tipoMovimiento, referencia, usuarioId) {
  const result = await prisma.$executeRaw`
    SELECT proc_actualizar_stock(
      ${productoId}::INT,
      ${cantidad}::INT,
      ${tipoMovimiento}::VARCHAR,
      ${referencia}::VARCHAR,
      ${usuarioId}::UUID
    )
  `;
  
  return result;
}

/**
 * ✅ Verifica si hay stock suficiente para un producto
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad requerida
 * @throws {Error} Si no hay stock suficiente
 */
async function verificarStock(productoId, cantidad) {
  try {
    await prisma.$executeRaw`
      SELECT proc_verificar_stock(
        ${productoId}::INT,
        ${cantidad}::INT
      )
    `;
    return true;
  } catch (error) {
    throw new Error(`Stock insuficiente para el producto ${productoId}`);
  }
}

/**
 * 📊 Obtiene el stock actual de un producto
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Información del stock
 */
async function obtenerStock(productoId) {
  const stock = await prisma.stockProducto.findUnique({
    where: { productoId },
    include: {
      producto: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true,
        }
      }
    }
  });

  if (!stock) {
    return {
      productoId,
      cantidad: 0,
      disponible: false
    };
  }

  return {
    ...stock,
    disponible: stock.cantidad > 0
  };
}

/**
 * 📜 Obtiene el historial de movimientos de un producto
 * @param {number} productoId - ID del producto
 * @param {number} limite - Cantidad de registros a devolver (default: 50)
 * @returns {Promise<Array>} Historial de movimientos
 */
async function obtenerMovimientos(productoId, limite = 50) {
  return await prisma.movimientoStock.findMany({
    where: { productoId },
    include: {
      creador: {
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
    take: limite
  });
}

/**
 * 📦 Obtiene productos con stock bajo (< cantidad mínima)
 * @param {number} cantidadMinima - Umbral de stock bajo (default: 10)
 * @returns {Promise<Array>} Productos con stock bajo
 */
async function productosConStockBajo(cantidadMinima = 10) {
  return await prisma.stockProducto.findMany({
    where: {
      cantidad: {
        lt: cantidadMinima
      }
    },
    include: {
      producto: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true,
          activo: true
        }
      }
    },
    orderBy: {
      cantidad: 'asc'
    }
  });
}

module.exports = {
  actualizarStock,
  verificarStock,
  obtenerStock,
  obtenerMovimientos,
  productosConStockBajo
};
