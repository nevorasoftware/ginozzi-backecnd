import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { negocioId?: string; vendedorId?: string; clienteId?: string; estado?: string }) {
    return this.prisma.venta.findMany({
      where: {
        ...(filters.negocioId && { negocioId: filters.negocioId }),
        ...(filters.vendedorId && { vendedorId: filters.vendedorId }),
        ...(filters.clienteId && { clienteId: filters.clienteId }),
        ...(filters.estado && { estado: filters.estado }),
      },
      include: {
        negocio: true,
        vendedor: true,
        cliente: true,
        detalles: {
          include: { productoServicio: true },
        },
      },
      orderBy: { fechaVenta: 'desc' },
    });
  }

  async findOne(id: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        negocio: true,
        vendedor: true,
        cliente: true,
        detalles: {
          include: { productoServicio: true },
        },
      },
    });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada.`);
    }
    return venta;
  }

  async create(data: {
    negocioId?: string;
    vendedorId: string;
    clienteId: string;
    detalles: Array<{ productoServicioId: string; cantidad: number; precioUnitario?: number; descuento?: number }>;
    descuentoGeneral?: number;
    observaciones?: string;
  }) {
    // Check vendedor & negocio
    const vendedor = await this.prisma.vendedor.findUnique({
      where: { id: data.vendedorId },
      include: { negocio: true },
    });

    if (!vendedor || vendedor.estado !== 'ACTIVO') {
      throw new BadRequestException('Vendedor no encontrado o inactivo.');
    }

    const negocioId = data.negocioId || vendedor.negocioId;
    const negocio = vendedor.negocio;
    const porcentajeGanancia = negocio.porcentajeGanancia;

    if (!data.detalles || data.detalles.length === 0) {
      throw new BadRequestException('La venta debe incluir al menos un producto o servicio.');
    }

    // Process line items
    let subtotal = 0;
    const preparedDetails = [];

    for (const item of data.detalles) {
      const prod = await this.prisma.productoServicio.findUnique({
        where: { id: item.productoServicioId },
      });
      if (!prod) {
        throw new NotFoundException(`Producto/Servicio ${item.productoServicioId} no encontrado.`);
      }

      const cantidad = item.cantidad || 1;
      const precioUnitario = item.precioUnitario !== undefined ? Number(item.precioUnitario) : prod.precio;
      const itemDescuento = item.descuento ? Number(item.descuento) : 0;
      const itemSubtotal = (cantidad * precioUnitario) - itemDescuento;

      subtotal += itemSubtotal;

      preparedDetails.push({
        productoServicioId: prod.id,
        cantidad,
        precioUnitario,
        descuento: itemDescuento,
        subtotal: itemSubtotal,
      });
    }

    const descuentoGeneral = data.descuentoGeneral ? Number(data.descuentoGeneral) : 0;
    const total = Math.max(0, subtotal - descuentoGeneral);
    const montoGanancia = Number((total * (porcentajeGanancia / 100)).toFixed(2));

    return this.prisma.venta.create({
      data: {
        negocioId,
        vendedorId: vendedor.id,
        clienteId: data.clienteId,
        fechaVenta: new Date(),
        subtotal,
        descuento: descuentoGeneral,
        total,
        porcentajeGanancia,
        montoGanancia,
        observaciones: data.observaciones,
        estado: 'COMPLETADA',
        detalles: {
          create: preparedDetails,
        },
      },
      include: {
        negocio: true,
        vendedor: true,
        cliente: true,
        detalles: { include: { productoServicio: true } },
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.venta.update({
      where: { id },
      data,
      include: {
        negocio: true,
        vendedor: true,
        cliente: true,
        detalles: { include: { productoServicio: true } },
      },
    });
  }

  async anular(id: string) {
    await this.findOne(id);
    return this.prisma.venta.update({
      where: { id },
      data: { estado: 'ANULADA' },
      include: { negocio: true, vendedor: true, cliente: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.venta.delete({
      where: { id },
    });
  }
}
