
const express = require('express');
const { body } = require('express-validator');
const {
  registrarCompra,
  obtenerCompra,
  listarCompras,
  confirmarRecepcion,
  cancelarCompra
} = require('../controllers/compra.controller');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones para registrar compra
const validarCompra = [
  body('proveedorId')
    .isInt({ min: 1 })
    .withMessage('ID de proveedor inválido'),
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
 * @route   POST /api/compras
 * @desc    Registrar nueva compra
 * @access  Private (Admin/Comprador)
 */
router.post(
  '/',
  requireRole('admin', 'comprador'),
  validarCompra,
  registrarCompra
);

/**
 * @route   GET /api/compras
 * @desc    Listar compras
 * @access  Private
 */
router.get('/', listarCompras);

/**
 * @route   GET /api/compras/:id
 * @desc    Obtener detalle de compra
 * @access  Private
 */
router.get('/:id', obtenerCompra);

/**
 * @route   PATCH /api/compras/:id/confirmar
 * @desc    Confirmar recepción de compra
 * @access  Private (Admin/Comprador)
 */
router.patch(
  '/:id/confirmar',
  requireRole('admin', 'comprador'),
  confirmarRecepcion
);

/**
 * @route   DELETE /api/compras/:id
 * @desc    Cancelar compra
 * @access  Private (Admin/Comprador)
 */
router.delete(
  '/:id',
  requireRole(['admin', 'comprador']),
  cancelarCompra
);

module.exports = router;
