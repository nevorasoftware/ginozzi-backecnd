import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RubrosService } from './rubros.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Rubros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rubros')
export class RubrosController {
  constructor(private readonly rubrosService: RubrosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo Rubro' })
  create(@Body() createRubroDto: CreateRubroDto) {
    return this.rubrosService.create(createRubroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de Rubros (opcionalmente filtrados por negocioId)' })
  @ApiQuery({ name: 'negocioId', required: false })
  findAll(@Query('negocioId') negocioId?: string) {
    return this.rubrosService.findAll(negocioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un Rubro por ID' })
  findOne(@Param('id') id: string) {
    return this.rubrosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un Rubro' })
  update(@Param('id') id: string, @Body() updateRubroDto: UpdateRubroDto) {
    return this.rubrosService.update(id, updateRubroDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de un Rubro (ACTIVO/INACTIVO)' })
  toggleStatus(@Param('id') id: string, @Body('estado') estado: 'ACTIVO' | 'INACTIVO') {
    return this.rubrosService.toggleStatus(id, estado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Rubro por ID' })
  remove(@Param('id') id: string) {
    return this.rubrosService.remove(id);
  }
}
