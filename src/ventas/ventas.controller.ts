import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('ventas')
@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener historial de ventas con filtros' })
  async findAll(
    @Query('negocioId') negocioId?: string,
    @Query('vendedorId') vendedorId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.ventasService.findAll({ negocioId, vendedorId, clienteId, estado });
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener detalle de una venta por ID' })
  async findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Registrar nueva venta' })
  async create(@Body() body: any) {
    return this.ventasService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Actualizar venta' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ventasService.update(id, body);
  }

  @Patch(':id/anular')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Anular venta registrada' })
  async anular(@Param('id') id: string) {
    return this.ventasService.anular(id);
  }
}
