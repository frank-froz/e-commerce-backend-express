

const prisma = require('../config/prisma');
const { convertBigIntToString } = require('../utils/bigint');

/**
 * 💰 Calcula el precio con descuento aplicado desde la línea de producto
 * @param {Object} producto - Producto con lineaProducto incluido
 * @returns {Object} { precioOriginal, descuentoPorcentaje, precioConDescuento, tieneDescuento }
 */
function calcularPrecioConDescuento(producto) {
  const precioOriginal = parseFloat(producto.precio);
  const descuentoPorcentaje = producto.lineaProducto?.descuentoPorcentaje 
    ? parseFloat(producto.lineaProducto.descuentoPorcentaje) 
    : 0;
  
  const tieneDescuento = descuentoPorcentaje > 0;
  const descuentoMonto = tieneDescuento ? (precioOriginal * descuentoPorcentaje / 100) : 0;
  const precioConDescuento = precioOriginal - descuentoMonto;

  return {
    precioOriginal,
    descuentoPorcentaje,
    descuentoMonto,
    precioConDescuento,
    tieneDescuento
  };
}

/**
 * 📋 Lista todos los productos con filtros opcionales
 * @param {Object} filtros - { categoriaId, marcaId, busqueda, precioMin, precioMax, activo }
 * @param {number} pagina - Número de página (default: 1)
 * @param {number} limite - Registros por página (default: 20)
 * @returns {Promise<Object>} { productos, total, pagina, totalPaginas }
 */
async function listarProductos(filtros = {}, pagina = 1, limite = 20) {
  const where = {};

  if (filtros.categoriaId) {
    where.categoriaId = parseInt(filtros.categoriaId);
  }

  if (filtros.marcaId) {
    where.marcaId = parseInt(filtros.marcaId);
  }

  if (filtros.tipoProductoId) {
    where.tipoProductoId = parseInt(filtros.tipoProductoId);
  }

  if (filtros.lineaProductoId) {
    where.lineaProductoId = parseInt(filtros.lineaProductoId);
  }

  if (filtros.busqueda) {
    where.OR = [
      { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
      { sku: { contains: filtros.busqueda, mode: 'insensitive' } },
      { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } }
    ];
  }

  if (filtros.precioMin || filtros.precioMax) {
    where.precio = {};
    if (filtros.precioMin) where.precio.gte = parseFloat(filtros.precioMin);
    if (filtros.precioMax) where.precio.lte = parseFloat(filtros.precioMax);
  }

  if (filtros.activo !== undefined) {
    where.activo = filtros.activo === 'true' || filtros.activo === true;
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        marca: {
          select: { id: true, nombre: true }
        },
        categoria: {
          select: { id: true, nombre: true }
        },
        tipoProducto: {
          select: { id: true, nombre: true }
        },
        lineaProducto: {
          select: { id: true, nombre: true, descuentoPorcentaje: true }
        },
        stock: {
          select: { cantidad: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite
    }),
    prisma.producto.count({ where })
  ]);

  // Agregar información de descuentos a cada producto
  const productosConDescuento = productos.map(producto => {
    const precioInfo = calcularPrecioConDescuento(producto);
    return {
      ...producto,
      ...precioInfo
    };
  });

  return convertBigIntToString({
    productos: productosConDescuento,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  });
}

/**
 * 🔍 Obtiene un producto por ID
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Producto con detalles
 */
