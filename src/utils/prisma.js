const { PrismaClient } = require('@prisma/client');

// Singleton de Prisma Client
// Con Prisma 7 y prisma.config.ts, el cliente toma la configuración automáticamente
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo, usar global para evitar múltiples instancias con hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
