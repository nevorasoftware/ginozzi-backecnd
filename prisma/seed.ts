import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ginozzi Database Seeding...');

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

  // 2. Empresarios (5)
  const empresariosData = [
    { id: 'emp-01', nombre: 'Carlos', apellido: 'Mendoza', correo: 'carlos.mendoza@techgroup.sv', telefono: '+503 7890-1122' },
    { id: 'emp-02', nombre: 'Elena', apellido: 'Rivas', correo: 'elena.rivas@beautyspa.sv', telefono: '+503 7654-3344' },
    { id: 'emp-03', nombre: 'Roberto', apellido: 'Gómez', correo: 'roberto.gomez@healthplus.sv', telefono: '+503 7123-5566' },
    { id: 'emp-04', nombre: 'Mariana', apellido: 'López', correo: 'mariana.lopez@eduverse.sv', telefono: '+503 7987-7788' },
    { id: 'emp-05', nombre: 'Fernando', apellido: 'Torres', correo: 'fernando.torres@buildco.sv', telefono: '+503 7456-9900' },
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
  console.log(`✅ Created ${empresarios.length} empresarios & user accounts.`);

  // 3. Negocios (7)
  const negociosData = [
    { id: 'neg-01', empresarioId: 'emp-01', nombre: 'TechGroup Solutions', rubro: 'Tecnología', telefono: '+503 2233-4455', correo: 'info@techgroup.sv', porcentajeGanancia: 15.0 },
    { id: 'neg-02', empresarioId: 'emp-01', nombre: 'Innovatech Digital', rubro: 'Servicios profesionales', telefono: '+503 2233-4456', correo: 'contacto@innovatech.sv', porcentajeGanancia: 12.5 },
    { id: 'neg-03', empresarioId: 'emp-02', nombre: 'Luxe Beauty & Spa', rubro: 'Belleza', telefono: '+503 2244-5566', correo: 'citas@luxebeauty.sv', porcentajeGanancia: 20.0 },
    { id: 'neg-04', empresarioId: 'emp-03', nombre: 'HealthPlus Clinic', rubro: 'Salud', telefono: '+503 2255-6677', correo: 'atencion@healthplus.sv', porcentajeGanancia: 18.0 },
    { id: 'neg-05', empresarioId: 'emp-04', nombre: 'EduVerse Academy', rubro: 'Educación', telefono: '+503 2266-7788', correo: 'admisiones@eduverse.sv', porcentajeGanancia: 25.0 },
    { id: 'neg-06', empresarioId: 'emp-05', nombre: 'BuildCo Constructora', rubro: 'Construcción', telefono: '+503 2277-8899', correo: 'ventas@buildco.sv', porcentajeGanancia: 10.0 },
    { id: 'neg-07', empresarioId: 'emp-05', nombre: 'Ginozzi Retail Store', rubro: 'Comercio', telefono: '+503 2288-9900', correo: 'compras@ginozziretail.sv', porcentajeGanancia: 16.5 },
  ];

  const negocios = [];
  for (const neg of negociosData) {
    const n = await prisma.negocio.create({ data: neg });
    negocios.push(n);
  }
  console.log(`✅ Created ${negocios.length} negocios.`);

  // 4. Vendedores (25)
  const nombresVendedores = [
    'Alejandro', 'Sofia', 'Mateo', 'Valeria', 'Lucas', 'Camila', 'Gabriel', 'Isabella', 'Diego', 'Lucia',
    'Daniel', 'Martina', 'Joaquín', 'Emma', 'Nicolas', 'Victoria', 'Samuel', 'Renata', 'David', 'Paula',
    'Sebastián', 'Ximena', 'Benjamin', 'Mia', 'Leonardo'
  ];
  const apellidosVendedores = [
    'Hernández', 'García', 'Martínez', 'Rodríguez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Flores',
    'Díaz', 'Vásquez', 'Castillo', 'Morales', 'Romero', 'Gutierrez', 'Ortiz', 'Nunez', 'Alvarez', 'Rivera',
    'Chavez', 'Ramos', 'De La Cruz', 'Reyes', 'Aguilar'
  ];

  const vendedores = [];
  for (let i = 0; i < 25; i++) {
    const negocio = negocios[i % negocios.length];
    const nombre = nombresVendedores[i];
    const apellido = apellidosVendedores[i];
    const correo = `vendedor${i + 1}@ginozzi.com`;
    const dui = `0${10000000 + i}-${i % 10}`;
    const telefono = `+503 7000-${1000 + i}`;

    const v = await prisma.vendedor.create({
      data: {
        id: `vend-${i + 1}`,
        negocioId: negocio.id,
        nombre,
        apellido,
        correo,
        telefono,
        dui,
        contrasena: hashedVendedorPassword,
        estado: i === 24 ? 'BLOQUEADO' : 'ACTIVO',
      },
    });
    vendedores.push(v);

    // Create User account for Vendedor login
    await prisma.usuario.create({
      data: {
        id: `usr-vend-${i + 1}`,
        correo,
        contrasena: hashedVendedorPassword,
        nombre,
        apellido,
        role: 'VENDEDOR',
        vendedorId: v.id,
        activo: i !== 24,
      },
    });
  }
  console.log(`✅ Created ${vendedores.length} vendedores with user accounts. Credentials: vendedor1@ginozzi.com / Vendedor123!`);

  // 5. Productos / Servicios (50)
  const productosCatalog = [
    // Tech & Pro
    { nombre: 'Servidor VPS Cloud Dedicated', tipo: 'SERVICIO', precio: 150.0 },
    { nombre: 'Licencia Software Enterprise Annual', tipo: 'PRODUCTO', precio: 450.0 },
    { nombre: 'Consultoría TI & Seguridad (Hora)', tipo: 'SERVICIO', precio: 85.0 },
    { nombre: 'Desarrollo Web Personalizado', tipo: 'SERVICIO', precio: 1200.0 },
    { nombre: 'Mantenimiento Preventivo Servidores', tipo: 'SERVICIO', precio: 250.0 },
    { nombre: 'Impresora Multifuncional Láser Pro', tipo: 'PRODUCTO', precio: 380.0 },
    { nombre: 'Router Mesh Empresarial WiFi 6', tipo: 'PRODUCTO', precio: 220.0 },

    // Beauty
    { nombre: 'Tratamiento Facial Hidratante Deep', tipo: 'SERVICIO', precio: 65.0 },
    { nombre: 'Corte y Estilizado Profesional', tipo: 'SERVICIO', precio: 35.0 },
    { nombre: 'Set Champú Orgánico Reparador 1L', tipo: 'PRODUCTO', precio: 48.0 },
    { nombre: 'Masaje Terapéutico Anti-Estrés 60min', tipo: 'SERVICIO', precio: 75.0 },
    { nombre: 'Kit Cuidado Facial Radiant Skin', tipo: 'PRODUCTO', precio: 95.0 },

    // Health
    { nombre: 'Consulta Médica General', tipo: 'SERVICIO', precio: 50.0 },
    { nombre: 'Chequeo Ejecutivo Completo', tipo: 'SERVICIO', precio: 220.0 },
    { nombre: 'Examen Laboratorio Sangre Completo', tipo: 'SERVICIO', precio: 60.0 },
    { nombre: 'Suplemento Multivitamínico Premium', tipo: 'PRODUCTO', precio: 42.0 },
    { nombre: 'Sesión Fisioterapia Deportiva', tipo: 'SERVICIO', precio: 55.0 },

    // Education
    { nombre: 'Curso Completo Desarrollo Web React/Nest', tipo: 'SERVICIO', precio: 350.0 },
    { nombre: 'Diplomado Marketing Digital Strategist', tipo: 'SERVICIO', precio: 480.0 },
    { nombre: 'Taller Intensivo Liderazgo Comercial', tipo: 'SERVICIO', precio: 180.0 },
    { nombre: 'Libro de Texto Inteligencia Comercial', tipo: 'PRODUCTO', precio: 35.0 },

    // Construction & Commerce
    { nombre: 'Diseño Planos Arquitectónicos 3D', tipo: 'SERVICIO', precio: 900.0 },
    { nombre: 'Bolsa Cemento Gris Estructural 50kg', tipo: 'PRODUCTO', precio: 12.50 },
    { nombre: 'Supervisión Obra Civil (Por Semana)', tipo: 'SERVICIO', precio: 400.0 },
    { nombre: 'Pintura Látex Interior Cubeta 5Gal', tipo: 'PRODUCTO', precio: 78.0 },
    { nombre: 'Combo Herramientas Eléctricas Pro', tipo: 'PRODUCTO', precio: 310.0 }
  ];

  const productosServicios = [];
  let prodIndex = 1;
  for (const neg of negocios) {
    for (let j = 0; j < 8; j++) {
      const itemTemplate = productosCatalog[(prodIndex - 1) % productosCatalog.length];
      const p = await prisma.productoServicio.create({
        data: {
          id: `ps-${prodIndex}`,
          negocioId: neg.id,
          nombre: `${itemTemplate.nombre} (${neg.nombre.split(' ')[0]})`,
          descripcion: `Excelente ${itemTemplate.tipo.toLowerCase()} para clientes de ${neg.rubro}.`,
          tipo: itemTemplate.tipo,
          precio: itemTemplate.precio,
          estado: 'ACTIVO',
        },
      });
      productosServicios.push(p);
      prodIndex++;
    }
  }
  console.log(`✅ Created ${productosServicios.length} productos y servicios.`);

  // 6. Clientes (100)
  const nombresClientes = [
    'Juan', 'Ana', 'Carlos', 'Maria', 'Jose', 'Lucia', 'Pedro', 'Rosa', 'Luis', 'Carmen',
    'Jorge', 'Teresa', 'Fernando', 'Alicia', 'Roberto', 'Patricia', 'Ricardo', 'Beatriz', 'Eduardo', 'Gloria'
  ];
  const apellidosClientes = [
    'Martínez', 'Gómez', 'Rodríguez', 'Hernández', 'López', 'Díaz', 'Pérez', 'Sánchez', 'Romero', 'Torres',
    'Flores', 'Rivera', 'Ruiz', 'Álvarez', 'Vásquez', 'Castro', 'Morales', 'Ortiz', 'Gutierrez', 'Chávez'
  ];

  const clientes = [];
  for (let i = 0; i < 100; i++) {
    const vendedor = vendedores[i % vendedores.length];
    const nombre = nombresClientes[i % nombresClientes.length];
    const apellido = `${apellidosClientes[i % apellidosClientes.length]} ${apellidosClientes[(i + 3) % apellidosClientes.length]}`;
    const c = await prisma.cliente.create({
      data: {
        id: `cli-${i + 1}`,
        vendedorId: vendedor.id,
        nombre,
        apellido,
        telefono: `+503 7${Math.floor(1000000 + Math.random() * 8999999)}`,
        correo: `cliente${i + 1}@gmail.com`,
        dui: `0${Math.floor(10000000 + Math.random() * 89999999)}-${i % 10}`,
        direccion: `San Salvador, Calle Principal #${i + 12}`,
        observaciones: 'Cliente recurrente y preferencial.',
        estado: 'ACTIVO',
      },
    });
    clientes.push(c);
  }
  console.log(`✅ Created ${clientes.length} clientes.`);

  // 7. Ventas (500+) distributed over the past 12 months
  console.log('⚡ Generating 500+ realistic historical sales over last 12 months...');
  const now = new Date();

  for (let i = 1; i <= 520; i++) {
    const vendedor = vendedores[i % vendedores.length];
    const negocio = negocios.find(n => n.id === vendedor.negocioId) || negocios[0];
    
    // Pick client belonging to this seller or near
    const sellerClients = clientes.filter(c => c.vendedorId === vendedor.id);
    const cliente = sellerClients.length > 0 ? sellerClients[i % sellerClients.length] : clientes[i % clientes.length];

    // Pick 1-3 products from this business
    const negProducts = productosServicios.filter(ps => ps.negocioId === negocio.id);
    const selectedProds = negProducts.length > 0 ? [negProducts[i % negProducts.length]] : [productosServicios[0]];
    if (negProducts.length > 1 && i % 3 === 0) {
      selectedProds.push(negProducts[(i + 1) % negProducts.length]);
    }

    // Calculate details
    let subtotal = 0;
    const detailsData = selectedProds.map((prod, idx) => {
      const cantidad = (idx + i) % 3 + 1;
      const precioUnitario = prod.precio;
      const itemSubtotal = cantidad * precioUnitario;
      subtotal += itemSubtotal;
      return {
        productoServicioId: prod.id,
        cantidad,
        precioUnitario,
        descuento: 0,
        subtotal: itemSubtotal,
      };
    });

    const descuento = i % 5 === 0 ? 10.0 : 0.0;
    const total = Math.max(0, subtotal - descuento);
    const porcentajeGanancia = negocio.porcentajeGanancia;
    const montoGanancia = Number((total * (porcentajeGanancia / 100)).toFixed(2));

    // Randomize date across 365 days
    const daysAgo = Math.floor(Math.random() * 365);
    const fechaVenta = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const estado = i % 40 === 0 ? 'ANULADA' : (i % 25 === 0 ? 'PENDIENTE' : 'COMPLETADA');

    await prisma.venta.create({
      data: {
        id: `vta-${i.toString().padStart(4, '0')}`,
        negocioId: negocio.id,
        vendedorId: vendedor.id,
        clienteId: cliente.id,
        fechaVenta,
        subtotal,
        descuento,
        total,
        porcentajeGanancia,
        montoGanancia,
        observaciones: `Venta registrada desde app móvil vendedor #${vendedor.nombre}.`,
        estado,
        detalles: {
          create: detailsData,
        },
      },
    });
  }

  console.log('✅ Created 520+ detailed historical sales with item lines!');
  console.log('🎉 GINOZZI Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
