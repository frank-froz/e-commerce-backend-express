

const carritoService = require('../services/carritoService');
const { validationResult } = require('express-validator');

/**
 * @route   GET /api/carrito
 * @desc    Obtener carrito del usuario actual
 * @access  Private
 */
const obtenerCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const carrito = await carritoService.obtenerCarrito(usuarioId);

    if (!carrito) {
      return res.json({
        success: true,
        message: 'No tienes un carrito activo',
        data: null
      });
    }

    res.json({
      success: true,
      data: carrito
    });

  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener el carrito',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/carrito/items
 * @desc    Agregar o actualizar producto en el carrito
 * @access  Private
 */
const agregarAlCarrito = async (req, res) => {
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

    const { productoId, cantidad, precio } = req.body;
    const usuarioId = req.user.id;

    await carritoService.actualizarCarrito(
      usuarioId,
      productoId,
      cantidad,
      precio
    );

    const carrito = await carritoService.obtenerCarrito(usuarioId);

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: carrito
    });

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al agregar producto al carrito',
        code: 'CART_ERROR'
      }
    });
  }
};

/**
 * @route   PATCH /api/carrito/items/:productoId
 * @desc    Actualizar cantidad de un producto en el carrito
 * @access  Private
 */
const actualizarCantidad = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;
    const usuarioId = req.user.id;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'La cantidad debe ser mayor a 0',
          code: 'INVALID_QUANTITY'
        }
      });
    }

    await carritoService.actualizarCantidad(
      usuarioId,
      parseInt(productoId),
      cantidad
    );

    const carrito = await carritoService.obtenerCarrito(usuarioId);

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: carrito
    });

  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error al actualizar cantidad',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * @route   DELETE /api/carrito/items/:productoId
 * @desc    Eliminar producto del carrito
 * @access  Private
 */
const eliminarDelCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuarioId = req.user.id;

    await carritoService.eliminarDelCarrito(
      usuarioId,
      parseInt(productoId)
    );

    const carrito = await carritoService.obtenerCarrito(usuarioId);

    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: carrito
    });

  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error al eliminar producto del carrito',
        code: 'DELETE_ERROR'
      }
    });
  }
};

/**
 * @route   DELETE /api/carrito
 * @desc    Vaciar carrito completo
 * @access  Private
 */
const vaciarCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    await carritoService.vaciarCarrito(usuarioId);

    res.json({
      success: true,
      message: 'Carrito vaciado exitosamente',
      data: null
    });

  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al vaciar el carrito',
        code: 'CLEAR_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/carrito/checkout
 * @desc    Convertir carrito en orden
 * @access  Private
 */
const checkout = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const ordenId = await carritoService.checkoutCarrito(usuarioId);

    // Obtener la orden creada con los servicios
    const ordenService = require('../services/ordenService');
    const orden = await ordenService.obtenerOrden(ordenId);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente desde el carrito',
      data: orden
    });

  } catch (error) {
    console.error('Error en checkout:', error);
    
    if (error.message.includes('carrito está vacío')) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'El carrito está vacío',
          code: 'EMPTY_CART'
        }
      });
    }

    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Stock insuficiente para uno o más productos',
          code: 'INSUFFICIENT_STOCK'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al procesar el checkout',
        code: 'CHECKOUT_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/carrito/resumen
 * @desc    Obtener resumen del carrito (sin detalles)
 * @access  Private
 */
const resumenCarrito = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const resumen = await carritoService.resumenCarrito(usuarioId);

    res.json({
      success: true,
      data: resumen
    });

  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener resumen del carrito',
        code: 'FETCH_ERROR'
      }
    });
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  checkout,
  resumenCarrito
};
