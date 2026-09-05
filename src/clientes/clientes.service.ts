import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(vendedorId?: string) {
    return this.prisma.cliente.findMany({
      where: vendedorId ? { vendedorId } : {},
      include: {
        vendedor: {
          include: { negocio: true },
        },
        _count: { select: { ventas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        vendedor: {
          include: { negocio: true },
        },
        ventas: {
          include: { detalles: { include: { productoServicio: true } } },
          orderBy: { fechaVenta: 'desc' },
        },
      },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }
    return cliente;
  }

  async create(data: { vendedorId: string; nombre: string; apellido: string; telefono: string; correo: string; dui?: string; direccion?: string; observaciones?: string; estado?: string }) {
    // Duplicate check for DUI / Phone per seller or global
    if (data.dui) {
      const existingDui = await this.prisma.cliente.findFirst({
        where: { dui: data.dui, vendedorId: data.vendedorId },
      });
      if (existingDui) {
        throw new ConflictException('Ya existe un cliente con este DUI registrado para este vendedor.');
      }
    }

    return this.prisma.cliente.create({
      data: {
        vendedorId: data.vendedorId,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        correo: data.correo,
        dui: data.dui,
        direccion: data.direccion,
        observaciones: data.observaciones,
        estado: data.estado || 'ACTIVO',
      },
      include: { vendedor: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data,
      include: { vendedor: true },
    });
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    await this.findOne(id);
    return this.prisma.cliente.update({
      where: { id },
      data: { estado },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cliente.delete({
      where: { id },
    });
  }
}
