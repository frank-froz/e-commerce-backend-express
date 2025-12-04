// 📦 Controlador de Stock
// Gestión de inventario y movimientos

const stockService = require('../services/stockService');
const { validationResult } = require('express-validator');

/**
 * @route   GET /api/stock/:productoId
 * @desc    Obtener stock de un producto
 * @access  Private
 */
const obtenerStock = async (req, res) => {
  try {
    const { productoId } = req.params;
    const stock = await stockService.obtenerStock(parseInt(productoId));

    res.json({
      success: true,
      data: stock
    });

  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener el stock',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/stock/verificar
 * @desc    Verificar stock disponible para múltiples productos
 * @access  Private
 */
const verificarStock = async (req, res) => {
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

    const { items } = req.body; // [{ productoId, cantidad }]
    
    const resultados = [];
    for (const item of items) {
      try {
        await stockService.verificarStock(item.productoId, item.cantidad);
        resultados.push({
          productoId: item.productoId,
          disponible: true,
          mensaje: 'Stock suficiente'
        });
      } catch (error) {
        resultados.push({
          productoId: item.productoId,
          disponible: false,
          mensaje: error.message
        });
      }
    }

    const todosDisponibles = resultados.every(r => r.disponible);

    res.json({
      success: true,
      disponible: todosDisponibles,
      data: resultados
    });

  } catch (error) {
    console.error('Error al verificar stock:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al verificar el stock',
        code: 'VERIFICATION_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/stock/movimientos/:productoId
 * @desc    Obtener historial de movimientos de un producto
 * @access  Private (Admin)
 */
const obtenerMovimientos = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { limite = 50 } = req.query;

    const movimientos = await stockService.obtenerMovimientos(
      parseInt(productoId),
      parseInt(limite)
    );

    res.json({
      success: true,
      data: movimientos
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener movimientos',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/stock/bajo-stock
 * @desc    Obtener productos con stock bajo
 * @access  Private (Admin)
 */
const productosConStockBajo = async (req, res) => {
  try {
    const { minimo = 10 } = req.query;
    
    const productos = await stockService.productosConStockBajo(
      parseInt(minimo)
    );

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });

  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener productos con stock bajo',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/stock/ajustar
 * @desc    Ajustar stock manualmente (Admin)
 * @access  Private (Admin)
 */
const ajustarStock = async (req, res) => {
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

    const { productoId, cantidad, motivo } = req.body;
    const usuarioId = req.user.id;

    await stockService.actualizarStock(
      productoId,
      cantidad,
      'ajuste',
      motivo || 'Ajuste manual',
      usuarioId
    );

    const stock = await stockService.obtenerStock(productoId);

    res.json({
      success: true,
      message: 'Stock ajustado exitosamente',
      data: stock
    });

  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al ajustar el stock',
        code: 'ADJUSTMENT_ERROR'
      }
    });
  }
};

module.exports = {
  obtenerStock,
  verificarStock,
  obtenerMovimientos,
  productosConStockBajo,
  ajustarStock
};
