// 🛒 Servicio de Compras
// Gestión de compras a proveedores

const prisma = require('../config/prisma');

/**
 * 📝 Registra una compra completa con detalle y actualiza stock
 * @param {number} proveedorId - ID del proveedor
 * @param {string} usuarioId - UUID del usuario que registra la compra
 * @param {Array} items - Array de items: [{producto_id, precio_unitario, cantidad}]
 * @returns {Promise<number>} ID de la compra creada
 * 
 * @example
 * const compraId = await registrarCompra(1, 'uuid-usuario', [
 *   { producto_id: 10, precio_unitario: 50.00, cantidad: 20 },
 *   { producto_id: 15, precio_unitario: 30.00, cantidad: 50 }
 * ]);
 */
async function registrarCompra(proveedorId, usuarioId, items) {
  // Convertir items a JSON para el procedimiento almacenado
  const itemsJson = JSON.stringify(items);
  
  const result = await prisma.$queryRaw`
    SELECT proc_registrar_compra(
      ${proveedorId}::INT,
      ${usuarioId}::UUID,
      ${itemsJson}::JSON
    ) as compra_id
  `;
  
  return Number(result[0].compra_id);
}

/**
 * 📋 Obtiene el detalle completo de una compra
 * @param {number} compraId - ID de la compra
 * @returns {Promise<Object>} Compra con sus detalles
 */
async function obtenerCompra(compraId) {
  const compra = await prisma.compra.findUnique({
    where: { id: BigInt(compraId) },
    include: {
      proveedor: true,
      creador: {
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
              nombre: true
            }
          }
        }
      }
    }
  });

  // Convertir BigInt a string para JSON
  if (compra) {
    compra.id = compra.id.toString();
    compra.detalles = compra.detalles.map(detalle => ({
      ...detalle,
      id: detalle.id.toString(),
      compraId: detalle.compraId.toString()
    }));
  }

  return compra;
}

/**
 * 📊 Lista todas las compras con filtros opcionales
 * @param {Object} filtros - { proveedorId, estado, fechaDesde, fechaHasta }
 * @param {number} pagina - Número de página (default: 1)
 * @param {number} limite - Registros por página (default: 20)
 * @returns {Promise<Object>} { compras, total, pagina, totalPaginas }
 */
async function listarCompras(filtros = {}, pagina = 1, limite = 20) {
  const where = {};

  if (filtros.proveedorId) {
    where.proveedorId = filtros.proveedorId;
  }

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    where.fechaCreacion = {};
    if (filtros.fechaDesde) where.fechaCreacion.gte = new Date(filtros.fechaDesde);
    if (filtros.fechaHasta) where.fechaCreacion.lte = new Date(filtros.fechaHasta);
  }

  const [compras, total] = await Promise.all([
    prisma.compra.findMany({
      where,
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true
          }
        },
        creador: {
          select: {
            id: true,
            nombreCompleto: true
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      },
      skip: (pagina - 1) * limite,
      take: limite
    }),
    prisma.compra.count({ where })
  ]);

  return {
    compras: compras.map(c => ({
      ...c,
      id: c.id.toString()
    })),
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  };
}

/**
 * 📦 Confirma la recepción de una compra
 * @param {number} compraId - ID de la compra
 * @returns {Promise<Object>} Compra actualizada
 */
async function confirmarRecepcion(compraId) {
  return await prisma.compra.update({
    where: { id: BigInt(compraId) },
    data: {
      estado: 'recibida',
      fechaRecepcion: new Date()
    },
    include: {
      proveedor: true,
      detalles: {
        include: {
          producto: true
        }
      }
    }
  });
}

/**
 * ❌ Cancela una compra en estado borrador
 * @param {number} compraId - ID de la compra
 * @returns {Promise<Object>} Compra cancelada
 */
async function cancelarCompra(compraId) {
  const compra = await prisma.compra.findUnique({
    where: { id: BigInt(compraId) }
  });

  if (!compra) {
    throw new Error('Compra no encontrada');
  }

  if (compra.estado !== 'borrador') {
    throw new Error('Solo se pueden cancelar compras en estado borrador');
  }

  return await prisma.compra.update({
    where: { id: BigInt(compraId) },
    data: {
      estado: 'cancelada'
    }
  });
}

module.exports = {
  registrarCompra,
  obtenerCompra,
  listarCompras,
  confirmarRecepcion,
  cancelarCompra
};
