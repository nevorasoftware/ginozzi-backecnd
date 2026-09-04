import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function seedInitialDataIfNeeded(app: any) {
  try {
    const prisma = app.get(PrismaService);
    const userCount = await prisma.usuario.count();
    if (userCount === 0) {
      console.log('🌱 Seeding initial database records...');
      const hashedDefaultPassword = await bcrypt.hash('Admin123!', 10);
      const hashedEmpresarioPassword = await bcrypt.hash('Empresario123!', 10);
      const hashedVendedorPassword = await bcrypt.hash('Vendedor123!', 10);

      // 1. SuperAdmin
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

      // 2. Empresarios
      const emp1 = await prisma.empresario.create({
        data: {
          id: 'emp-01',
          nombre: 'Carlos',
          apellido: 'Mendoza',
          correo: 'carlos.mendoza@techgroup.sv',
          telefono: '+503 7890-1122',
        },
      });
      await prisma.usuario.create({
        data: {
          id: 'usr-emp-01',
          correo: emp1.correo,
          contrasena: hashedEmpresarioPassword,
          nombre: emp1.nombre,
          apellido: emp1.apellido,
          role: 'EMPRESARIO',
          empresarioId: emp1.id,
          activo: true,
        },
      });

      // 3. Negocio
      const neg1 = await prisma.negocio.create({
        data: {
          id: 'neg-01',
          empresarioId: emp1.id,
          nombre: 'TechGroup Solutions',
          rubro: 'Tecnología',
          telefono: '+503 2233-4455',
          correo: 'info@techgroup.sv',
          porcentajeGanancia: 15.0,
        },
      });

      // 4. Vendedor
      const vend1 = await prisma.vendedor.create({
        data: {
          id: 'vend-01',
          negocioId: neg1.id,
          nombre: 'Alejandro',
          apellido: 'Hernández',
          correo: 'vendedor1@ginozzi.com',
          telefono: '+503 7000-1001',
          dui: '010000000-1',
          contrasena: hashedVendedorPassword,
          estado: 'ACTIVO',
        },
      });
      await prisma.usuario.create({
        data: {
          id: 'usr-vend-01',
          correo: vend1.correo,
          contrasena: hashedVendedorPassword,
          nombre: vend1.nombre,
          apellido: vend1.apellido,
          role: 'VENDEDOR',
          vendedorId: vend1.id,
          activo: true,
        },
      });

      // 5. Cliente & Producto
      const cli1 = await prisma.cliente.create({
        data: {
          id: 'cli-01',
          vendedorId: vend1.id,
          nombre: 'Juan',
          apellido: 'Martínez',
          telefono: '+503 7123-4567',
          correo: 'cliente1@gmail.com',
        },
      });
      const prod1 = await prisma.productoServicio.create({
        data: {
          id: 'ps-01',
          negocioId: neg1.id,
          nombre: 'Servidor VPS Cloud Dedicated',
          tipo: 'SERVICIO',
          precio: 150.0,
        },
      });

      // 6. Venta demo
      await prisma.venta.create({
        data: {
          id: 'vta-0001',
          negocioId: neg1.id,
          vendedorId: vend1.id,
          clienteId: cli1.id,
          subtotal: 150.0,
          total: 150.0,
          porcentajeGanancia: 15.0,
          montoGanancia: 22.5,
          estado: 'COMPLETADA',
          detalles: {
            create: [
              {
                productoServicioId: prod1.id,
                cantidad: 1,
                precioUnitario: 150.0,
                subtotal: 150.0,
              },
            ],
          },
        },
      });

      console.log('✅ Initial database seed completed successfully!');
    }
  } catch (err) {
    console.error('❌ Error during auto-seeding:', err);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('GINOZZI API REST')
    .setDescription('Plataforma SaaS de administración, negocios, vendedores, ventas y analítica comercial.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 GINOZZI Backend running on: http://0.0.0.0:${port}`);
  console.log(`📚 OpenAPI Documentation available at: http://0.0.0.0:${port}/docs`);

  // Run seed check in background after server is up
  seedInitialDataIfNeeded(app);
}

bootstrap();
