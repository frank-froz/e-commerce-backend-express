// 📦 Rutas de Productos
// Endpoints del catálogo de productos

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const productoController = require('../controllers/producto.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// Validaciones
const validarCrearProducto = [
  body('sku')
    .notEmpty().withMessage('SKU es requerido')
    .isString().withMessage('SKU debe ser texto')
    .isLength({ max: 100 }).withMessage('SKU no puede exceder 100 caracteres'),
  
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto'),
  
  body('precio')
    .notEmpty().withMessage('Precio es requerido')
    .isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  
  body('marcaId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de marca inválido'),
  
  body('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  
  body('tipoProductoId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de tipo producto inválido'),
  
  body('lineaProductoId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de línea producto inválido'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('Activo debe ser true o false')
];

const validarActualizarProducto = [
  body('sku')
    .optional()
    .isString().withMessage('SKU debe ser texto')
    .isLength({ max: 100 }).withMessage('SKU no puede exceder 100 caracteres'),
  
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  
  body('descripcion')
    .optional()
    .isString().withMessage('Descripción debe ser texto'),
  
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  
  body('marcaId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de marca inválido'),
  
  body('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  
  body('tipoProductoId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de tipo producto inválido'),
  
  body('lineaProductoId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de línea producto inválido'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('Activo debe ser true o false')
];

const validarIdProducto = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de producto inválido')
];

const validarSku = [
  param('sku')
    .notEmpty().withMessage('SKU es requerido')
    .isString().withMessage('SKU debe ser texto')
];

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * @route   GET /api/productos
 * @desc    Listar productos con filtros
 * @access  Public
 */
router.get('/', productoController.listarProductos);

/**
 * @route   GET /api/productos/sku/:sku
 * @desc    Buscar producto por SKU
 * @access  Public
 */
router.get('/sku/:sku', validarSku, productoController.buscarPorSku);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
router.get('/:id', validarIdProducto, productoController.obtenerProducto);

// ============================================
// RUTAS PROTEGIDAS (ADMIN)
// ============================================

/**
 * @route   POST /api/productos
 * @desc    Crear nuevo producto
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  validarCrearProducto,
  productoController.crearProducto
);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar producto
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validarIdProducto,
  validarActualizarProducto,
  productoController.actualizarProducto
);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Desactivar producto (soft delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validarIdProducto,
  productoController.desactivarProducto
);

/**
 * @route   PATCH /api/productos/:id/activar
 * @desc    Activar producto
 * @access  Private (Admin)
 */
router.patch(
  '/:id/activar',
  authenticateToken,
  requireRole(['admin']),
  validarIdProducto,
  productoController.activarProducto
);

module.exports = router;