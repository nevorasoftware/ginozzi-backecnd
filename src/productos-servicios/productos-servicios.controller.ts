import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductosServiciosService } from './productos-servicios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('productos-servicios')
@Controller('productos-servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductosServiciosController {
  constructor(private readonly service: ProductosServiciosService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener catálogo de productos y servicios' })
  async findAll(@Query('negocioId') negocioId?: string, @Query('tipo') tipo?: string) {
    return this.service.findAll(negocioId, tipo);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener producto o servicio por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Crear nuevo producto o servicio' })
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Actualizar producto o servicio' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Cambiar estado del producto o servicio' })
  async updateStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO') {
    return this.service.updateStatus(id, estado);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Eliminar producto o servicio' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
