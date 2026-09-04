import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresariosModule } from './empresarios/empresarios.module';
import { NegociosModule } from './negocios/negocios.module';
import { RubrosModule } from './rubros/rubros.module';
import { VendedoresModule } from './vendedores/vendedores.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosServiciosModule } from './productos-servicios/productos-servicios.module';
import { VentasModule } from './ventas/ventas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmpresariosModule,
    NegociosModule,
    RubrosModule,
    VendedoresModule,
    ClientesModule,
    ProductosServiciosModule,
    VentasModule,
    DashboardModule,
  ],
})
export class AppModule {}
