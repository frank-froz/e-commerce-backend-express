
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const catalogoController = require('../controllers/catalogo.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');


const validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
];


const validarMarca = [
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres')
];

// Públicas
router.get('/marcas', catalogoController.listarMarcas);
router.get('/marcas/:id', validarId, catalogoController.obtenerMarca);

// Protegidas (Admin)
router.post('/marcas', authenticateToken, requireRole(['admin']), validarMarca, catalogoController.crearMarca);
router.put('/marcas/:id', authenticateToken, requireRole(['admin']), validarId, validarMarca, catalogoController.actualizarMarca);
router.delete('/marcas/:id', authenticateToken, requireRole(['admin']), validarId, catalogoController.eliminarMarca);

// ============================================
// CATEGORÍAS
// ============================================

const validarCategoria = [
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  body('categoriaPadreId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de categoría padre inválido')
];

const validarActualizarCategoria = [
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  body('categoriaPadreId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de categoría padre inválido')
];

// Públicas
router.get('/categorias', catalogoController.listarCategorias);
router.get('/categorias/:id', validarId, catalogoController.obtenerCategoria);

// Protegidas (Admin)
router.post('/categorias', authenticateToken, requireRole(['admin']), validarCategoria, catalogoController.crearCategoria);
router.put('/categorias/:id', authenticateToken, requireRole(['admin']), validarId, validarActualizarCategoria, catalogoController.actualizarCategoria);
router.delete('/categorias/:id', authenticateToken, requireRole(['admin']), validarId, catalogoController.eliminarCategoria);

// ============================================
// TIPOS DE PRODUCTO
// ============================================

const validarTipoProducto = [
  body('codigo')
    .notEmpty().withMessage('Código es requerido')
    .isString().withMessage('Código debe ser texto')
    .isLength({ max: 50 }).withMessage('Código no puede exceder 50 caracteres'),
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres')
];

const validarActualizarTipoProducto = [
  body('codigo')
    .optional()
    .isString().withMessage('Código debe ser texto')
    .isLength({ max: 50 }).withMessage('Código no puede exceder 50 caracteres'),
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres')
];

// Públicas
router.get('/tipos-producto', catalogoController.listarTiposProducto);
router.get('/tipos-producto/:id', validarId, catalogoController.obtenerTipoProducto);

// Protegidas (Admin)
router.post('/tipos-producto', authenticateToken, requireRole(['admin']), validarTipoProducto, catalogoController.crearTipoProducto);
router.put('/tipos-producto/:id', authenticateToken, requireRole(['admin']), validarId, validarActualizarTipoProducto, catalogoController.actualizarTipoProducto);
router.delete('/tipos-producto/:id', authenticateToken, requireRole(['admin']), validarId, catalogoController.eliminarTipoProducto);

// ============================================
// LÍNEAS DE PRODUCTO
// ============================================

const validarLineaProducto = [
  body('tipoProductoId')
    .notEmpty().withMessage('ID de tipo de producto es requerido')
    .isInt({ min: 1 }).withMessage('ID de tipo de producto inválido'),
  body('codigo')
    .notEmpty().withMessage('Código es requerido')
    .isString().withMessage('Código debe ser texto')
    .isLength({ max: 50 }).withMessage('Código no puede exceder 50 caracteres'),
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  body('descuentoPorcentaje')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Descuento debe estar entre 0 y 100')
];

const validarActualizarLineaProducto = [
  body('codigo')
    .optional()
    .isString().withMessage('Código debe ser texto')
    .isLength({ max: 50 }).withMessage('Código no puede exceder 50 caracteres'),
  body('nombre')
    .optional()
    .isString().withMessage('Nombre debe ser texto')
    .isLength({ max: 255 }).withMessage('Nombre no puede exceder 255 caracteres'),
  body('descuentoPorcentaje')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Descuento debe estar entre 0 y 100')
];

// Públicas
router.get('/lineas-producto', catalogoController.listarLineasProducto);
router.get('/lineas-producto/:id', validarId, catalogoController.obtenerLineaProducto);
router.get('/lineas-producto/:lineaId/productos', validarId, catalogoController.obtenerProductosPorLinea);

// Protegidas (Admin)
router.post('/lineas-producto', authenticateToken, requireRole(['admin']), validarLineaProducto, catalogoController.crearLineaProducto);
router.put('/lineas-producto/:id', authenticateToken, requireRole(['admin']), validarId, validarActualizarLineaProducto, catalogoController.actualizarLineaProducto);
router.delete('/lineas-producto/:id', authenticateToken, requireRole(['admin']), validarId, catalogoController.eliminarLineaProducto);

module.exports = router;