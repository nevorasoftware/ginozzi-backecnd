import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener métricas resumen KPI principales con filtros avanzados jerárquicos' })
  @ApiQuery({ name: 'empresarioIds', required: false, description: 'IDs de empresarios separados por coma' })
  @ApiQuery({ name: 'negocioIds', required: false, description: 'IDs de negocios separados por coma' })
  @ApiQuery({ name: 'rubroIds', required: false, description: 'IDs de rubros separados por coma' })
  @ApiQuery({ name: 'vendedorIds', required: false, description: 'IDs de vendedores separados por coma' })
  @ApiQuery({ name: 'period', required: false, description: '1M, 3M, 6M, 12M, custom' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getResumen(
    @Query('empresarioIds') empresarioIds?: string,
    @Query('negocioIds') negocioIds?: string,
    @Query('rubroIds') rubroIds?: string,
    @Query('vendedorIds') vendedorIds?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getResumen({ empresarioIds: empresarioIds ? empresarioIds.split(',') : undefined, negocioIds: negocioIds ? negocioIds.split(',') : undefined, rubroIds: rubroIds ? rubroIds.split(',') : undefined, vendedorIds: vendedorIds ? vendedorIds.split(',') : undefined, period, from, to });
  }

  @Get('ventas-periodo')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener historial de ventas agrupado por período con filtros avanzados' })
  async getVentasPeriodo(
    @Query('empresarioIds') empresarioIds?: string,
    @Query('negocioIds') negocioIds?: string,
    @Query('rubroIds') rubroIds?: string,
    @Query('vendedorIds') vendedorIds?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.dashboardService.getVentasPeriodo({ empresarioIds: empresarioIds ? empresarioIds.split(',') : undefined, negocioIds: negocioIds ? negocioIds.split(',') : undefined, rubroIds: rubroIds ? rubroIds.split(',') : undefined, vendedorIds: vendedorIds ? vendedorIds.split(',') : undefined, period, from, to, groupBy });
  }

  @Get('top-vendedores')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener ranking de mejores vendedores' })
  async getTopVendedores(
    @Query('limit') limit?: number,
    @Query('empresarioIds') empresarioIds?: string,
    @Query('negocioIds') negocioIds?: string,
    @Query('rubroIds') rubroIds?: string,
    @Query('vendedorIds') vendedorIds?: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getTopVendedores(limit || 5, { empresarioIds: empresarioIds ? empresarioIds.split(',') : undefined, negocioIds: negocioIds ? negocioIds.split(',') : undefined, rubroIds: rubroIds ? rubroIds.split(',') : undefined, vendedorIds: vendedorIds ? vendedorIds.split(',') : undefined, period, from, to });
  }

  @Get('rendimiento-vendedores')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener rendimiento detallado por vendedor' })
  async getRendimientoVendedores(
    @Query('empresarioIds') empresarioIds?: string,
    @Query('negocioIds') negocioIds?: string,
    @Query('rubroIds') rubroIds?: string,
    @Query('vendedorIds') vendedorIds?: string,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getRendimientoVendedores({ empresarioIds: empresarioIds ? empresarioIds.split(',') : undefined, negocioIds: negocioIds ? negocioIds.split(',') : undefined, rubroIds: rubroIds ? rubroIds.split(',') : undefined, vendedorIds: vendedorIds ? vendedorIds.split(',') : undefined, period });
  }
}
