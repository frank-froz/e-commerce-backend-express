const prisma = require('../utils/prisma');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/auth');
const { validationResult } = require('express-validator');

/**
 * @desc    Obtener perfil del usuario autenticado
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const esAdmin = req.user.roles.includes('admin');

    // Seleccionar campos según el rol
    const selectFields = {
      id: true,
      correo: true,
      nombreCompleto: true,
      fechaCreacion: true,
      roles: {
        include: {
          rol: {
            select: {
              nombre: true,
              descripcion: true
            }
          }
        }
      }
    };

    // Solo clientes obtienen campos de dirección
    if (!esAdmin) {
      selectFields.telefono = true;
      selectFields.direccion = true;
      selectFields.ciudad = true;
      selectFields.codigoPostal = true;
      selectFields.pais = true;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: selectFields
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Formatear respuesta con roles simplificados
    const perfilFormateado = {
      ...usuario,
      roles: usuario.roles.map(ur => ur.rol.nombre)
    };

    res.json(perfilFormateado);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
  }
};

/**
 * @desc    Actualizar datos del perfil
 * @route   PUT /api/profile
 * @access  Private (Solo clientes pueden actualizar dirección)
 */
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const esAdmin = req.user.roles.includes('admin');

    // Admins solo pueden actualizar nombre
    if (esAdmin) {
      const { nombreCompleto } = req.body;
      
      const usuarioActualizado = await prisma.usuario.update({
        where: { id: req.user.id },
        data: { nombreCompleto },
        select: {
          id: true,
          correo: true,
          nombreCompleto: true,
          fechaCreacion: true
        }
      });

      return res.json({
        message: 'Perfil actualizado exitosamente',
        usuario: usuarioActualizado
      });
    }

    // Clientes pueden actualizar todos los campos
    const { nombreCompleto, telefono, direccion, ciudad, codigoPostal, pais } = req.body;

    // Preparar datos para actualizar (solo campos proporcionados)
    const datosActualizacion = {};
    if (nombreCompleto !== undefined) datosActualizacion.nombreCompleto = nombreCompleto;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (direccion !== undefined) datosActualizacion.direccion = direccion;
    if (ciudad !== undefined) datosActualizacion.ciudad = ciudad;
    if (codigoPostal !== undefined) datosActualizacion.codigoPostal = codigoPostal;
    if (pais !== undefined) datosActualizacion.pais = pais;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: req.user.id },
      data: datosActualizacion,
      select: {
        id: true,
        correo: true,
        nombreCompleto: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        codigoPostal: true,
        pais: true,
        fechaCreacion: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

/**
 * @desc    Cambiar contraseña del usuario
 * @route   PUT /api/profile/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const esValida = await comparePassword(currentPassword, usuario.contrasenaHash);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Validar nueva contraseña
    const validacionPassword = validatePasswordStrength(newPassword);
    if (!validacionPassword.valid) {
      return res.status(400).json({ 
        error: 'La nueva contraseña no cumple con los requisitos',
        detalle: validacionPassword.message
      });
    }

    // Verificar que la nueva contraseña sea diferente
    const esIgual = await comparePassword(newPassword, usuario.contrasenaHash);
    if (esIgual) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe ser diferente a la actual' 
      });
    }

    // Hash de la nueva contraseña
    const nuevaContrasenaHash = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { contrasenaHash: nuevaContrasenaHash }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

/**
 * @desc    Obtener historial de órdenes del usuario
 * @route   GET /api/profile/orders
 * @access  Private (Solo clientes)
 */
const getOrders = async (req, res) => {
  try {
    const esAdmin = req.user.roles.includes('admin');

    // Admins no tienen órdenes personales
    if (esAdmin) {
      return res.status(403).json({ 
        error: 'Los administradores no tienen órdenes de compra',
        message: 'Esta funcionalidad es solo para clientes'
      });
    }

    const { estado, limit = '10', offset = '0' } = req.query;

    // Construir filtros
    const where = {
      usuarioId: req.user.id
    };

    if (estado) {
      where.estado = estado;
    }

    // Obtener órdenes con paginación
    const ordenes = await prisma.orden.findMany({
      where,
      select: {
        id: true,
        montoTotal: true,
        estado: true,
        fechaCreacion: true,
        fechaConfirmacion: true,
        detalles: {
          select: {
            id: true,
            cantidad: true,
            precioUnitario: true,
            subtotal: true,
            producto: {
              select: {
                id: true,
                nombre: true,
                sku: true,
                descripcion: true
              }
            }
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Contar total de órdenes
    const totalOrdenes = await prisma.orden.count({ where });

    res.json({
      ordenes,
      paginacion: {
        total: totalOrdenes,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalOrdenes
      }
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener el historial de órdenes' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getOrders
};