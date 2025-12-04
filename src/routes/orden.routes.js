// 🛍️ Rutas de Órdenes
const express = require('express');
const { body } = require('express-validator');
const {
  crearOrden,
  obtenerOrden,
  listarOrdenes,
  misOrdenes,
  confirmarOrden,
  cancelarOrden
} = require('../controllers/orden.controller');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones para crear orden
const validarOrden = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un item'),
  body('items.*.producto_id')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  body('items.*.precio_unitario')
    .isFloat({ min: 0 })
    .withMessage('Precio unitario inválido'),
  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad inválida')
];

/**
 * @route   POST /api/ordenes
 * @desc    Crear nueva orden
 * @access  Private
 */
router.post('/', validarOrden, crearOrden);

/**
 * @route   GET /api/ordenes/mis-ordenes
 * @desc    Obtener mis órdenes
 * @access  Private
 */
router.get('/mis-ordenes', misOrdenes);

/**
 * @route   GET /api/ordenes
 * @desc    Listar órdenes (propias o todas si es admin)
 * @access  Private
 */
router.get('/', listarOrdenes);

/**
 * @route   GET /api/ordenes/:id
 * @desc    Obtener detalle de orden
 * @access  Private
 */
router.get('/:id', obtenerOrden);

/**
 * @route   PATCH /api/ordenes/:id/confirmar
 * @desc    Confirmar orden
 * @access  Private (Admin)
 */
router.patch(
  '/:id/confirmar',
  requireRole(['admin']),
  confirmarOrden
);

/**
 * @route   DELETE /api/ordenes/:id
 * @desc    Cancelar orden
 * @access  Private
 */
router.delete('/:id', cancelarOrden);

module.exports = router;
