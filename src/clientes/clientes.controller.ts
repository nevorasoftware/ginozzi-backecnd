import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener todos los clientes (opción filtrar por vendedor)' })
  async findAll(@Query('vendedorId') vendedorId?: string) {
    return this.clientesService.findAll(vendedorId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  async create(@Body() body: any) {
    return this.clientesService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Actualizar cliente' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.clientesService.update(id, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Cambiar estado del cliente' })
  async updateStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO') {
    return this.clientesService.updateStatus(id, estado);
  }
}
