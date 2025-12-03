require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// CORS - Configuración para permitir cookies desde Next.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', // URL del frontend Next.js
  credentials: true, // Permite envío de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser - Para leer cookies httpOnly
app.use(cookieParser());

// Logging simple (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      code: 'NOT_FOUND'
    }
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Servidor Express iniciado`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('===========================================');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
