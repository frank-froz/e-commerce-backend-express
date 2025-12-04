

const ordenService = require('../services/ordenService');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/ordenes
 * @desc    Crear nueva orden
 * @access  Private
 */
const crearOrden = async (req, res) => {
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

    const { items } = req.body;
    const usuarioId = req.user.id;

    const ordenId = await ordenService.crearOrden(usuarioId, items);
    const orden = await ordenService.obtenerOrden(ordenId);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: orden
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'INSUFFICIENT_STOCK'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al crear la orden',
        code: 'ORDER_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/ordenes/:id
 * @desc    Obtener detalle de una orden
 * @access  Private
 */
const obtenerOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await ordenService.obtenerOrden(id);

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Orden no encontrada',
          code: 'NOT_FOUND'
        }
      });
    }

    // Verificar que el usuario sea dueño de la orden o sea admin
    if (orden.usuarioId !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'No tienes permiso para ver esta orden',
          code: 'FORBIDDEN'
        }
      });
    }

    res.json({
      success: true,
      data: orden
    });

  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener la orden',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/ordenes
 * @desc    Listar órdenes (propias o todas si es admin)
 * @access  Private
 */
const listarOrdenes = async (req, res) => {
  try {
    const {
      estado,
      fechaDesde,
      fechaHasta,
      pagina = 1,
      limite = 20
    } = req.query;

    const filtros = {};
    
    // Si no es admin, solo ver sus propias órdenes
    if (!req.user.roles.includes('admin')) {
      filtros.usuarioId = req.user.id;
    }
    
    if (estado) filtros.estado = estado;
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;

    const resultado = await ordenService.listarOrdenes(
      filtros,
      parseInt(pagina),
      parseInt(limite)
    );

    res.json({
      success: true,
      data: resultado.ordenes,
      pagination: {
        total: resultado.total,
        pagina: resultado.pagina,
        limite: parseInt(limite),
        totalPaginas: resultado.totalPaginas
      }
    });

  } catch (error) {
    console.error('Error al listar órdenes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al listar órdenes',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/ordenes/mis-ordenes
 * @desc    Obtener órdenes del usuario actual
 * @access  Private
 */
const misOrdenes = async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const usuarioId = req.user.id;

    const ordenes = await ordenService.ordenesDelUsuario(
      usuarioId,
      parseInt(limite)
    );

    res.json({
      success: true,
      data: ordenes
    });

  } catch (error) {
    console.error('Error al obtener mis órdenes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener tus órdenes',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   PATCH /api/ordenes/:id/confirmar
 * @desc    Confirmar una orden
 * @access  Private (Admin)
 */
const confirmarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    await ordenService.confirmarOrden(id);
    
    const orden = await ordenService.obtenerOrden(id);

    res.json({
      success: true,
      message: 'Orden confirmada exitosamente',
      data: orden
    });

  } catch (error) {
    console.error('Error al confirmar orden:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al confirmar la orden',
        code: 'CONFIRMATION_ERROR'
      }
    });
  }
};

/**
 * @route   DELETE /api/ordenes/:id
 * @desc    Cancelar orden (devuelve stock)
 * @access  Private
 */
const cancelarOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Verificar propiedad
    const orden = await ordenService.obtenerOrden(id);
    if (orden.usuarioId !== usuarioId && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'No tienes permiso para cancelar esta orden',
          code: 'FORBIDDEN'
        }
      });
    }

    const ordenCancelada = await ordenService.cancelarOrden(id, usuarioId);

    res.json({
      success: true,
      message: 'Orden cancelada exitosamente. Stock devuelto.',
      data: ordenCancelada
    });

  } catch (error) {
    console.error('Error al cancelar orden:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error al cancelar la orden',
        code: 'CANCELLATION_ERROR'
      }
    });
  }
};

module.exports = {
  crearOrden,
  obtenerOrden,
  listarOrdenes,
  misOrdenes,
  confirmarOrden,
  cancelarOrden
};
