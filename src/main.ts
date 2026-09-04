import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as http from 'http';

async function seedInitialDataIfNeeded(app: any) {
  try {
    const prisma = app.get(PrismaService);
    const userCount = await prisma.usuario.count().catch(() => 0);
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
      }).catch(err => console.error('Admin create err:', err.message));

      // 2. Empresario
      const emp1 = await prisma.empresario.create({
        data: {
          id: 'emp-01',
          nombre: 'Carlos',
          apellido: 'Mendoza',
          correo: 'carlos.mendoza@techgroup.sv',
          telefono: '+503 7890-1122',
        },
      }).catch(() => null);

      if (emp1) {
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
        }).catch(() => null);

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
        }).catch(() => null);

        if (neg1) {
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
          }).catch(() => null);

          if (vend1) {
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
            }).catch(() => null);

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
            }).catch(() => null);

            const prod1 = await prisma.productoServicio.create({
              data: {
                id: 'ps-01',
                negocioId: neg1.id,
                nombre: 'Servidor VPS Cloud Dedicated',
                tipo: 'SERVICIO',
                precio: 150.0,
              },
            }).catch(() => null);

            if (cli1 && prod1) {
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
              }).catch(() => null);
            }
          }
        }
      }

      console.log('✅ Initial database seed completed successfully!');
    }
  } catch (err) {
    console.error('❌ Error during auto-seeding:', err);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins and headers
  app.enableCors({
    origin: true,
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

  // Healthcheck endpoint at root /
  app.getHttpAdapter().get('/', (req: any, res: any) => {
    res.json({ status: 'ok', message: 'GINOZZI API REST active' });
  });

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

  const expressApp = app.getHttpAdapter().getInstance();
  const primaryPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Listen on primary port
  await app.listen(primaryPort, '0.0.0.0');
  console.log(`🚀 GINOZZI Backend listening on primary port: ${primaryPort}`);

  // Create secondary HTTP listeners for fallback ports (8080 and 3000) if primary is different
  const fallbackPorts = [8080, 3000].filter((p) => p !== primaryPort);
  for (const fPort of fallbackPorts) {
    try {
      const server = http.createServer(expressApp);
      server.listen(fPort, '0.0.0.0', () => {
        console.log(`🚀 GINOZZI Backend secondary listener active on port: ${fPort}`);
      });
      server.on('error', () => {
        // Port already in use, safe to ignore
      });
    } catch (e) {
      // Ignore
    }
  }

  // Run seed check in background after server is up
  setTimeout(() => seedInitialDataIfNeeded(app), 1000);
}

bootstrap();
