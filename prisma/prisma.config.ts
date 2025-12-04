// 🔧 Configuración de Prisma
// Documentación: https://pris.ly/d/config-datasource

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
    },
  },
};
