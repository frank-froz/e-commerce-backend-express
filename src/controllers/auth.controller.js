const prisma = require('../utils/prisma');
const { validationResult } = require('express-validator');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  validatePasswordStrength,
  sanitizeEmail
} = require('../utils/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo cliente
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Validar errores de express-validator
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

    const { correo, contrasena, nombreCompleto } = req.body;

    // Sanitizar email
    const emailSanitizado = sanitizeEmail(correo);

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(contrasena);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: passwordValidation.message,
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: emailSanitizado }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'El correo electrónico ya está registrado',
          code: 'EMAIL_EXISTS'
        }
      });
    }

    // Hash de contraseña
    const contrasenaHash = await hashPassword(contrasena);

    // Buscar rol de cliente
    const rolCliente = await prisma.rol.findUnique({
      where: { nombre: 'cliente' }
    });

    if (!rolCliente) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Error en la configuración del sistema',
          code: 'ROLE_NOT_FOUND'
        }
      });
    }

    // Crear usuario con rol de cliente
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        correo: emailSanitizado,
        contrasenaHash,
        nombreCompleto: nombreCompleto || null,
        roles: {
          create: {
            rolId: rolCliente.id
          }
        }
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    // Generar tokens
    const tokenPayload = {
      userId: nuevoUsuario.id,
      correo: nuevoUsuario.correo,
      roles: nuevoUsuario.roles.map(ur => ur.rol.nombre)
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Configurar cookies httpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'lax'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000 // 30 minutos
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // Responder con datos del usuario (sin contraseña)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: nuevoUsuario.id,
          correo: nuevoUsuario.correo,
          nombreCompleto: nuevoUsuario.nombreCompleto,
          roles: nuevoUsuario.roles.map(ur => ur.rol.nombre),
          fechaCreacion: nuevoUsuario.fechaCreacion
        },
        message: 'Usuario registrado exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al registrar usuario',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión (cliente o admin)
 * @access  Public
 */
const login = async (req, res) => {
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

    const { correo, contrasena } = req.body;
    const emailSanitizado = sanitizeEmail(correo);

    // Buscar usuario por correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo: emailSanitizado },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Verificar contraseña
    const passwordValida = await comparePassword(contrasena, usuario.contrasenaHash);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generar tokens
    const tokenPayload = {
      userId: usuario.id,
      correo: usuario.correo,
      roles: usuario.roles.map(ur => ur.rol.nombre)
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Configurar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        user: {
          id: usuario.id,
          correo: usuario.correo,
          nombreCompleto: usuario.nombreCompleto,
          roles: usuario.roles.map(ur => ur.rol.nombre)
        },
        message: 'Inicio de sesión exitoso'
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al iniciar sesión',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public (requiere refresh token en cookie)
 */
const refresh = async (req, res) => {
  try {
    // El middleware authenticateRefreshToken ya validó el token
    // y adjuntó req.user

    const tokenPayload = {
      userId: req.user.id,
      correo: req.user.correo,
      roles: req.user.roles
    };

    // Generar nuevo access token
    const accessToken = generateAccessToken(tokenPayload);

    // Configurar cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        message: 'Token renovado exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al renovar token',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Limpiar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      data: {
        message: 'Sesión cerrada exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al cerrar sesión',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // El middleware authenticateToken ya validó y adjuntó req.user
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: usuario.id,
          correo: usuario.correo,
          nombreCompleto: usuario.nombreCompleto,
          roles: usuario.roles.map(ur => ur.rol.nombre),
          fechaCreacion: usuario.fechaCreacion
        }
      }
    });
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al obtener información del usuario',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * @route   POST /api/admin/users/create
 * @desc    Crear usuario admin o trabajador (solo admin)
 * @access  Private (Admin only)
 */
const createAdminUser = async (req, res) => {
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

    const { correo, contrasena, nombreCompleto, rol } = req.body;

    // Sanitizar email
    const emailSanitizado = sanitizeEmail(correo);

    // Validar que el rol sea admin
    if (rol !== 'admin') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Solo se pueden crear usuarios con rol admin',
          code: 'INVALID_ROLE'
        }
      });
    }

    // Validar contraseña
    const passwordValidation = validatePasswordStrength(contrasena);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: passwordValidation.message,
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: emailSanitizado }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'El correo electrónico ya está registrado',
          code: 'EMAIL_EXISTS'
        }
      });
    }

    // Buscar rol
    const rolBuscado = await prisma.rol.findUnique({
      where: { nombre: rol }
    });

    if (!rolBuscado) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Rol no encontrado',
          code: 'ROLE_NOT_FOUND'
        }
      });
    }

    // Hash contraseña
    const contrasenaHash = await hashPassword(contrasena);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        correo: emailSanitizado,
        contrasenaHash,
        nombreCompleto: nombreCompleto || null,
        roles: {
          create: {
            rolId: rolBuscado.id
          }
        }
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: nuevoUsuario.id,
          correo: nuevoUsuario.correo,
          nombreCompleto: nuevoUsuario.nombreCompleto,
          roles: nuevoUsuario.roles.map(ur => ur.rol.nombre),
          fechaCreacion: nuevoUsuario.fechaCreacion
        },
        message: 'Usuario administrador creado exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en createAdminUser:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error al crear usuario administrador',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  createAdminUser
};
