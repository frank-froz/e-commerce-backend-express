// 🔧 Script para instalar procedimientos almacenados
// Ejecutar con: node scripts/install-procedures.js

require('dotenv').config();
const { readFileSync } = require('fs');
const { join } = require('path');
const prisma = require('../src/config/prisma');

async function instalarProcedimientos() {
  try {
    console.log('📦 Instalando procedimientos almacenados...\n');
    
    // Leer archivo SQL
    const sqlPath = join(__dirname, '..', 'prisma', 'migrations', 'procedures.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Ejecutar SQL
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Procedimientos instalados exitosamente:\n');
    console.log('   ✓ proc_actualizar_stock');
    console.log('   ✓ proc_verificar_stock');
    console.log('   ✓ proc_registrar_compra');
    console.log('   ✓ proc_crear_orden');
    console.log('   ✓ proc_confirmar_orden');
    console.log('   ✓ proc_actualizar_carrito');
    console.log('   ✓ proc_checkout_carrito\n');
    
    console.log('🎉 ¡Todo listo para usar los servicios!\n');
    
  } catch (error) {
    console.error('❌ Error al instalar procedimientos:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

instalarProcedimientos();
