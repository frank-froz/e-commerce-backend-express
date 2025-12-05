const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  getOrders
} = require('../controllers/profile.controller');

// Validaciones para actualizar perfil
const updateProfileValidation = [
  body('nombreCompleto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s()-]{7,20}$/)
    .withMessage('Formato de teléfono inválido'),
  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  body('ciudad')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  body('codigoPostal')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('El código postal no puede exceder 20 caracteres'),
  body('pais')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El país no puede exceder 100 caracteres')
];

// Validaciones para cambiar contraseña
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

// Validaciones para consulta de órdenes
const getOrdersValidation = [
  query('estado')
    .optional()
    .isIn(['carrito', 'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'])
    .withMessage('Estado de orden inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser mayor o igual a 0')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de perfil
router.get('/', getProfile);
router.put('/', updateProfileValidation, updateProfile);
router.put('/password', changePasswordValidation, changePassword);
router.get('/orders', getOrdersValidation, getOrders);

module.exports = router;
