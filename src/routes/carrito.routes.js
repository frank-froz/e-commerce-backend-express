// 🛒 Rutas de Carrito
const express = require('express');
const { body } = require('express-validator');
const {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  checkout,
  resumenCarrito
} = require('../controllers/carrito.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones para agregar al carrito
const validarItem = [
  body('productoId')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  body('cantidad')
    .isInt({ min: 0 })
    .withMessage('Cantidad inválida'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('Precio inválido')
];

/**
 * @route   GET /api/carrito
 * @desc    Obtener carrito actual
 * @access  Private
 */
router.get('/', obtenerCarrito);

/**
 * @route   GET /api/carrito/resumen
 * @desc    Obtener resumen del carrito
 * @access  Private
 */
router.get('/resumen', resumenCarrito);

/**
 * @route   POST /api/carrito/items
 * @desc    Agregar producto al carrito
 * @access  Private
 */
router.post('/items', validarItem, agregarAlCarrito);

/**
 * @route   PATCH /api/carrito/items/:productoId
 * @desc    Actualizar cantidad de producto
 * @access  Private
 */
router.patch(
  '/items/:productoId',
  body('cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida'),
  actualizarCantidad
);

/**
 * @route   DELETE /api/carrito/items/:productoId
 * @desc    Eliminar producto del carrito
 * @access  Private
 */
router.delete('/items/:productoId', eliminarDelCarrito);

/**
 * @route   DELETE /api/carrito
 * @desc    Vaciar carrito completo
 * @access  Private
 */
router.delete('/', vaciarCarrito);

/**
 * @route   POST /api/carrito/checkout
 * @desc    Convertir carrito en orden
 * @access  Private
 */
router.post('/checkout', checkout);

module.exports = router;
