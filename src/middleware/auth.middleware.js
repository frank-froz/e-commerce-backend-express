const prisma = require('../utils/prisma');
const { verifyAccessToken, verifyRefreshToken } = require('../utils/auth');

/**
 * Middleware para verificar Access Token en cookies o header Authorization
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Intentar obtener token de cookies o header Authorization
    let accessToken = req.cookies?.accessToken;
    
    // Si no está en cookies, buscar en header Authorization
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7); // Remover 'Bearer ' del inicio
      }
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No se proporcionó token de autenticación',
          code: 'NO_TOKEN'
        }
      });
    }

    // Verificar token
    const decoded = verifyAccessToken(accessToken);

    // Buscar usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
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
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Adjuntar usuario a la request
    req.user = {
      id: usuario.id,
      correo: usuario.correo,
      nombreCompleto: usuario.nombreCompleto,
      roles: usuario.roles.map(ur => ur.rol.nombre)
    };

    next();
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      }
    });
  }
};

/**
 * Middleware para verificar Refresh Token
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No se proporcionó refresh token',
          code: 'NO_REFRESH_TOKEN'
        }
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
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
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    req.user = {
      id: usuario.id,
      correo: usuario.correo,
      nombreCompleto: usuario.nombreCompleto,
      roles: usuario.roles.map(ur => ur.rol.nombre)
    };

    next();
  } catch (error) {
    if (error.message === 'REFRESH_TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token expirado, por favor inicie sesión nuevamente',
          code: 'REFRESH_TOKEN_EXPIRED'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        message: 'Refresh token inválido',
        code: 'REFRESH_TOKEN_INVALID'
      }
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * Uso: requireRole('admin') o requireRole(['admin', 'trabajador'])
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No autenticado',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    const userRoles = req.user.roles;
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'No tienes permisos para acceder a este recurso',
          code: 'FORBIDDEN',
          requiredRoles: allowedRoles
        }
      });
    }

    next();
  };
};

/**
 * Middleware opcional: intenta autenticar pero no falla si no hay token
 * Útil para endpoints que funcionan diferente con/sin autenticación
 */
const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(accessToken);
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (usuario) {
      req.user = {
        id: usuario.id,
        correo: usuario.correo,
        nombreCompleto: usuario.nombreCompleto,
        roles: usuario.roles.map(ur => ur.rol.nombre)
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  requireRole,
  optionalAuth
};
