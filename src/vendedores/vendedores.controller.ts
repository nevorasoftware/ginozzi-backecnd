import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VendedoresService } from './vendedores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('vendedores')
@Controller('vendedores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendedoresController {
  constructor(private readonly vendedoresService: VendedoresService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener vendedores (opcionalmente filtrados por negocio, rubro o empresario)' })
  @ApiQuery({ name: 'negocioId', required: false })
  @ApiQuery({ name: 'rubroId', required: false })
  @ApiQuery({ name: 'empresarioId', required: false })
  async findAll(
    @Query('negocioId') negocioId?: string,
    @Query('rubroId') rubroId?: string,
    @Query('empresarioId') empresarioId?: string,
  ) {
    return this.vendedoresService.findAll(negocioId, rubroId, empresarioId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener vendedor por ID' })
  async findOne(@Param('id') id: string) {
    return this.vendedoresService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Crear nuevo vendedor' })
  async create(@Body() body: any) {
    return this.vendedoresService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Actualizar vendedor' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.vendedoresService.update(id, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Cambiar estado del vendedor (ACTIVO, INACTIVO, BLOQUEADO)' })
  async updateStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO') {
    return this.vendedoresService.updateStatus(id, estado);
  }

  @Get(':id/estadisticas')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener estadísticas de ventas del vendedor' })
  async getEstadisticas(@Param('id') id: string) {
    return this.vendedoresService.getEstadisticas(id);
  }

  @Get(':id/ventas')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener ventas del vendedor' })
  async getVentas(@Param('id') id: string) {
    return this.vendedoresService.getVentas(id);
  }

  @Get(':id/clientes')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener clientes del vendedor' })
  async getClientes(@Param('id') id: string) {
    return this.vendedoresService.getClientes(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Eliminar vendedor' })
  async remove(@Param('id') id: string) {
    return this.vendedoresService.remove(id);
  }
}
