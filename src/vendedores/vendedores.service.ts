import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VendedoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(negocioId?: string) {
    return this.prisma.vendedor.findMany({
      where: negocioId ? { negocioId } : {},
      include: {
        negocio: {
          include: { empresario: true },
        },
        _count: {
          select: { clientes: true, ventas: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendedor = await this.prisma.vendedor.findUnique({
      where: { id },
      include: {
        negocio: {
          include: { empresario: true },
        },
        clientes: true,
        ventas: {
          take: 20,
          orderBy: { fechaVenta: 'desc' },
          include: { cliente: true, detalles: { include: { productoServicio: true } } },
        },
      },
    });
    if (!vendedor) {
      throw new NotFoundException(`Vendedor con ID ${id} no encontrado.`);
    }
    return vendedor;
  }

  async create(data: { negocioId: string; nombre: string; apellido: string; correo: string; telefono: string; dui: string; contrasena: string; estado?: string }) {
    const existingCorreo = await this.prisma.vendedor.findUnique({ where: { correo: data.correo } });
    if (existingCorreo) throw new ConflictException('El correo del vendedor ya está registrado.');

    const existingDui = await this.prisma.vendedor.findUnique({ where: { dui: data.dui } });
    if (existingDui) throw new ConflictException('El DUI ingresado ya está registrado.');

    const hashedPassword = await bcrypt.hash(data.contrasena || 'Vendedor123!', 10);

    const vendedor = await this.prisma.vendedor.create({
      data: {
        negocioId: data.negocioId,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        dui: data.dui,
        contrasena: hashedPassword,
        estado: data.estado || 'ACTIVO',
      },
      include: { negocio: true },
    });

    // Create user login account for Vendedor
    await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: hashedPassword,
        nombre: data.nombre,
        apellido: data.apellido,
        role: 'VENDEDOR',
        vendedorId: vendedor.id,
        activo: (data.estado || 'ACTIVO') === 'ACTIVO',
      },
    });

    return vendedor;
  }

  async update(id: string, data: { negocioId?: string; nombre?: string; apellido?: string; correo?: string; telefono?: string; dui?: string; contrasena?: string; estado?: string }) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.contrasena) {
      updateData.contrasena = await bcrypt.hash(data.contrasena, 10);
    }
    const updated = await this.prisma.vendedor.update({
      where: { id },
      data: updateData,
      include: { negocio: true },
    });

    // Sync Usuario entity
    if (data.correo || data.contrasena || data.nombre || data.apellido || data.estado) {
      await this.prisma.usuario.updateMany({
        where: { vendedorId: id },
        data: {
          ...(data.correo && { correo: data.correo }),
          ...(updateData.contrasena && { contrasena: updateData.contrasena }),
          ...(data.nombre && { nombre: data.nombre }),
          ...(data.apellido && { apellido: data.apellido }),
          ...(data.estado && { activo: data.estado === 'ACTIVO' }),
        },
      });
    }

    return updated;
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO') {
    await this.findOne(id);
    const updated = await this.prisma.vendedor.update({
      where: { id },
      data: { estado },
    });
    await this.prisma.usuario.updateMany({
      where: { vendedorId: id },
      data: { activo: estado === 'ACTIVO' },
    });
    return updated;
  }

  async getEstadisticas(id: string) {
    const vendedor = await this.findOne(id);
    const ventas = await this.prisma.venta.findMany({
      where: { vendedorId: id, estado: 'COMPLETADA' },
    });

    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
    const totalGanancias = ventas.reduce((acc, v) => acc + v.montoGanancia, 0);
    const cantidadVentas = ventas.length;
    const cantidadClientes = await this.prisma.cliente.count({ where: { vendedorId: id } });

    return {
      vendedor: {
        id: vendedor.id,
        nombre: `${vendedor.nombre} ${vendedor.apellido}`,
        negocio: vendedor.negocio.nombre,
      },
      metricas: {
        totalVentas,
        totalGanancias,
        cantidadVentas,
        cantidadClientes,
        promedioVenta: cantidadVentas > 0 ? Number((totalVentas / cantidadVentas).toFixed(2)) : 0,
      },
    };
  }

  async getVentas(id: string) {
    await this.findOne(id);
    return this.prisma.venta.findMany({
      where: { vendedorId: id },
      include: {
        cliente: true,
        detalles: { include: { productoServicio: true } },
      },
      orderBy: { fechaVenta: 'desc' },
    });
  }

  async getClientes(id: string) {
    await this.findOne(id);
    return this.prisma.cliente.findMany({
      where: { vendedorId: id },
      include: { _count: { select: { ventas: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
