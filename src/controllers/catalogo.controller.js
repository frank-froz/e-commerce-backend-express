// 📚 Controlador de Catálogos
// Gestión de Marcas, Categorías, Tipos y Líneas de Producto

const catalogoService = require('../services/catalogoService');
const { validationResult } = require('express-validator');



const listarMarcas = async (req, res) => {
  try {
    const marcas = await catalogoService.listarMarcas();
    res.json({ success: true, data: marcas });
  } catch (error) {
    console.error('Error al listar marcas:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al listar marcas', code: 'FETCH_ERROR' }
    });
  }
};

const obtenerMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await catalogoService.obtenerMarca(id);
    res.json({ success: true, data: marca });
  } catch (error) {
    console.error('Error al obtener marca:', error);
    const statusCode = error.message === 'Marca no encontrada' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR' }
    });
  }
};

const crearMarca = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { nombre } = req.body;
    const marca = await catalogoService.crearMarca(nombre);
    res.status(201).json({ success: true, message: 'Marca creada exitosamente', data: marca });
  } catch (error) {
    console.error('Error al crear marca:', error);
    const statusCode = error.message === 'La marca ya existe' ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 409 ? 'DUPLICATE' : 'CREATE_ERROR' }
    });
  }
};

const actualizarMarca = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const { nombre } = req.body;
    const marca = await catalogoService.actualizarMarca(id, nombre);
    res.json({ success: true, message: 'Marca actualizada exitosamente', data: marca });
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al actualizar marca', code: 'UPDATE_ERROR' }
    });
  }
};

const eliminarMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await catalogoService.eliminarMarca(id);
    res.json({ success: true, message: 'Marca eliminada exitosamente', data: marca });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al eliminar marca', code: 'DELETE_ERROR' }
    });
  }
};

// ============================================
// CATEGORÍAS
// ============================================

const listarCategorias = async (req, res) => {
  try {
    const categorias = await catalogoService.listarCategorias();
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al listar categorías', code: 'FETCH_ERROR' }
    });
  }
};

const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await catalogoService.obtenerCategoria(id);
    res.json({ success: true, data: categoria });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    const statusCode = error.message === 'Categoría no encontrada' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR' }
    });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const categoria = await catalogoService.crearCategoria(req.body);
    res.status(201).json({ success: true, message: 'Categoría creada exitosamente', data: categoria });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    const statusCode = error.message === 'La categoría ya existe' ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 409 ? 'DUPLICATE' : 'CREATE_ERROR' }
    });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const categoria = await catalogoService.actualizarCategoria(id, req.body);
    res.json({ success: true, message: 'Categoría actualizada exitosamente', data: categoria });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al actualizar categoría', code: 'UPDATE_ERROR' }
    });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await catalogoService.eliminarCategoria(id);
    res.json({ success: true, message: 'Categoría eliminada exitosamente', data: categoria });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al eliminar categoría', code: 'DELETE_ERROR' }
    });
  }
};

// ============================================
// TIPOS DE PRODUCTO
// ============================================

const listarTiposProducto = async (req, res) => {
  try {
    const tipos = await catalogoService.listarTiposProducto();
    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error('Error al listar tipos de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al listar tipos de producto', code: 'FETCH_ERROR' }
    });
  }
};

const obtenerTipoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await catalogoService.obtenerTipoProducto(id);
    res.json({ success: true, data: tipo });
  } catch (error) {
    console.error('Error al obtener tipo de producto:', error);
    const statusCode = error.message === 'Tipo de producto no encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR' }
    });
  }
};

const crearTipoProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const tipo = await catalogoService.crearTipoProducto(req.body);
    res.status(201).json({ success: true, message: 'Tipo de producto creado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error al crear tipo de producto:', error);
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 409 ? 'DUPLICATE' : 'CREATE_ERROR' }
    });
  }
};

const actualizarTipoProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const tipo = await catalogoService.actualizarTipoProducto(id, req.body);
    res.json({ success: true, message: 'Tipo de producto actualizado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error al actualizar tipo de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al actualizar tipo de producto', code: 'UPDATE_ERROR' }
    });
  }
};

const eliminarTipoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await catalogoService.eliminarTipoProducto(id);
    res.json({ success: true, message: 'Tipo de producto eliminado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error al eliminar tipo de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al eliminar tipo de producto', code: 'DELETE_ERROR' }
    });
  }
};

// ============================================
// LÍNEAS DE PRODUCTO
// ============================================

const listarLineasProducto = async (req, res) => {
  try {
    const { tipoProductoId } = req.query;
    const lineas = await catalogoService.listarLineasProducto(tipoProductoId);
    res.json({ success: true, data: lineas });
  } catch (error) {
    console.error('Error al listar líneas de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al listar líneas de producto', code: 'FETCH_ERROR' }
    });
  }
};

const obtenerLineaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const linea = await catalogoService.obtenerLineaProducto(id);
    res.json({ success: true, data: linea });
  } catch (error) {
    console.error('Error al obtener línea de producto:', error);
    const statusCode = error.message === 'Línea de producto no encontrada' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR' }
    });
  }
};

const crearLineaProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const linea = await catalogoService.crearLineaProducto(req.body);
    res.status(201).json({ success: true, message: 'Línea de producto creada exitosamente', data: linea });
  } catch (error) {
    console.error('Error al crear línea de producto:', error);
    const statusCode = error.message.includes('ya existe') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: { message: error.message, code: statusCode === 409 ? 'DUPLICATE' : 'CREATE_ERROR' }
    });
  }
};

const actualizarLineaProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { id } = req.params;
    const linea = await catalogoService.actualizarLineaProducto(id, req.body);
    res.json({ success: true, message: 'Línea de producto actualizada exitosamente', data: linea });
  } catch (error) {
    console.error('Error al actualizar línea de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al actualizar línea de producto', code: 'UPDATE_ERROR' }
    });
  }
};

const eliminarLineaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const linea = await catalogoService.eliminarLineaProducto(id);
    res.json({ success: true, message: 'Línea de producto eliminada exitosamente', data: linea });
  } catch (error) {
    console.error('Error al eliminar línea de producto:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al eliminar línea de producto', code: 'DELETE_ERROR' }
    });
  }
};

/**
 * 🛍️ Obtiene productos filtrados por línea de producto
 */
const obtenerProductosPorLinea = async (req, res) => {
  try {
    const { lineaId } = req.params;
    const { marcaId, categoriaId, precioMin, precioMax } = req.query;

    const filtros = {};
    if (marcaId) filtros.marcaId = marcaId;
    if (categoriaId) filtros.categoriaId = categoriaId;
    if (precioMin) filtros.precioMin = precioMin;
    if (precioMax) filtros.precioMax = precioMax;

    const productos = await catalogoService.obtenerProductosPorLinea(lineaId, filtros);
    
    if (!productos || productos.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'No hay productos en esta línea', code: 'NOT_FOUND' }
      });
    }

    res.json({ 
      success: true, 
      data: productos,
      count: productos.length 
    });
  } catch (error) {
    console.error('Error al obtener productos por línea:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error al obtener productos', code: 'FETCH_ERROR' }
    });
  }
};

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
  eliminarLineaProducto,
  
  // Productos por Línea
  obtenerProductosPorLinea
};