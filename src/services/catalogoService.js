// 📚 Servicio de Catálogos
// Gestión de Marcas, Categorías, Tipos y Líneas de Producto

const prisma = require('../config/prisma');
const { convertBigIntToString } = require('../utils/bigint');



/**
 * 📋 Lista todas las marcas
 * @returns {Promise<Array>} Marcas
 */
async function listarMarcas() {
  const marcas = await prisma.marca.findMany({
    orderBy: { nombre: 'asc' }
  });
  return convertBigIntToString(marcas);
}

/**
 * 🔍 Obtiene una marca por ID
 * @param {number} id 
 * @returns {Promise<Object>} 
 */
async function obtenerMarca(id) {
  const marca = await prisma.marca.findUnique({
    where: { id: parseInt(id) },
    include: {
      productos: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true,
          activo: true
        }
      }
    }
  });

  if (!marca) {
    throw new Error('Marca no encontrada');
  }

  return convertBigIntToString(marca);
}

/**
 * ➕ Crea una nueva marca
 * @param {string} nombre - Nombre de la marca
 * @returns {Promise<Object>} Marca creada
 */
async function crearMarca(nombre) {
  const existente = await prisma.marca.findUnique({
    where: { nombre }
  });

  if (existente) {
    throw new Error('La marca ya existe');
  }

  const marca = await prisma.marca.create({
    data: { nombre }
  });

  return convertBigIntToString(marca);
}

/**
 * ✏️ Actualiza una marca
 * @param {number} id - ID de la marca
 * @param {string} nombre - Nuevo nombre
 * @returns {Promise<Object>} Marca actualizada
 */
async function actualizarMarca(id, nombre) {
  const marca = await prisma.marca.update({
    where: { id: parseInt(id) },
    data: { nombre }
  });

  return convertBigIntToString(marca);
}

/**
 * 🗑️ Elimina una marca (si no tiene productos)
 * @param {number} id - ID de la marca
 * @returns {Promise<Object>} Marca eliminada
 */
async function eliminarMarca(id) {
  const marca = await prisma.marca.delete({
    where: { id: parseInt(id) }
  });

  return convertBigIntToString(marca);
}

// ============================================
// CATEGORÍAS
// ============================================

/**
 * 📋 Lista todas las categorías con jerarquía
 * @returns {Promise<Array>} Categorías
 */
