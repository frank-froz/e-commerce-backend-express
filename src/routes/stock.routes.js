// 📦 Rutas de Stock
const express = require('express');
const { body } = require('express-validator');
const {
  obtenerStock,
  verificarStock,
  obtenerMovimientos,
  productosConStockBajo,
  ajustarStock
} = require('../controllers/stock.controller');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth.middleware');

const router = express.Router();

// Validaciones
const validarVerificacion = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un item'),
  body('items.*.productoId')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('Cantidad inválida')
];


const validarAjuste = [
  body('productoId')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  body('cantidad')
    .isInt()
    .withMessage('Cantidad inválida'),
  body('motivo')
    .optional()
    .isString()
    .withMessage('Motivo debe ser texto')
];

/**
 * @route   POST /api/stock/verificar
 * @desc    Verificar stock disponible
 * @access  Public
 */
router.post('/verificar', validarVerificacion, verificarStock);

/**
 * @route   GET /api/stock/bajo-stock
 * @desc    Obtener productos con stock bajo
 * @access  Private (Admin)
 */
router.get(
  '/bajo-stock',
  authenticateToken,
  requireRole(['admin', 'comprador']),
  productosConStockBajo
);

/**
 * @route   GET /api/stock/movimientos/:productoId
 * @desc    Obtener historial de movimientos
 * @access  Private (Admin)
 */
router.get(
  '/movimientos/:productoId',
  authenticateToken,
  requireRole(['admin', 'comprador']),
  obtenerMovimientos
);

/**
 * @route   GET /api/stock/:productoId
 * @desc    Obtener stock de un producto
 * @access  Public
 */
router.get('/:productoId', obtenerStock);

/**
 * @route   POST /api/stock/ajustar
 * @desc    Ajustar stock manualmente
 * @access  Private (Admin)
 */
router.post(
  '/ajustar',
  authenticateToken,
  requireRole(['admin']),
  validarAjuste,
  ajustarStock
);

module.exports = router;
