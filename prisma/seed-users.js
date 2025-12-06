const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/auth');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Iniciando seed de usuarios y roles...\n');

  // ============================================
  // 1. ROLES
  // ============================================
  console.log('👥 Creando roles...');
  const roles = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'admin' },
      update: {},
      create: {
        nombre: 'admin',
        descripcion: 'Administrador del sistema con acceso completo'
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'cliente' },
      update: {},
      create: {
        nombre: 'cliente',
        descripcion: 'Usuario cliente con acceso a compras'
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'vendedor' },
      update: {},
      create: {
        nombre: 'vendedor',
        descripcion: 'Usuario vendedor con acceso a gestión de productos'
      }
    })
  ]);
  console.log(`✅ ${roles.length} roles creados\n`);

  const rolAdmin = roles.find(r => r.nombre === 'admin');
  const rolCliente = roles.find(r => r.nombre === 'cliente');
  const rolVendedor = roles.find(r => r.nombre === 'vendedor');

  // ============================================
  // 2. USUARIOS
  // ============================================
  console.log('👤 Creando usuarios...');

  // Admin principal
  const adminUser = await prisma.usuario.upsert({
    where: { correo: 'admin@ecommerce.com' },
    update: {},
    create: {
      correo: 'admin@ecommerce.com',
      contrasenaHash: await hashPassword('Admin123'),
      nombreCompleto: 'Administrador Principal',
      roles: {
        create: {
          rolId: rolAdmin.id
        }
      }
    }
  });
  console.log('✅ Usuario admin creado: admin@ecommerce.com');

  // Cliente de prueba 1
  const cliente1 = await prisma.usuario.upsert({
    where: { correo: 'cliente@test.com' },
    update: {},
    create: {
      correo: 'cliente@test.com',
      contrasenaHash: await hashPassword('Test1234'),
      nombreCompleto: 'Cliente Test',
      roles: {
        create: {
          rolId: rolCliente.id
        }
      }
    }
  });
  console.log('✅ Usuario cliente creado: cliente@test.com');

  // Cliente de prueba 2
  const cliente2 = await prisma.usuario.upsert({
    where: { correo: 'juan.perez@mail.com' },
    update: {},
    create: {
      correo: 'juan.perez@mail.com',
      contrasenaHash: await hashPassword('Cliente123'),
      nombreCompleto: 'Juan Pérez',
      roles: {
        create: {
          rolId: rolCliente.id
        }
      }
    }
  });
  console.log('✅ Usuario cliente creado: juan.perez@mail.com');

  // Vendedor de prueba
  const vendedor1 = await prisma.usuario.upsert({
    where: { correo: 'vendedor@ecommerce.com' },
    update: {},
    create: {
      correo: 'vendedor@ecommerce.com',
      contrasenaHash: await hashPassword('Vendedor123'),
      nombreCompleto: 'María González',
      roles: {
        create: {
          rolId: rolVendedor.id
        }
      }
    }
  });
  console.log('✅ Usuario vendedor creado: vendedor@ecommerce.com');

  // Admin secundario
  const admin2 = await prisma.usuario.upsert({
    where: { correo: 'admin2@ecommerce.com' },
    update: {},
    create: {
      correo: 'admin2@ecommerce.com',
      contrasenaHash: await hashPassword('Admin456'),
      nombreCompleto: 'Segundo Admin',
      roles: {
        create: {
          rolId: rolAdmin.id
        }
      }
    }
  });
  console.log('✅ Usuario admin creado: admin2@ecommerce.com\n');

  // ============================================
  // RESUMEN
  // ============================================
  console.log('═'.repeat(60));
  console.log('✨ Seed de usuarios completado!\n');
  console.log('📊 Resumen:');
  console.log(`   • ${roles.length} roles`);
  console.log(`   • 5 usuarios creados\n`);
  console.log('👤 Usuarios de prueba:');
  console.log('   📧 admin@ecommerce.com     🔑 Admin123      [admin]');
  console.log('   📧 admin2@ecommerce.com    🔑 Admin456      [admin]');
  console.log('   📧 vendedor@ecommerce.com  🔑 Vendedor123   [vendedor]');
  console.log('   📧 cliente@test.com        🔑 Test1234      [cliente]');
  console.log('   📧 juan.perez@mail.com     🔑 Cliente123    [cliente]\n');
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