async function listarCategorias() {
  const categorias = await prisma.categoria.findMany({
    include: {
      categoriaPadre: {
        select: { id: true, nombre: true }
      },
      subcategorias: {
        select: { id: true, nombre: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return convertBigIntToString(categorias);
}

/**
 * 🔍 Obtiene una categoría por ID
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Categoría
 */
async function obtenerCategoria(id) {
  const categoria = await prisma.categoria.findUnique({
    where: { id: parseInt(id) },
    include: {
      categoriaPadre: true,
      subcategorias: true,
      productos: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true,
          activo: true
        }
      }
    }
  });

  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  return convertBigIntToString(categoria);
}

/**
 * ➕ Crea una nueva categoría
 * @param {Object} datos - { nombre, categoriaPadreId }
 * @returns {Promise<Object>} Categoría creada
 */
async function crearCategoria({ nombre, categoriaPadreId }) {
  const existente = await prisma.categoria.findUnique({
    where: { nombre }
  });

  if (existente) {
    throw new Error('La categoría ya existe');
  }

  const categoria = await prisma.categoria.create({
    data: {
      nombre,
      categoriaPadreId: categoriaPadreId ? parseInt(categoriaPadreId) : null
    },
    include: {
      categoriaPadre: true
    }
  });

  return convertBigIntToString(categoria);
}

/**
 * ✏️ Actualiza una categoría
 * @param {number} id - ID de la categoría
 * @param {Object} datos - { nombre, categoriaPadreId }
 * @returns {Promise<Object>} Categoría actualizada
 */
async function actualizarCategoria(id, { nombre, categoriaPadreId }) {
  const dataToUpdate = {};
  if (nombre !== undefined) dataToUpdate.nombre = nombre;
  if (categoriaPadreId !== undefined) {
    dataToUpdate.categoriaPadreId = categoriaPadreId ? parseInt(categoriaPadreId) : null;
  }

  const categoria = await prisma.categoria.update({
    where: { id: parseInt(id) },
    data: dataToUpdate,
    include: {
      categoriaPadre: true,
      subcategorias: true
    }
  });

  return convertBigIntToString(categoria);
}

/**
 * 🗑️ Elimina una categoría (si no tiene productos ni subcategorías)
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Categoría eliminada
 */
async function eliminarCategoria(id) {
  const categoria = await prisma.categoria.delete({
    where: { id: parseInt(id) }
  });

  return convertBigIntToString(categoria);
}

// ============================================
// TIPOS DE PRODUCTO
// ============================================

/**
 * 📋 Lista todos los tipos de producto
 * @returns {Promise<Array>} Tipos de producto
 */
async function listarTiposProducto() {
  const tipos = await prisma.tipoProducto.findMany({
    include: {
      lineas: {
        select: { id: true, codigo: true, nombre: true, descuentoPorcentaje: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return convertBigIntToString(tipos);
}

/**
 * 🔍 Obtiene un tipo de producto por ID
 * @param {number} id - ID del tipo
 * @returns {Promise<Object>} Tipo de producto
 */
async function obtenerTipoProducto(id) {
  const tipo = await prisma.tipoProducto.findUnique({
    where: { id: parseInt(id) },
    include: {
      lineas: true,
      productos: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true
        }
      }
    }
  });

  if (!tipo) {
    throw new Error('Tipo de producto no encontrado');
  }

  return convertBigIntToString(tipo);
}

/**
 * ➕ Crea un nuevo tipo de producto
 * @param {Object} datos - { codigo, nombre }
 * @returns {Promise<Object>} Tipo creado
 */
async function crearTipoProducto({ codigo, nombre }) {
  const existente = await prisma.tipoProducto.findUnique({
    where: { codigo }
  });

  if (existente) {
    throw new Error('El código de tipo de producto ya existe');
  }

  const tipo = await prisma.tipoProducto.create({
    data: { codigo, nombre }
  });

  return convertBigIntToString(tipo);
}

/**
 * ✏️ Actualiza un tipo de producto
 * @param {number} id - ID del tipo
 * @param {Object} datos - { codigo, nombre }
 * @returns {Promise<Object>} Tipo actualizado
 */
async function actualizarTipoProducto(id, { codigo, nombre }) {
  const dataToUpdate = {};
  if (codigo !== undefined) dataToUpdate.codigo = codigo;
  if (nombre !== undefined) dataToUpdate.nombre = nombre;

  const tipo = await prisma.tipoProducto.update({
    where: { id: parseInt(id) },
    data: dataToUpdate
  });

  return convertBigIntToString(tipo);
}

/**
 * 🗑️ Elimina un tipo de producto (si no tiene líneas ni productos)
 * @param {number} id - ID del tipo
 * @returns {Promise<Object>} Tipo eliminado
 */
async function eliminarTipoProducto(id) {
  const tipo = await prisma.tipoProducto.delete({
    where: { id: parseInt(id) }
  });

  return convertBigIntToString(tipo);
}

// ============================================
// LÍNEAS DE PRODUCTO
// ============================================

/**
 * 📋 Lista todas las líneas de producto
 * @param {number} tipoProductoId - Filtrar por tipo (opcional)
 * @returns {Promise<Array>} Líneas de producto
 */
async function listarLineasProducto(tipoProductoId) {
  const where = {};
  if (tipoProductoId) {
    where.tipoProductoId = parseInt(tipoProductoId);
  }

  const lineas = await prisma.lineaProducto.findMany({
    where,
    include: {
      tipoProducto: {
        select: { id: true, codigo: true, nombre: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return convertBigIntToString(lineas);
}

/**
 * 🔍 Obtiene una línea de producto por ID
 * @param {number} id - ID de la línea
 * @returns {Promise<Object>} Línea de producto
 */
async function obtenerLineaProducto(id) {
  const linea = await prisma.lineaProducto.findUnique({
    where: { id: parseInt(id) },
    include: {
      tipoProducto: true,
      productos: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          precio: true
        }
      }
    }
  });

  if (!linea) {
    throw new Error('Línea de producto no encontrada');
  }

  return convertBigIntToString(linea);
}

/**
 * ➕ Crea una nueva línea de producto
 * @param {Object} datos - { tipoProductoId, codigo, nombre, descuentoPorcentaje }
 * @returns {Promise<Object>} Línea creada
 */
async function crearLineaProducto({ tipoProductoId, codigo, nombre, descuentoPorcentaje }) {
  const existente = await prisma.lineaProducto.findFirst({
    where: {
      tipoProductoId: parseInt(tipoProductoId),
      codigo
    }
  });

  if (existente) {
    throw new Error('El código de línea ya existe para este tipo de producto');
  }

  const linea = await prisma.lineaProducto.create({
    data: {
      tipoProductoId: parseInt(tipoProductoId),
      codigo,
      nombre,
      descuentoPorcentaje: descuentoPorcentaje ? parseFloat(descuentoPorcentaje) : 0
    },
    include: {
      tipoProducto: true
    }
  });

  return convertBigIntToString(linea);
}

/**
 * ✏️ Actualiza una línea de producto
 * @param {number} id - ID de la línea
 * @param {Object} datos - { codigo, nombre, descuentoPorcentaje }
 * @returns {Promise<Object>} Línea actualizada
 */
async function actualizarLineaProducto(id, { codigo, nombre, descuentoPorcentaje }) {
  const dataToUpdate = {};
  if (codigo !== undefined) dataToUpdate.codigo = codigo;
  if (nombre !== undefined) dataToUpdate.nombre = nombre;
  if (descuentoPorcentaje !== undefined) {
    dataToUpdate.descuentoPorcentaje = parseFloat(descuentoPorcentaje);
  }

  const linea = await prisma.lineaProducto.update({
    where: { id: parseInt(id) },
    data: dataToUpdate,
    include: {
      tipoProducto: true
    }
  });

  return convertBigIntToString(linea);
}

/**
 * 🗑️ Elimina una línea de producto (si no tiene productos)
 * @param {number} id - ID de la línea
 * @returns {Promise<Object>} Línea eliminada
 */
async function eliminarLineaProducto(id) {
  const linea = await prisma.lineaProducto.delete({
    where: { id: parseInt(id) }
  });

  return convertBigIntToString(linea);
}

module.exports = {
  // Marcas
  listarMarcas,
  obtenerMarca,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
  
  // Categorías
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  
  // Tipos de Producto
  listarTiposProducto,
  obtenerTipoProducto,
  crearTipoProducto,
  actualizarTipoProducto,
  eliminarTipoProducto,
  
  // Líneas de Producto
  listarLineasProducto,
  obtenerLineaProducto,
  crearLineaProducto,
  actualizarLineaProducto,
  eliminarLineaProducto
};
