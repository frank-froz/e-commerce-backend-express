const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de catálogos y productos...\n');

  // ============================================
  // 1. MARCAS
  // ============================================
  console.log('🏷️  Creando marcas...');
  const marcas = await Promise.all([
    prisma.marca.upsert({
      where: { nombre: 'HP' },
      update: {},
      create: { nombre: 'HP' }
    }),
    prisma.marca.upsert({
      where: { nombre: 'Dell' },
      update: {},
      create: { nombre: 'Dell' }
    }),
    prisma.marca.upsert({
      where: { nombre: 'Lenovo' },
      update: {},
      create: { nombre: 'Lenovo' }
    }),
    prisma.marca.upsert({
      where: { nombre: 'Apple' },
      update: {},
      create: { nombre: 'Apple' }
    }),
    prisma.marca.upsert({
      where: { nombre: 'Samsung' },
      update: {},
      create: { nombre: 'Samsung' }
    }),
    prisma.marca.upsert({
      where: { nombre: 'Logitech' },
      update: {},
      create: { nombre: 'Logitech' }
    })
  ]);
  console.log(`✅ ${marcas.length} marcas creadas\n`);

  // ============================================
  // 2. CATEGORÍAS
  // ============================================
  console.log('📁 Creando categorías...');
  
  // Categorías padre
  const catElectronica = await prisma.categoria.upsert({
    where: { nombre: 'Electrónica' },
    update: {},
    create: { nombre: 'Electrónica' }
  });

  const catAccesorios = await prisma.categoria.upsert({
    where: { nombre: 'Accesorios' },
    update: {},
    create: { nombre: 'Accesorios' }
  });

  // Subcategorías
  const subcategorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: 'Laptops' },
      update: {},
      create: {
        nombre: 'Laptops',
        categoriaPadreId: catElectronica.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Computadoras de Escritorio' },
      update: {},
      create: {
        nombre: 'Computadoras de Escritorio',
        categoriaPadreId: catElectronica.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Tablets' },
      update: {},
      create: {
        nombre: 'Tablets',
        categoriaPadreId: catElectronica.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Monitores' },
      update: {},
      create: {
        nombre: 'Monitores',
        categoriaPadreId: catElectronica.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Teclados' },
      update: {},
      create: {
        nombre: 'Teclados',
        categoriaPadreId: catAccesorios.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Mouse' },
      update: {},
      create: {
        nombre: 'Mouse',
        categoriaPadreId: catAccesorios.id
      }
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Audífonos' },
      update: {},
      create: {
        nombre: 'Audífonos',
        categoriaPadreId: catAccesorios.id
      }
    })
  ]);
  console.log(`✅ ${2 + subcategorias.length} categorías creadas\n`);

  // ============================================
  // 3. TIPOS DE PRODUCTO
  // ============================================
  console.log('🔧 Creando tipos de producto...');
  const tipos = await Promise.all([
    prisma.tipoProducto.upsert({
      where: { codigo: 'TECH' },
      update: {},
      create: {
        codigo: 'TECH',
        nombre: 'Tecnología'
      }
    }),
    prisma.tipoProducto.upsert({
      where: { codigo: 'ACC' },
      update: {},
      create: {
        codigo: 'ACC',
        nombre: 'Accesorios de Computadora'
      }
    }),
    prisma.tipoProducto.upsert({
      where: { codigo: 'AUDIO' },
      update: {},
      create: {
        codigo: 'AUDIO',
        nombre: 'Audio y Video'
      }
    })
  ]);
  console.log(`✅ ${tipos.length} tipos de producto creados\n`);

  // ============================================
  // 4. LÍNEAS DE PRODUCTO
  // ============================================
  console.log('📊 Creando líneas de producto...');
  const tipoTech = tipos.find(t => t.codigo === 'TECH');
  const tipoAcc = tipos.find(t => t.codigo === 'ACC');
  const tipoAudio = tipos.find(t => t.codigo === 'AUDIO');
  
  const lineas = await Promise.all([
    // Tecnología - sin descuento
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoTech.id,
          codigo: 'PREMIUM'
        }
      },
      update: {
        banner: 'https://img.freepik.com/vector-gratis/cabecera-twitter-noche-juego_23-2151050060.jpg'
      },
      create: {
        tipoProductoId: tipoTech.id,
        codigo: 'PREMIUM',
        nombre: 'Línea Premium',
        descuentoPorcentaje: 0,
        banner: 'https://img.freepik.com/vector-gratis/cabecera-twitter-noche-juego_23-2151050060.jpg'
      }
    }),
    // Tecnología - con descuento
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoTech.id,
          codigo: 'PROMO'
        }
      },
      update: {
        banner: 'https://www.shutterstock.com/image-vector/15-percent-price-off-icon-600nw-1837824178.jpg'
      },
      create: {
        tipoProductoId: tipoTech.id,
        codigo: 'PROMO',
        nombre: 'Línea Promocional',
        descuentoPorcentaje: 15,
        banner: 'https://www.shutterstock.com/image-vector/15-percent-price-off-icon-600nw-1837824178.jpg'
      }
    }),
    // Tecnología - descuento alto
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoTech.id,
          codigo: 'OUTLET'
        }
      },
      update: {
        banner: 'https://hiraoka.com.pe/media/mageplaza/blog/post/a/c/accesorios-gamer_1.jpg'
      },
      create: {
        tipoProductoId: tipoTech.id,
        codigo: 'OUTLET',
        nombre: 'Línea Outlet',
        descuentoPorcentaje: 30,
        banner: 'https://img.freepik.com/vector-premium/30-descuento-super-venta-cartel-promocional_520587-332.jpg'
      }
    }),
    // Accesorios
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoAcc.id,
          codigo: 'ACC-STD'
        }
      },
      update: {
        banner: 'https://www.mielectro.es/blog/wp-content/uploads/2024/10/Mejores-perifericos-gaming.jpg'
      },
      create: {
        tipoProductoId: tipoAcc.id,
        codigo: 'ACC-STD',
        nombre: 'Accesorios Estándar',
        descuentoPorcentaje: 10,
        banner: 'https://img.freepik.com/vector-gratis/plantilla-banner-horizontal-evento-cibernetico-lunes_23-2150865324.jpg'
      }
    }),
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoAcc.id,
          codigo: 'ACC-PRO'
        }
      },
      update: {
        banner: 'https://stargamers.com.pe/index/wp-content/uploads/2019/08/Primus_productos-768x688.jpg'
      },
      create: {
        tipoProductoId: tipoAcc.id,
        codigo: 'ACC-PRO',
        nombre: 'Accesorios Profesionales',
        descuentoPorcentaje: 0,
        banner: 'https://static.vecteezy.com/system/resources/thumbnails/029/254/123/small_2x/premium-quality-elegant-banner-design-for-promotion-free-png.png'
      }
    }),
    // Audio
    prisma.lineaProducto.upsert({
      where: { 
        tipoProductoId_codigo: {
          tipoProductoId: tipoAudio.id,
          codigo: 'AUDIO-STD'
        }
      },
      update: {
        banner: 'https://woodandfirestudio.com/wp-content/uploads/2023/03/bestheadphones.jpg'
      },
      create: {
        tipoProductoId: tipoAudio.id,
        codigo: 'AUDIO-STD',
        nombre: 'Audio Estándar',
        descuentoPorcentaje: 20,
        banner: 'https://img.freepik.com/vector-gratis/20-descuento-mega-venta-banner-vector-ilustracion_460848-15534.jpg'
      }
    })
  ]);
  console.log(`✅ ${lineas.length} líneas de producto creadas\n`);

  // ============================================
  // 5. PRODUCTOS
  // ============================================
  console.log('📦 Creando productos...');
  
  const laptopsCategoria = subcategorias.find(s => s.nombre === 'Laptops');
  const desktopCategoria = subcategorias.find(s => s.nombre === 'Computadoras de Escritorio');
  const tecladosCategoria = subcategorias.find(s => s.nombre === 'Teclados');
  const mouseCategoria = subcategorias.find(s => s.nombre === 'Mouse');
  const audifonosCategoria = subcategorias.find(s => s.nombre === 'Audífonos');

  const productos = await Promise.all([
    // Laptops HP - Premium (sin descuento)
    prisma.producto.upsert({
      where: { sku: 'HP-LAP-001' },
      update: {
        imagen: 'https://sm.pcmag.com/pcmag_au/review/h/hp-pavilio/hp-pavilion-gaming-laptop-15z-ec200_admn.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'HP-LAP-001',
        nombre: 'HP Pavilion 15',
        descripcion: 'Laptop 15.6", Intel Core i5-12450H, 8GB RAM, 512GB SSD',
        precio: 799.99,
        marcaId: marcas.find(m => m.nombre === 'HP').id,
        categoriaId: laptopsCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'TECH').id,
        lineaProductoId: lineas.find(l => l.codigo === 'PREMIUM').id,
        imagen: 'https://sm.pcmag.com/pcmag_au/review/h/hp-pavilio/hp-pavilion-gaming-laptop-15z-ec200_admn.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Laptops HP - Promocional (15% descuento)
    prisma.producto.upsert({
      where: { sku: 'HP-LAP-002' },
      update: {
        imagen: 'https://www.pcworld.com/wp-content/uploads/2025/04/puff_cc6821.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'HP-LAP-002',
        nombre: 'HP ProBook 14',
        descripcion: 'Laptop 14", Intel Core i7-1255U, 16GB RAM, 1TB SSD',
        precio: 1299.99,
        marcaId: marcas.find(m => m.nombre === 'HP').id,
        categoriaId: laptopsCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'TECH').id,
        lineaProductoId: lineas.find(l => l.codigo === 'PROMO').id,
        imagen: 'https://www.pcworld.com/wp-content/uploads/2025/04/puff_cc6821.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Dell - Outlet (30% descuento)
    prisma.producto.upsert({
      where: { sku: 'DELL-LAP-001' },
      update: {
        imagen: 'https://crdms.images.consumerreports.org/f_auto,w_600/prod/products/cr/models/417151-15-to-16-inch-laptops-dell-inspiron-15-6-10044427.png',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'DELL-LAP-001',
        nombre: 'Dell Inspiron 15',
        descripcion: 'Laptop 15.6", AMD Ryzen 5, 8GB RAM, 256GB SSD',
        precio: 699.99,
        marcaId: marcas.find(m => m.nombre === 'Dell').id,
        categoriaId: laptopsCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'TECH').id,
        lineaProductoId: lineas.find(l => l.codigo === 'OUTLET').id,
        imagen: 'https://crdms.images.consumerreports.org/f_auto,w_600/prod/products/cr/models/417151-15-to-16-inch-laptops-dell-inspiron-15-6-10044427.png',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Lenovo Desktop
    prisma.producto.upsert({
      where: { sku: 'LEN-DES-001' },
      update: {
        imagen: 'https://cdn.mos.cms.futurecdn.net/2tgS5gVTyuwFC3BE4dBP6F.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'LEN-DES-001',
        nombre: 'Lenovo ThinkCentre M90a',
        descripcion: 'PC de Escritorio All-in-One 23.8", Intel i7, 16GB RAM, 512GB SSD',
        precio: 1499.99,
        marcaId: marcas.find(m => m.nombre === 'Lenovo').id,
        categoriaId: desktopCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'TECH').id,
        lineaProductoId: lineas.find(l => l.codigo === 'PREMIUM').id,
        imagen: 'https://cdn.mos.cms.futurecdn.net/2tgS5gVTyuwFC3BE4dBP6F.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Apple MacBook - Premium
    prisma.producto.upsert({
      where: { sku: 'APPLE-MBP-001' },
      update: {
        imagen: 'https://helios-i.mashable.com/imagery/reviews/00MfzQqrMZw66IhCIX1ZvIs/hero-image.fill.size_1248x702.v1730944891.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'APPLE-MBP-001',
        nombre: 'MacBook Pro 14"',
        descripcion: 'MacBook Pro 14", M3 Pro, 18GB RAM, 512GB SSD',
        precio: 2499.99,
        marcaId: marcas.find(m => m.nombre === 'Apple').id,
        categoriaId: laptopsCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'TECH').id,
        lineaProductoId: lineas.find(l => l.codigo === 'PREMIUM').id,
        imagen: 'https://helios-i.mashable.com/imagery/reviews/00MfzQqrMZw66IhCIX1ZvIs/hero-image.fill.size_1248x702.v1730944891.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Teclados Logitech - Estándar (10% descuento)
    prisma.producto.upsert({
      where: { sku: 'LOG-KEY-001' },
      update: {
        imagen: 'https://i.rtings.com/assets/products/UpbK7qDu/logitech-k380/design-medium.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'LOG-KEY-001',
        nombre: 'Logitech K380',
        descripcion: 'Teclado inalámbrico Bluetooth multidispositivo',
        precio: 39.99,
        marcaId: marcas.find(m => m.nombre === 'Logitech').id,
        categoriaId: tecladosCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'ACC').id,
        lineaProductoId: lineas.find(l => l.codigo === 'ACC-STD').id,
        imagen: 'https://i.rtings.com/assets/products/UpbK7qDu/logitech-k380/design-medium.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Teclado Profesional
    prisma.producto.upsert({
      where: { sku: 'LOG-KEY-002' },
      update: {
        imagen: 'https://i.rtings.com/assets/products/3rbapWLw/logitech-mx-keys-s/design-medium.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'LOG-KEY-002',
        nombre: 'Logitech MX Keys',
        descripcion: 'Teclado inalámbrico retroiluminado para programadores',
        precio: 99.99,
        marcaId: marcas.find(m => m.nombre === 'Logitech').id,
        categoriaId: tecladosCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'ACC').id,
        lineaProductoId: lineas.find(l => l.codigo === 'ACC-PRO').id,
        imagen: 'https://i.rtings.com/assets/products/3rbapWLw/logitech-mx-keys-s/design-medium.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Mouse Logitech
    prisma.producto.upsert({
      where: { sku: 'LOG-MOU-001' },
      update: {
        imagen: 'https://techbuzzireland.com/wp-content/uploads/2019/11/mx-master-3.png',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'LOG-MOU-001',
        nombre: 'Logitech MX Master 3S',
        descripcion: 'Mouse inalámbrico ergonómico de precisión',
        precio: 89.99,
        marcaId: marcas.find(m => m.nombre === 'Logitech').id,
        categoriaId: mouseCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'ACC').id,
        lineaProductoId: lineas.find(l => l.codigo === 'ACC-PRO').id,
        imagen: 'https://techbuzzireland.com/wp-content/uploads/2019/11/mx-master-3.png',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Audífonos Samsung (20% descuento)
    prisma.producto.upsert({
      where: { sku: 'SAM-AUD-001' },
      update: {
        imagen: 'https://cdn.mos.cms.futurecdn.net/sboE9MHpxqTnESyfwN8hpW.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'SAM-AUD-001',
        nombre: 'Samsung Galaxy Buds2 Pro',
        descripcion: 'Audífonos inalámbricos con cancelación de ruido',
        precio: 149.99,
        marcaId: marcas.find(m => m.nombre === 'Samsung').id,
        categoriaId: audifonosCategoria.id,
        tipoProductoId: tipos.find(t => t.codigo === 'AUDIO').id,
        lineaProductoId: lineas.find(l => l.codigo === 'AUDIO-STD').id,
        imagen: 'https://cdn.mos.cms.futurecdn.net/sboE9MHpxqTnESyfwN8hpW.jpg',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        activo: true
      }
    }),
    // Audífonos Apple
    prisma.producto.upsert({
      where: { sku: 'APPLE-AUD-001' },
      update: {
        imagen: 'https://m-cdn.phonearena.com/images/reviews/245546-image/BK6A9875.webp',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png']
      },
      create: {
        sku: 'APPLE-AUD-001',
        nombre: 'Apple AirPods Pro 2',
        descripcion: 'Audífonos inalámbricos con cancelación activa de ruido',
        precio: 249.99,
        marcaId: marcas.find(m => m.nombre === 'Apple').id,
        categoriaId: audifonosCategoria.id,
        imagen: 'https://m-cdn.phonearena.com/images/reviews/245546-image/BK6A9875.webp',
        imagenes: ['https://cdni.iconscout.com/illustration/premium/thumb/dispositivos-electronicos-3428446-2902667.png'],
        tipoProductoId: tipos.find(t => t.codigo === 'AUDIO').id,
        lineaProductoId: lineas.find(l => l.codigo === 'AUDIO-STD').id,
        activo: true
      }
    })
  ]);
  console.log(`✅ ${productos.length} productos creados\n`);

  // ============================================
  // 6. STOCK INICIAL
  // ============================================
  console.log('📊 Inicializando stock...');
  for (const producto of productos) {
    const cantidadInicial = Math.floor(Math.random() * 50) + 10; // Entre 10 y 60 unidades
    
    await prisma.stockProducto.upsert({
      where: { productoId: producto.id },
      update: {},
      create: {
        productoId: producto.id,
        cantidad: cantidadInicial
      }
    });
  }
  console.log(`✅ Stock inicial configurado para ${productos.length} productos\n`);

  // ============================================
  // RESUMEN
  // ============================================
  console.log('═'.repeat(60));
  console.log('✨ Seed de catálogos y productos completado!\n');
  console.log('📊 Resumen:');
  console.log(`   • ${marcas.length} marcas`);
  console.log(`   • ${2 + subcategorias.length} categorías`);
  console.log(`   • ${tipos.length} tipos de producto`);
  console.log(`   • ${lineas.length} líneas de producto`);
  console.log(`   • ${productos.length} productos`);
  console.log(`   • Stock inicializado para ${productos.length} productos\n`);
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
