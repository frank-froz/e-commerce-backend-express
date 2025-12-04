const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash de contraseña usando bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Comparar contraseña con hash
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generar Access Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
};

/**
 * Generar Refresh Token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Verificar Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error('TOKEN_INVALID');
  }
};

/**
 * Verificar Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    throw new Error('REFRESH_TOKEN_INVALID');
  }
};

/**
 * Validar fortaleza de contraseña
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (password.length < minLength) {
    return {
      valid: false,
      message: `La contraseña debe tener al menos ${minLength} caracteres`
    };
  }

  if (!hasUpperCase) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra mayúscula'
    };
  }

  if (!hasLowerCase) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra minúscula'
    };
  }

  if (!hasNumber) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos un número'
    };
  }

  return { valid: true, message: 'Contraseña válida' };
};

/**
 * Sanitizar email (trim y lowercase)
 */
const sanitizeEmail = (email) => {
  return email.trim().toLowerCase();
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  validatePasswordStrength,
  sanitizeEmail
};
