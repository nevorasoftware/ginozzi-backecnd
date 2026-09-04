import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getResumen(userContext?: { role: string; empresarioId?: string; vendedorId?: string; negocioId?: string }) {
    const totalEmpresarios = await this.prisma.empresario.count();
    const totalNegocios = await this.prisma.negocio.count();
    const totalVendedores = await this.prisma.vendedor.count();
    const vendedoresActivos = await this.prisma.vendedor.count({ where: { estado: 'ACTIVO' } });
    const totalClientes = await this.prisma.cliente.count();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ventasTotal = await this.prisma.venta.aggregate({
      where: { estado: 'COMPLETADA' },
      _sum: { total: true, montoGanancia: true },
      _count: true,
    });

    const ventasMes = await this.prisma.venta.aggregate({
      where: {
        estado: 'COMPLETADA',
        fechaVenta: { gte: startOfMonth },
      },
      _sum: { total: true, montoGanancia: true },
      _count: true,
    });

    return {
      kpis: {
        totalEmpresarios,
        totalNegocios,
        totalVendedores,
        vendedoresActivos,
        totalClientes,
        ventasMesCount: ventasMes._count || 0,
        ventasMesTotal: ventasMes._sum.total || 0,
        gananciasMesTotal: ventasMes._sum.montoGanancia || 0,
        ventasAcumuladasTotal: ventasTotal._sum.total || 0,
        gananciasAcumuladasTotal: ventasTotal._sum.montoGanancia || 0,
      },
    };
  }

  async getVentasPeriodo(from?: string, to?: string, groupBy: string = 'month') {
    const fromDate = from ? new Date(from) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const toDate = to ? new Date(to) : new Date();

    const ventas = await this.prisma.venta.findMany({
      where: {
        estado: 'COMPLETADA',
        fechaVenta: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        fechaVenta: true,
        total: true,
        montoGanancia: true,
      },
      orderBy: { fechaVenta: 'asc' },
    });

    // Grouping by key (Month name / date label)
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
        // month
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

  async getTopVendedores(limit: number = 5, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const vendedores = await this.prisma.vendedor.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        negocio: true,
        ventas: {
          where: {
            estado: 'COMPLETADA',
            ...(fromDate || toDate
              ? {
                  fechaVenta: {
                    ...(fromDate && { gte: fromDate }),
                    ...(toDate && { lte: toDate }),
                  },
                }
              : {}),
          },
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
        rubro: v.negocio.rubro,
        totalVendido: Number(totalVendido.toFixed(2)),
        totalGanancias: Number(totalGanancias.toFixed(2)),
        cantidadVentas: v.ventas.length,
        cantidadClientes: v._count.clientes,
      };
    });

    ranked.sort((a, b) => b.totalVendido - a.totalVendido);
    return ranked.slice(0, Number(limit));
  }

  async getRendimientoVendedores(negocioId?: string, vendedorId?: string) {
    const vendedores = await this.prisma.vendedor.findMany({
      where: {
        ...(negocioId && { negocioId }),
        ...(vendedorId && { id: vendedorId }),
      },
      include: {
        negocio: true,
        ventas: { where: { estado: 'COMPLETADA' } },
        clientes: true,
      },
    });

    return vendedores.map((v) => {
      const totalVendido = v.ventas.reduce((sum, item) => sum + item.total, 0);
      const totalGanancias = v.ventas.reduce((sum, item) => sum + item.montoGanancia, 0);
      return {
        id: v.id,
        nombreCompleto: `${v.nombre} ${v.apellido}`,
        negocio: v.negocio.nombre,
        totalVendido: Number(totalVendido.toFixed(2)),
        totalGanancias: Number(totalGanancias.toFixed(2)),
        cantidadVentas: v.ventas.length,
        cantidadClientes: v.clientes.length,
        promedioTicket: v.ventas.length > 0 ? Number((totalVendido / v.ventas.length).toFixed(2)) : 0,
      };
    });
  }
}
