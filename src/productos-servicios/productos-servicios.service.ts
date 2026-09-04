import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductosServiciosService {
  constructor(private prisma: PrismaService) {}

  async findAll(negocioId?: string, tipo?: string) {
    return this.prisma.productoServicio.findMany({
      where: {
        ...(negocioId && { negocioId }),
        ...(tipo && { tipo }),
      },
      include: {
        negocio: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.productoServicio.findUnique({
      where: { id },
      include: { negocio: true },
    });
    if (!item) {
      throw new NotFoundException(`Producto/Servicio con ID ${id} no encontrado.`);
    }
    return item;
  }

  async create(data: { negocioId: string; nombre: string; descripcion?: string; tipo: 'PRODUCTO' | 'SERVICIOS' | string; precio: number; estado?: string }) {
    return this.prisma.productoServicio.create({
      data: {
        negocioId: data.negocioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo || 'PRODUCTO',
        precio: Number(data.precio),
        estado: data.estado || 'ACTIVO',
      },
      include: { negocio: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.productoServicio.update({
      where: { id },
      data: {
        ...data,
        ...(data.precio !== undefined && { precio: Number(data.precio) }),
      },
      include: { negocio: true },
    });
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    await this.findOne(id);
    return this.prisma.productoServicio.update({
      where: { id },
      data: { estado },
    });
  }
}
