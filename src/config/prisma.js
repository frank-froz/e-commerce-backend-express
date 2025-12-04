
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Crear pool de conexiones PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Crear adaptador de Prisma
const adapter = new PrismaPg(pool);

// Crear instancia única de Prisma con adaptador
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Manejo de cierre graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

module.exports = prisma;
