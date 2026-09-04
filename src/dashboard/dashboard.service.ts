import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardFilterOptions {
  empresarioIds?: string[];
  negocioIds?: string[];
  rubroIds?: string[];
  vendedorIds?: string[];
  period?: string; // '1M', '3M', '6M', '12M', 'custom'
  from?: string;
  to?: string;
  groupBy?: string; // 'day', 'week', 'month', 'year'
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private parseArray(val?: string | string[]): string[] | undefined {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }

  private getDateRange(period?: string, fromStr?: string, toStr?: string) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined = toStr ? new Date(toStr) : new Date();

    if (fromStr) {
      fromDate = new Date(fromStr);
    } else if (period) {
      const now = new Date();
      if (period === '1M') {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (period === '3M') {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      } else if (period === '6M') {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      } else if (period === '12M') {
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      }
    }

    return { fromDate, toDate };
  }

  private buildVentaWhere(filters?: DashboardFilterOptions) {
    const empresarioIds = this.parseArray(filters?.empresarioIds);
    const negocioIds = this.parseArray(filters?.negocioIds);
    const rubroIds = this.parseArray(filters?.rubroIds);
    const vendedorIds = this.parseArray(filters?.vendedorIds);
    const { fromDate, toDate } = this.getDateRange(filters?.period, filters?.from, filters?.to);

    const where: any = {
      estado: 'COMPLETADA',
    };

    if (empresarioIds && empresarioIds.length > 0) {
      where.empresarioId = { in: empresarioIds };
    }
    if (negocioIds && negocioIds.length > 0) {
      where.negocioId = { in: negocioIds };
    }
    if (rubroIds && rubroIds.length > 0) {
      where.rubroId = { in: rubroIds };
    }
    if (vendedorIds && vendedorIds.length > 0) {
      where.vendedorId = { in: vendedorIds };
    }
    if (fromDate || toDate) {
      where.fechaVenta = {
        ...(fromDate && { gte: fromDate }),
        ...(toDate && { lte: toDate }),
      };
    }

    return where;
  }

  async getResumen(filters?: DashboardFilterOptions) {
    const totalEmpresarios = await this.prisma.empresario.count({ where: { estado: 'ACTIVO' } });
    const totalNegocios = await this.prisma.negocio.count({ where: { estado: 'ACTIVO' } });
    const totalRubros = await this.prisma.rubro.count({ where: { estado: 'ACTIVO' } });
    const totalVendedores = await this.prisma.vendedor.count();
    const vendedoresActivos = await this.prisma.vendedor.count({ where: { estado: 'ACTIVO' } });
    const totalClientes = await this.prisma.cliente.count({ where: { estado: 'ACTIVO' } });

    const ventaWhere = this.buildVentaWhere(filters);

    const ventasTotal = await this.prisma.venta.aggregate({
      where: ventaWhere,
      _sum: { total: true, montoGanancia: true, subtotal: true, descuento: true },
      _count: true,
    });

    const totalVentas = ventasTotal._sum.total || 0;
    const countVentas = ventasTotal._count || 0;
    const promedioTicket = countVentas > 0 ? Number((totalVentas / countVentas).toFixed(2)) : 0;

    return {
      kpis: {
        totalEmpresarios,
        totalNegocios,
        totalRubros,
        totalVendedores,
        vendedoresActivos,
        totalClientes,
        ventasMesCount: countVentas,
        ventasMesTotal: totalVentas,
        gananciasMesTotal: ventasTotal._sum.montoGanancia || 0,
        ventasAcumuladasTotal: totalVentas,
        gananciasAcumuladasTotal: ventasTotal._sum.montoGanancia || 0,
        promedioTicket,
      },
    };
  }

  async getVentasPeriodo(filters?: DashboardFilterOptions) {
    const ventaWhere = this.buildVentaWhere(filters);

    const ventas = await this.prisma.venta.findMany({
      where: ventaWhere,
      select: {
        fechaVenta: true,
        total: true,
        montoGanancia: true,
      },
      orderBy: { fechaVenta: 'asc' },
    });

    const groupBy = filters?.groupBy || 'month';
    const aggregated: Record<string, { periodo: string; totalVentas: number; ganancias: number; cantidad: number }> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    ventas.forEach((v) => {
      const dateObj = new Date(v.fechaVenta);
      let key = '';

      if (groupBy === 'day') {
        key = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
      } else if (groupBy === 'week') {
        const weekNum = Math.ceil(dateObj.getDate() / 7);
        key = `Sem ${weekNum} (${monthNames[dateObj.getMonth()]})`;
      } else if (groupBy === 'year') {
        key = `${dateObj.getFullYear()}`;
      } else {
        key = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      }

      if (!aggregated[key]) {
        aggregated[key] = { periodo: key, totalVentas: 0, ganancias: 0, cantidad: 0 };
      }

      aggregated[key].totalVentas += v.total;
      aggregated[key].ganancias += v.montoGanancia;
      aggregated[key].cantidad += 1;
    });

    return Object.values(aggregated).map((item) => ({
      ...item,
      totalVentas: Number(item.totalVentas.toFixed(2)),
      ganancias: Number(item.ganancias.toFixed(2)),
    }));
  }

  async getTopVendedores(limit: number = 5, filters?: DashboardFilterOptions) {
    const negocioIds = this.parseArray(filters?.negocioIds);
    const rubroIds = this.parseArray(filters?.rubroIds);
    const vendedorIds = this.parseArray(filters?.vendedorIds);

    const vendedores = await this.prisma.vendedor.findMany({
      where: {
        estado: 'ACTIVO',
        ...(negocioIds && negocioIds.length > 0 && { negocioId: { in: negocioIds } }),
        ...(rubroIds && rubroIds.length > 0 && { rubroId: { in: rubroIds } }),
        ...(vendedorIds && vendedorIds.length > 0 && { id: { in: vendedorIds } }),
      },
      include: {
        negocio: true,
        rubro: true,
        ventas: {
          where: this.buildVentaWhere(filters),
        },
        _count: { select: { clientes: true } },
      },
    });

    const ranked = vendedores.map((v) => {
      const totalVendido = v.ventas.reduce((sum, item) => sum + item.total, 0);
      const totalGanancias = v.ventas.reduce((sum, item) => sum + item.montoGanancia, 0);
      return {
        id: v.id,
        nombre: `${v.nombre} ${v.apellido}`,
        negocio: v.negocio.nombre,
        rubro: v.rubro?.nombre || v.negocio.rubro || 'General',
        totalVendido: Number(totalVendido.toFixed(2)),
        totalGanancias: Number(totalGanancias.toFixed(2)),
        cantidadVentas: v.ventas.length,
        cantidadClientes: v._count.clientes,
      };
    });

    ranked.sort((a, b) => b.totalVendido - a.totalVendido);
    return ranked.slice(0, Number(limit));
  }

  async getRendimientoVendedores(filters?: DashboardFilterOptions) {
    return this.getTopVendedores(100, filters);
  }
}
