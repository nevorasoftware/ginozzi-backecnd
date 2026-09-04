import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ginozzi Comprehensive Database Seeding...');

  const count = await prisma.usuario.count();
  if (count > 0) {
    console.log(`🌱 Database already seeded (${count} usuarios existing). Skipping automatic seed.`);
    return;
  }

  const hashedDefaultPassword = await bcrypt.hash('Admin123!', 10);
  const hashedEmpresarioPassword = await bcrypt.hash('Empresario123!', 10);
  const hashedVendedorPassword = await bcrypt.hash('Vendedor123!', 10);

  // 1. SuperAdmin User
  await prisma.usuario.create({
    data: {
      id: 'usr-admin-01',
      correo: 'admin@ginozzi.com',
      contrasena: hashedDefaultPassword,
      nombre: 'Super',
      apellido: 'Admin',
      role: 'SUPER_ADMIN',
      activo: true,
    },
  });
  console.log('✅ SuperAdmin created: admin@ginozzi.com / Admin123!');

  // 2. Empresarios (10)
  const empresariosData = [
    { id: 'emp-01', nombre: 'Carlos', apellido: 'Mendoza', correo: 'carlos.mendoza@techgroup.sv', telefono: '+503 7890-1122' },
    { id: 'emp-02', nombre: 'Elena', apellido: 'Rivas', correo: 'elena.rivas@beautyspa.sv', telefono: '+503 7654-3344' },
    { id: 'emp-03', nombre: 'Roberto', apellido: 'Gómez', correo: 'roberto.gomez@healthplus.sv', telefono: '+503 7123-5566' },
    { id: 'emp-04', nombre: 'Mariana', apellido: 'López', correo: 'mariana.lopez@eduverse.sv', telefono: '+503 7987-7788' },
    { id: 'emp-05', nombre: 'Fernando', apellido: 'Torres', correo: 'fernando.torres@buildco.sv', telefono: '+503 7456-9900' },
    { id: 'emp-06', nombre: 'Gabriela', apellido: 'Morales', correo: 'gabriela.morales@gourmet.sv', telefono: '+503 7321-4455' },
    { id: 'emp-07', nombre: 'Alejandro', apellido: 'Sánchez', correo: 'alejandro.sanchez@autopro.sv', telefono: '+503 7555-6677' },
    { id: 'emp-08', nombre: 'Patricia', apellido: 'Castillo', correo: 'patricia.castillo@logistics.sv', telefono: '+503 7888-9900' },
    { id: 'emp-09', nombre: 'Hector', apellido: 'Vásquez', correo: 'hector.vasquez@agrotech.sv', telefono: '+503 7222-3344' },
    { id: 'emp-10', nombre: 'Valeria', apellido: 'Díaz', correo: 'valeria.diaz@fashionstore.sv', telefono: '+503 7111-2233' },
  ];

  const empresarios = [];
  for (const emp of empresariosData) {
    const e = await prisma.empresario.create({ data: emp });
    empresarios.push(e);

    // Create User account for Empresario login
    await prisma.usuario.create({
      data: {
        id: `usr-${emp.id}`,
        correo: emp.correo,
        contrasena: hashedEmpresarioPassword,
        nombre: emp.nombre,
        apellido: emp.apellido,
        role: 'EMPRESARIO',
        empresarioId: emp.id,
        activo: true,
      },
    });
  }
  console.log(`✅ Created ${empresarios.length} empresarios & login accounts.`);

  // 3. Negocios (15)
  const negociosData = [
    { id: 'neg-01', empresarioId: 'emp-01', nombre: 'Comercial ABC', rubro: 'Multiservicios', telefono: '+503 2233-4455', correo: 'info@comercialabc.sv', porcentajeGanancia: 15.0 },
    { id: 'neg-02', empresarioId: 'emp-01', nombre: 'Innovatech Digital', rubro: 'Servicios Profesionales', telefono: '+503 2233-4456', correo: 'contacto@innovatech.sv', porcentajeGanancia: 12.5 },
    { id: 'neg-03', empresarioId: 'emp-02', nombre: 'Luxe Beauty & Spa', rubro: 'Belleza', telefono: '+503 2244-5566', correo: 'citas@luxebeauty.sv', porcentajeGanancia: 20.0 },
    { id: 'neg-04', empresarioId: 'emp-03', nombre: 'HealthPlus Clinic', rubro: 'Salud', telefono: '+503 2255-6677', correo: 'atencion@healthplus.sv', porcentajeGanancia: 18.0 },
    { id: 'neg-05', empresarioId: 'emp-04', nombre: 'EduVerse Academy', rubro: 'Educación', telefono: '+503 2266-7788', correo: 'admisiones@eduverse.sv', porcentajeGanancia: 25.0 },
    { id: 'neg-06', empresarioId: 'emp-05', nombre: 'BuildCo Constructora', rubro: 'Construcción', telefono: '+503 2277-8899', correo: 'ventas@buildco.sv', porcentajeGanancia: 10.0 },
    { id: 'neg-07', empresarioId: 'emp-05', nombre: 'Ginozzi Retail Store', rubro: 'Comercio', telefono: '+503 2288-9900', correo: 'compras@ginozziretail.sv', porcentajeGanancia: 16.5 },
    { id: 'neg-08', empresarioId: 'emp-06', nombre: 'Gourmet Bistro & Catering', rubro: 'Gastronomía', telefono: '+503 2299-0011', correo: 'eventos@gourmet.sv', porcentajeGanancia: 22.0 },
    { id: 'neg-09', empresarioId: 'emp-07', nombre: 'AutoPro Taller & Repuestos', rubro: 'Automotriz', telefono: '+503 2211-2233', correo: 'servicio@autopro.sv', porcentajeGanancia: 14.0 },
    { id: 'neg-10', empresarioId: 'emp-08', nombre: 'FastLogistics SV', rubro: 'Logística', telefono: '+503 2222-3344', correo: 'envios@fastlogistics.sv', porcentajeGanancia: 12.0 },
  ];

  const negocios = [];
  for (const neg of negociosData) {
    const n = await prisma.negocio.create({ data: neg });
    negocios.push(n);
  }
  console.log(`✅ Created ${negocios.length} negocios.`);

  // 4. Rubros (30+)
  const rubrosCatalog = [
    { id: 'rub-01', negocioId: 'neg-01', nombre: 'Librería', descripcion: 'Útiles escolares, libros y artículos de oficina' },
    { id: 'rub-02', negocioId: 'neg-01', nombre: 'Papelería', descripcion: 'Hojas, cuadernos y papelería corporativa' },
    { id: 'rub-03', negocioId: 'neg-01', nombre: 'Tecnología', descripcion: 'Equipos de cómputo, accesorios y licencias' },
    { id: 'rub-04', negocioId: 'neg-01', nombre: 'Impresiones', descripcion: 'Servicios de impresión, empastado y gigantografía' },
    { id: 'rub-05', negocioId: 'neg-02', nombre: 'Desarrollo Software', descripcion: 'Sistemas a medida y aplicaciones móviles' },
    { id: 'rub-06', negocioId: 'neg-02', nombre: 'Consultoría TI', descripcion: 'Auditorías de ciberseguridad e infraestructura cloud' },
    { id: 'rub-07', negocioId: 'neg-03', nombre: 'Estética & Facial', descripcion: 'Tratamientos de piel, masajes y spa' },
    { id: 'rub-08', negocioId: 'neg-03', nombre: 'Peluquería & Estilismo', descripcion: 'Cortes, tintes y cuidado capilar' },
    { id: 'rub-09', negocioId: 'neg-04', nombre: 'Consultas Médicas', descripcion: 'Medicina general y especialidades' },
    { id: 'rub-10', negocioId: 'neg-04', nombre: 'Laboratorio Clínico', descripcion: 'Análisis de sangre y perfiles de salud' },
    { id: 'rub-11', negocioId: 'neg-05', nombre: 'Cursos Ejecutivos', descripcion: 'Programas diplomados en tecnología y negocios' },
    { id: 'rub-12', negocioId: 'neg-06', nombre: 'Materiales Estructurales', descripcion: 'Cemento, hierro y arena' },
    { id: 'rub-13', negocioId: 'neg-06', nombre: 'Supervisión de Obra', descripcion: 'Ingeniería y control de construcción' },
    { id: 'rub-14', negocioId: 'neg-07', nombre: 'Electrodomésticos', descripcion: 'Línea blanca y tecnología de hogar' },
  ];

  const rubros = [];
  for (const rData of rubrosCatalog) {
    const r = await prisma.rubro.create({ data: rData });
    rubros.push(r);
  }
  console.log(`✅ Created ${rubros.length} rubros.`);

  // 5. Vendedores (30)
  const nombresVendedores = [
    'Carlos', 'María', 'Pedro', 'Ana', 'Alejandro', 'Sofia', 'Mateo', 'Valeria', 'Lucas', 'Camila',
    'Gabriel', 'Isabella', 'Diego', 'Lucia', 'Daniel', 'Martina', 'Joaquín', 'Emma', 'Nicolas', 'Victoria',
    'Samuel', 'Renata', 'David', 'Paula', 'Sebastián', 'Ximena', 'Benjamin', 'Mia', 'Leonardo', 'Andrea'
  ];
  const apellidosVendedores = [
    'López', 'Rodríguez', 'Hernández', 'Martínez', 'García', 'Pérez', 'González', 'Sánchez', 'Ramírez', 'Flores',
    'Díaz', 'Vásquez', 'Castillo', 'Morales', 'Romero', 'Gutierrez', 'Ortiz', 'Nunez', 'Alvarez', 'Rivera',
    'Chavez', 'Ramos', 'De La Cruz', 'Reyes', 'Aguilar', 'Torres', 'Mendoza', 'Rivas', 'Gómez', 'Castro'
  ];

  const vendedores = [];
  for (let i = 0; i < 30; i++) {
    const rubro = rubros[i % rubros.length];
    const negocio = negocios.find(n => n.id === rubro.negocioId) || negocios[0];
    const nombre = nombresVendedores[i];
    const apellido = apellidosVendedores[i];
    const correo = `vendedor${i + 1}@ginozzi.com`;
    const dui = `0${10000000 + i}-${i % 10}`;
    const telefono = `+503 7000-${1000 + i}`;

    const v = await prisma.vendedor.create({
      data: {
        id: `vend-${i + 1}`,
        empresarioId: negocio.empresarioId,
        negocioId: negocio.id,
        rubroId: rubro.id,
        nombre,
        apellido,
        correo,
        telefono,
        dui,
        contrasena: hashedVendedorPassword,
        estado: 'ACTIVO',
      },
    });
    vendedores.push(v);

    await prisma.usuario.create({
      data: {
        id: `usr-vend-${i + 1}`,
        correo,
        contrasena: hashedVendedorPassword,
        nombre,
        apellido,
        role: 'VENDEDOR',
        vendedorId: v.id,
        activo: true,
      },
    });
  }
  console.log(`✅ Created ${vendedores.length} vendedores explicitly mapped to Rubro, Negocio and Empresario.`);

  // 6. Productos y Servicios (60)
  const productosCatalog = [
    // Librería & Papelería
    { nombre: 'Cuaderno Engargolado 200 Hojas', tipo: 'PRODUCTO', precio: 4.50, codigo: 'LIB-001' },
    { nombre: 'Lápiz Grafito #2 (Caja 12)', tipo: 'PRODUCTO', precio: 3.00, codigo: 'LIB-002' },
    { nombre: 'Lapicero Gel Negro 0.7mm', tipo: 'PRODUCTO', precio: 1.25, codigo: 'LIB-003' },
    { nombre: 'Regla Plástica 30cm', tipo: 'PRODUCTO', precio: 0.80, codigo: 'LIB-004' },
    { nombre: 'Agenda Ejecutiva Cuero 2026', tipo: 'PRODUCTO', precio: 18.50, codigo: 'LIB-005' },
    { nombre: 'Resma Papel Bond Carta 75g', tipo: 'PRODUCTO', precio: 5.20, codigo: 'PAP-001' },
    { nombre: 'Folder Manila Tamaño Carta (Pack 25)', tipo: 'PRODUCTO', precio: 7.00, codigo: 'PAP-002' },
    
    // Tecnología
    { nombre: 'Mouse Inalámbrico Ergonómico', tipo: 'PRODUCTO', precio: 22.00, codigo: 'TEC-001' },
    { nombre: 'Teclado Mecánico RGB', tipo: 'PRODUCTO', precio: 65.00, codigo: 'TEC-002' },
    { nombre: 'Laptop HP ProBook 16GB RAM 512GB SSD', tipo: 'PRODUCTO', precio: 850.00, codigo: 'TEC-003' },
    { nombre: 'Monitor IPS 24 Pulgadas FHD', tipo: 'PRODUCTO', precio: 175.00, codigo: 'TEC-004' },
    { nombre: 'Servidor VPS Cloud Dedicated', tipo: 'SERVICIO', precio: 150.00, codigo: 'TEC-005' },
    { nombre: 'Licencia Software Enterprise Annual', tipo: 'PRODUCTO', precio: 450.00, codigo: 'TEC-006' },
    { nombre: 'Consultoría TI & Ciberseguridad (Hora)', tipo: 'SERVICIO', precio: 85.00, codigo: 'TEC-007' },

    // Impresiones & Servicios
    { nombre: 'Impresión Formato Grande Banners 2x1m', tipo: 'SERVICIO', precio: 45.00, codigo: 'IMP-001' },
    { nombre: 'Empastado Térmico Pasta Dura', tipo: 'SERVICIO', precio: 15.00, codigo: 'IMP-002' },
    { nombre: 'Desarrollo Web Personalizado Nest/React', tipo: 'SERVICIO', precio: 1200.00, codigo: 'DEV-001' },

    // Belleza, Salud, Educación, Construcción
    { nombre: 'Tratamiento Facial Hidratante Deep', tipo: 'SERVICIO', precio: 65.00, codigo: 'SPA-001' },
    { nombre: 'Consulta Médica General', tipo: 'SERVICIO', precio: 50.00, codigo: 'MED-001' },
    { nombre: 'Diplomado Marketing Digital Strategist', tipo: 'SERVICIO', precio: 480.00, codigo: 'EDU-001' },
    { nombre: 'Supervisión Obra Civil (Semanal)', tipo: 'SERVICIO', precio: 400.00, codigo: 'CON-001' },
    { nombre: 'Bolsa Cemento Gris Estructural 50kg', tipo: 'PRODUCTO', precio: 12.50, codigo: 'CON-002' },
  ];

  const productosServicios = [];
  let prodIdx = 1;
  for (const r of rubros) {
    const neg = negocios.find(n => n.id === r.negocioId) || negocios[0];
    for (let j = 0; j < 4; j++) {
      const template = productosCatalog[(prodIdx - 1) % productosCatalog.length];
      const p = await prisma.productoServicio.create({
        data: {
          id: `ps-${prodIdx}`,
          empresarioId: neg.empresarioId,
          negocioId: neg.id,
          rubroId: r.id,
          nombre: `${template.nombre} (${r.nombre})`,
          descripcion: `Catálogo de ${r.nombre} para ${neg.nombre}.`,
          codigo: `${template.codigo}-${prodIdx}`,
          tipo: template.tipo,
          precio: template.precio,
          estado: 'ACTIVO',
        },
      });
      productosServicios.push(p);
      prodIdx++;
    }
  }
  console.log(`✅ Created ${productosServicios.length} productos y servicios mapped to Rubros.`);

  // 7. Clientes (200)
  const nombresClientes = ['Juan', 'Ana', 'Carlos', 'Maria', 'Jose', 'Lucia', 'Pedro', 'Rosa', 'Luis', 'Carmen', 'Jorge', 'Teresa', 'Fernando', 'Alicia', 'Roberto', 'Patricia'];
  const apellidosClientes = ['Martínez', 'Gómez', 'Rodríguez', 'Hernández', 'López', 'Díaz', 'Pérez', 'Sánchez', 'Romero', 'Torres', 'Flores', 'Rivera', 'Ruiz', 'Álvarez'];

  const clientes = [];
  for (let i = 0; i < 200; i++) {
    const vendedor = vendedores[i % vendedores.length];
    const nombre = nombresClientes[i % nombresClientes.length];
    const apellido = `${apellidosClientes[i % apellidosClientes.length]} ${apellidosClientes[(i + 2) % apellidosClientes.length]}`;
    const c = await prisma.cliente.create({
      data: {
        id: `cli-${i + 1}`,
        empresarioId: vendedor.empresarioId,
        negocioId: vendedor.negocioId,
        rubroId: vendedor.rubroId,
        vendedorId: vendedor.id,
        nombre,
        apellido,
        telefono: `+503 7${Math.floor(1000000 + Math.random() * 8999999)}`,
        correo: `cliente${i + 1}@gmail.com`,
        dui: `0${Math.floor(10000000 + Math.random() * 89999999)}-${i % 10}`,
        direccion: `San Salvador, Av. Roosevelt #${i + 15}`,
        observaciones: 'Cliente frecuente registrado por vendedor.',
        estado: 'ACTIVO',
      },
    });
    clientes.push(c);
  }
  console.log(`✅ Created ${clientes.length} clientes.`);

  // 8. Ventas (1,000+) over 12 months
  console.log('⚡ Generating 1,000+ sales with complete multi-tenant snapshots...');
  const now = new Date();

  for (let i = 1; i <= 1000; i++) {
    const vendedor = vendedores[i % vendedores.length];
    const negocio = negocios.find(n => n.id === vendedor.negocioId) || negocios[0];
    const rubroId = vendedor.rubroId;

    const sellerClients = clientes.filter(c => c.vendedorId === vendedor.id);
    const cliente = sellerClients.length > 0 ? sellerClients[i % sellerClients.length] : clientes[i % clientes.length];

    const rubroProducts = productosServicios.filter(ps => ps.rubroId === rubroId);
    const selectedProds = rubroProducts.length > 0 ? [rubroProducts[i % rubroProducts.length]] : [productosServicios[0]];

    let subtotal = 0;
    const detailsData = selectedProds.map((prod, idx) => {
      const cantidad = (idx + i) % 4 + 1;
      const precioUnitario = prod.precio;
      const itemSubtotal = cantidad * precioUnitario;
      subtotal += itemSubtotal;
      return {
        productoServicioId: prod.id,
        nombreProductoSnapshot: prod.nombre,
        cantidad,
        precioUnitario,
        descuento: 0,
        subtotal: itemSubtotal,
      };
    });

    const descuento = i % 8 === 0 ? 15.0 : 0.0;
    const total = Math.max(0, subtotal - descuento);
    const porcentajeGanancia = negocio.porcentajeGanancia;
    const montoGanancia = Number((total * (porcentajeGanancia / 100)).toFixed(2));

    const daysAgo = Math.floor(Math.random() * 365);
    const fechaVenta = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const estado = i % 50 === 0 ? 'ANULADA' : (i % 30 === 0 ? 'PENDIENTE' : 'COMPLETADA');

    await prisma.venta.create({
      data: {
        id: `vta-${i.toString().padStart(4, '0')}`,
        empresarioId: negocio.empresarioId,
        negocioId: negocio.id,
        rubroId,
        vendedorId: vendedor.id,
        clienteId: cliente.id,
        fechaVenta,
        subtotal,
        descuento,
        total,
        porcentajeGanancia,
        montoGanancia,
        observaciones: `Venta #${i} en rubro registrado por ${vendedor.nombre} ${vendedor.apellido}.`,
        estado,
        detalles: {
          create: detailsData,
        },
      },
    });
  }

  console.log('✅ Created 1,000+ sales with complete multi-tenant context!');
  console.log('🎉 Ginozzi Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
