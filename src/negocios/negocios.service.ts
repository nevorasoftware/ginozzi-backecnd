import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NegociosService {
  constructor(private prisma: PrismaService) {}

  async findAll(empresarioId?: string) {
    return this.prisma.negocio.findMany({
      where: empresarioId ? { empresarioId } : {},
      include: {
        empresario: true,
        vendedores: true,
        productosServicios: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
      include: {
        empresario: true,
        vendedores: true,
        productosServicios: true,
        ventas: {
          take: 10,
          orderBy: { fechaVenta: 'desc' },
        },
      },
    });
    if (!negocio) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado.`);
    }
    return negocio;
  }

  async create(data: { empresarioId: string; nombre: string; rubro: string; telefono: string; correo: string; porcentajeGanancia: number; estado?: string }) {
    return this.prisma.negocio.create({
      data: {
        empresarioId: data.empresarioId,
        nombre: data.nombre,
        rubro: data.rubro,
        telefono: data.telefono,
        correo: data.correo,
        porcentajeGanancia: Number(data.porcentajeGanancia),
        estado: data.estado || 'ACTIVO',
      },
      include: { empresario: true },
    });
  }

  async update(id: string, data: { nombre?: string; rubro?: string; telefono?: string; correo?: string; porcentajeGanancia?: number; estado?: string }) {
    await this.findOne(id);
    return this.prisma.negocio.update({
      where: { id },
      data: {
        ...data,
        ...(data.porcentajeGanancia !== undefined && { porcentajeGanancia: Number(data.porcentajeGanancia) }),
      },
      include: { empresario: true },
    });
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    await this.findOne(id);
    return this.prisma.negocio.update({
      where: { id },
      data: { estado },
    });
  }
}
