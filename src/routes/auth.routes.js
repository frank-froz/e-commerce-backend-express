const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  createAdminUser
} = require('../controllers/auth.controller');
const {
  authenticateToken,
  authenticateRefreshToken,
  requireRole
} = require('../middleware/auth.middleware');

const router = express.Router();

// Rate limiter para login (protección contra fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de inicio de sesión. Por favor, intenta más tarde.',
      code: 'TOO_MANY_REQUESTS'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora por IP
  message: {
    success: false,
    error: {
      message: 'Demasiados registros desde esta IP. Por favor, intenta más tarde.',
      code: 'TOO_MANY_REQUESTS'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validaciones para registro
const registerValidation = [
  body('correo')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('contrasena')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('nombreCompleto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
];

// Validaciones para login
const loginValidation = [
  body('correo')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para crear admin
const createAdminValidation = [
  body('correo')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  body('contrasena')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('nombreCompleto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('rol')
    .isIn(['admin'])
    .withMessage('El rol debe ser admin')
];

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo cliente
 * @access  Public
 */
router.post('/register', registerLimiter, registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', loginLimiter, loginValidation, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token
 * @access  Public (requiere refresh token)
 */
router.post('/refresh', authenticateRefreshToken, refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   POST /api/admin/users/create
 * @desc    Crear usuario admin (solo admin)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/users/create',
  authenticateToken,
  requireRole('admin'),
  createAdminValidation,
  createAdminUser
);

module.exports = router;