async function obtenerProducto(productoId) {
  const producto = await prisma.producto.findUnique({
    where: { id: parseInt(productoId) },
    include: {
      marca: true,
      categoria: true,
      tipoProducto: true,
      lineaProducto: true,
      stock: {
        select: {
          cantidad: true,
          fechaActualizacion: true
        }
      }
    }
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // Agregar información de descuentos
  const precioInfo = calcularPrecioConDescuento(producto);

  return convertBigIntToString({
    ...producto,
    ...precioInfo
  });
}

/**
 * ➕ Crea un nuevo producto
 * @param {Object} datos - Datos del producto
 * @returns {Promise<Object>} Producto creado
 */
async function crearProducto(datos) {
  const { sku, nombre, descripcion, precio, marcaId, categoriaId, tipoProductoId, lineaProductoId, activo } = datos;

  // Verificar si el SKU ya existe
  const existente = await prisma.producto.findUnique({
    where: { sku }
  });

  if (existente) {
    throw new Error('El SKU ya existe');
  }

  const producto = await prisma.producto.create({
    data: {
      sku,
      nombre,
      descripcion,
      precio: parseFloat(precio),
      marcaId: marcaId ? parseInt(marcaId) : null,
      categoriaId: categoriaId ? parseInt(categoriaId) : null,
      tipoProductoId: tipoProductoId ? parseInt(tipoProductoId) : null,
      lineaProductoId: lineaProductoId ? parseInt(lineaProductoId) : null,
      activo: activo !== undefined ? activo : true
    },
    include: {
      marca: true,
      categoria: true,
      tipoProducto: true,
      lineaProducto: true
    }
  });

  // Crear registro de stock inicial en 0
  await prisma.stockProducto.create({
    data: {
      productoId: producto.id,
      cantidad: 0
    }
  });

  return convertBigIntToString(producto);
}

/**
 * ✏️ Actualiza un producto existente
 * @param {number} productoId - ID del producto
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Producto actualizado
 */
async function actualizarProducto(productoId, datos) {
  const { sku, nombre, descripcion, precio, marcaId, categoriaId, tipoProductoId, lineaProductoId, activo } = datos;

  // Si se actualiza el SKU, verificar que no exista
  if (sku) {
    const existente = await prisma.producto.findFirst({
      where: {
        sku,
        NOT: { id: parseInt(productoId) }
      }
    });

    if (existente) {
      throw new Error('El SKU ya existe en otro producto');
    }
  }

  const dataToUpdate = {};
  if (sku !== undefined) dataToUpdate.sku = sku;
  if (nombre !== undefined) dataToUpdate.nombre = nombre;
  if (descripcion !== undefined) dataToUpdate.descripcion = descripcion;
  if (precio !== undefined) dataToUpdate.precio = parseFloat(precio);
  if (marcaId !== undefined) dataToUpdate.marcaId = marcaId ? parseInt(marcaId) : null;
  if (categoriaId !== undefined) dataToUpdate.categoriaId = categoriaId ? parseInt(categoriaId) : null;
  if (tipoProductoId !== undefined) dataToUpdate.tipoProductoId = tipoProductoId ? parseInt(tipoProductoId) : null;
  if (lineaProductoId !== undefined) dataToUpdate.lineaProductoId = lineaProductoId ? parseInt(lineaProductoId) : null;
  if (activo !== undefined) dataToUpdate.activo = activo;

  const producto = await prisma.producto.update({
    where: { id: parseInt(productoId) },
    data: dataToUpdate,
    include: {
      marca: true,
      categoria: true,
      tipoProducto: true,
      lineaProducto: true,
      stock: true
    }
  });

  return convertBigIntToString(producto);
}

/**
 * 🗑️ Desactiva un producto (soft delete)
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Producto desactivado
 */
async function desactivarProducto(productoId) {
  const producto = await prisma.producto.update({
    where: { id: parseInt(productoId) },
    data: { activo: false }
  });

  return convertBigIntToString(producto);
}

/**
 * 🔄 Activa un producto
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Producto activado
 */
async function activarProducto(productoId) {
  const producto = await prisma.producto.update({
    where: { id: parseInt(productoId) },
    data: { activo: true }
  });

  return convertBigIntToString(producto);
}

/**
 * 🔍 Busca productos por SKU exacto
 * @param {string} sku - SKU del producto
 * @returns {Promise<Object|null>} Producto encontrado o null
 */
async function buscarPorSku(sku) {
  const producto = await prisma.producto.findUnique({
    where: { sku },
    include: {
      marca: true,
      categoria: true,
      stock: true
    }
  });

  return producto ? convertBigIntToString(producto) : null;
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto,
  buscarPorSku
};