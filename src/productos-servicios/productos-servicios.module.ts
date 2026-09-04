import { Module } from '@nestjs/common';
import { ProductosServiciosService } from './productos-servicios.service';
import { ProductosServiciosController } from './productos-servicios.controller';

@Module({
  controllers: [ProductosServiciosController],
  providers: [ProductosServiciosService],
  exports: [ProductosServiciosService],
})
export class ProductosServiciosModule {}
