

const compraService = require('../services/compraService');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/compras
 * @desc    Registrar nueva compra a proveedor
 * @access  Private (Admin/Comprador)
 */
const registrarCompra = async (req, res) => {
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

    const { proveedorId, items } = req.body;
    const usuarioId = req.user.id;

    const compraId = await compraService.registrarCompra(
      proveedorId,
      usuarioId,
      items
    );

    const compra = await compraService.obtenerCompra(compraId);

    res.status(201).json({
      success: true,
      message: 'Compra registrada exitosamente',
      data: compra
    });

  } catch (error) {
    console.error('Error al registrar compra:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al registrar la compra',
        code: 'COMPRA_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/compras/:id
 * @desc    Obtener detalle de una compra
 * @access  Private
 */
const obtenerCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await compraService.obtenerCompra(id);

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Compra no encontrada',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: compra
    });

  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al obtener la compra',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/compras
 * @desc    Listar compras con filtros
 * @access  Private
 */
const listarCompras = async (req, res) => {
  try {
    const {
      proveedorId,
      estado,
      fechaDesde,
      fechaHasta,
      pagina = 1,
      limite = 20
    } = req.query;

    const filtros = {};
    if (proveedorId) filtros.proveedorId = parseInt(proveedorId);
    if (estado) filtros.estado = estado;
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;

    const resultado = await compraService.listarCompras(
      filtros,
      parseInt(pagina),
      parseInt(limite)
    );

    res.json({
      success: true,
      data: resultado.compras,
      pagination: {
        total: resultado.total,
        pagina: resultado.pagina,
        limite: parseInt(limite),
        totalPaginas: resultado.totalPaginas
      }
    });

  } catch (error) {
    console.error('Error al listar compras:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al listar compras',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * @route   PATCH /api/compras/:id/confirmar
 * @desc    Confirmar recepción de compra
 * @access  Private (Admin/Comprador)
 */
const confirmarRecepcion = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await compraService.confirmarRecepcion(id);

    res.json({
      success: true,
      message: 'Compra confirmada exitosamente',
      data: compra
    });

  } catch (error) {
    console.error('Error al confirmar compra:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Error al confirmar la compra',
        code: 'CONFIRMATION_ERROR'
      }
    });
  }
};

/**
 * @route   DELETE /api/compras/:id
 * @desc    Cancelar compra (solo si está en borrador)
 * @access  Private (Admin/Comprador)
 */
const cancelarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await compraService.cancelarCompra(id);

    res.json({
      success: true,
      message: 'Compra cancelada exitosamente',
      data: compra
    });

  } catch (error) {
    console.error('Error al cancelar compra:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Error al cancelar la compra',
        code: 'CANCELLATION_ERROR'
      }
    });
  }
};

module.exports = {
  registrarCompra,
  obtenerCompra,
  listarCompras,
  confirmarRecepcion,
  cancelarCompra
};
