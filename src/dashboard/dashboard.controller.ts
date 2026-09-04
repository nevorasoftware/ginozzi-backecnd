import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'Obtener métricas resumen KPI principales' })
  async getResumen(@Request() req: any) {
    return this.dashboardService.getResumen(req.user);
  }

  @Get('ventas-periodo')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener historial de ventas agrupado por período' })
  async getVentasPeriodo(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.dashboardService.getVentasPeriodo(from, to, groupBy);
  }

  @Get('top-vendedores')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener ranking de mejores vendedores' })
  async getTopVendedores(
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getTopVendedores(limit, from, to);
  }

  @Get('rendimiento-vendedores')
  @Roles('SUPER_ADMIN', 'EMPRESARIO', 'VENDEDOR')
  @ApiOperation({ summary: 'Obtener rendimiento detallado por vendedor / negocio' })
  async getRendimientoVendedores(
    @Query('negocioId') negocioId?: string,
    @Query('vendedorId') vendedorId?: string,
  ) {
    return this.dashboardService.getRendimientoVendedores(negocioId, vendedorId);
  }
}
