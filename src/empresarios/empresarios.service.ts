import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.empresario.findMany({
      include: {
        negocios: {
          include: {
            vendedores: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const empresario = await this.prisma.empresario.findUnique({
      where: { id },
      include: {
        negocios: {
          include: {
            vendedores: true,
            ventas: true,
          },
        },
      },
    });
    if (!empresario) {
      throw new NotFoundException(`Empresario con ID ${id} no encontrado.`);
    }
    return empresario;
  }

  async create(data: { nombre: string; apellido: string; correo: string; telefono: string; estado?: string }) {
    const existing = await this.prisma.empresario.findUnique({
      where: { correo: data.correo },
    });
    if (existing) {
      throw new ConflictException('El correo del empresario ya está registrado.');
    }

    const empresario = await this.prisma.empresario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        estado: data.estado || 'ACTIVO',
      },
    });

    // Create user login account for Empresario
    const defaultPass = await bcrypt.hash('Empresario123!', 10);
    await this.prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasena: defaultPass,
        nombre: data.nombre,
        apellido: data.apellido,
        role: 'EMPRESARIO',
        empresarioId: empresario.id,
        activo: (data.estado || 'ACTIVO') === 'ACTIVO',
      },
    });

    return empresario;
  }

  async update(id: string, data: { nombre?: string; apellido?: string; correo?: string; telefono?: string; estado?: string }) {
    await this.findOne(id);
    const updated = await this.prisma.empresario.update({
      where: { id },
      data,
    });
    // Sync user email / active state if updated
    if (data.correo || data.estado || data.nombre || data.apellido) {
      await this.prisma.usuario.updateMany({
        where: { empresarioId: id },
        data: {
          ...(data.correo && { correo: data.correo }),
          ...(data.nombre && { nombre: data.nombre }),
          ...(data.apellido && { apellido: data.apellido }),
          ...(data.estado && { activo: data.estado === 'ACTIVO' }),
        },
      });
    }
    return updated;
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    await this.findOne(id);
    const updated = await this.prisma.empresario.update({
      where: { id },
      data: { estado },
    });
    await this.prisma.usuario.updateMany({
      where: { empresarioId: id },
      data: { activo: estado === 'ACTIVO' },
    });
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.usuario.deleteMany({
      where: { empresarioId: id },
    });
    return this.prisma.empresario.delete({
      where: { id },
    });
  }
}
