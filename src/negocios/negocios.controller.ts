import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NegociosService } from './negocios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('negocios')
@Controller('negocios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NegociosController {
  constructor(private readonly negociosService: NegociosService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Obtener todos los negocios (opción filtrar por empresario)' })
  async findAll(@Query('empresarioId') empresarioId?: string) {
    return this.negociosService.findAll(empresarioId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Obtener negocio por ID' })
  async findOne(@Param('id') id: string) {
    return this.negociosService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Crear nuevo negocio' })
  async create(@Body() body: any) {
    return this.negociosService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Actualizar negocio' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.negociosService.update(id, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Cambiar estado del negocio' })
  async updateStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO') {
    return this.negociosService.updateStatus(id, estado);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Eliminar negocio' })
  async remove(@Param('id') id: string) {
    return this.negociosService.remove(id);
  }
}
