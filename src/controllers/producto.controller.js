// 📦 Controlador de Productos
// Gestión del catálogo de productos

const productoService = require('../services/productoService');
const { validationResult } = require('express-validator');

/**
 * @route   GET /api/productos
 * @desc    Listar productos con filtros
 * @access  Public
 */
const listarProductos = async (req, res) => {
  try {
    const { 
      categoriaId, 
      marcaId, 
      tipoProductoId,
      lineaProductoId,
      busqueda, 
      precioMin, 
      precioMax, 
      activo,
      pagina = 1, 
      limite = 20 
    } = req.query;

    const filtros = {
      categoriaId,
      marcaId,
      tipoProductoId,
      lineaProductoId,
      busqueda,
      precioMin,
      precioMax,
      activo
    };

    const resultado = await productoService.listarProductos(
      filtros,
      parseInt(pagina),
      parseInt(limite)
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al listar productos',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.obtenerProducto(parseInt(id));

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    const statusCode = error.message === 'Producto no encontrado' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener el producto',
        code: statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/productos/sku/:sku
 * @desc    Buscar producto por SKU
 * @access  Public
 */
const buscarPorSku = async (req, res) => {
  try {
    const { sku } = req.params;
    const producto = await productoService.buscarPorSku(sku);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Producto no encontrado',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: producto
    });

  } catch (error) {
    console.error('Error al buscar producto por SKU:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al buscar el producto',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/productos
 * @desc    Crear nuevo producto
 * @access  Private (Admin)
 */
const crearProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const producto = await productoService.crearProducto(req.body);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    const statusCode = error.message === 'El SKU ya existe' ? 409 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Error al crear el producto',
        code: statusCode === 409 ? 'DUPLICATE_SKU' : 'CREATE_ERROR'
      }
    });
  }
};

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar producto
 * @access  Private (Admin)
 */
const actualizarProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos inválidos',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const producto = await productoService.actualizarProducto(parseInt(id), req.body);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    const statusCode = error.message.includes('SKU ya existe') ? 409 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Error al actualizar el producto',
        code: statusCode === 409 ? 'DUPLICATE_SKU' : 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @route   DELETE /api/productos/:id
 * @desc    Desactivar producto (soft delete)
 * @access  Private (Admin)
 */
const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.desactivarProducto(parseInt(id));

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente',
      data: producto
    });

  } catch (error) {
    console.error('Error al desactivar producto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al desactivar el producto',
        code: 'DELETE_ERROR'
      }
    });
  }
};

/**
 * @route   PATCH /api/productos/:id/activar
 * @desc    Activar producto
 * @access  Private (Admin)
 */
const activarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productoService.activarProducto(parseInt(id));

    res.json({
      success: true,
      message: 'Producto activado exitosamente',
      data: producto
    });

  } catch (error) {
    console.error('Error al activar producto:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al activar el producto',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
  buscarPorSku,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  activarProducto
};