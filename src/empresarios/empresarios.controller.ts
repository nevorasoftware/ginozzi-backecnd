import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresariosService } from './empresarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('empresarios')
@Controller('empresarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmpresariosController {
  constructor(private readonly empresariosService: EmpresariosService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener todos los empresarios' })
  async findAll() {
    return this.empresariosService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Obtener empresario por ID' })
  async findOne(@Param('id') id: string) {
    return this.empresariosService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear nuevo empresario' })
  async create(@Body() body: { nombre: string; apellido: string; correo: string; telefono: string; estado?: string }) {
    return this.empresariosService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'EMPRESARIO')
  @ApiOperation({ summary: 'Actualizar empresario' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.empresariosService.update(id, body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Cambiar estado del empresario' })
  async updateStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO') {
    return this.empresariosService.updateStatus(id, estado);
  }
}
