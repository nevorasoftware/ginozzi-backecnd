import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { UpdateRubroDto } from './dto/update-rubro.dto';

@Injectable()
export class RubrosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRubroDto: CreateRubroDto) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: createRubroDto.negocioId },
    });
    if (!negocio) {
      throw new NotFoundException(`Negocio con ID ${createRubroDto.negocioId} no encontrado.`);
    }

    return this.prisma.rubro.create({
      data: {
        negocioId: createRubroDto.negocioId,
        nombre: createRubroDto.nombre,
        descripcion: createRubroDto.descripcion,
        estado: createRubroDto.estado || 'ACTIVO',
      },
      include: { negocio: true },
    });
  }

  async findAll(negocioId?: string) {
    const where: any = {};
    if (negocioId) {
      where.negocioId = negocioId;
    }
    return this.prisma.rubro.findMany({
      where,
      include: {
        negocio: true,
        _count: {
          select: { vendedores: true, productosServicios: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rubro = await this.prisma.rubro.findUnique({
      where: { id },
      include: {
        negocio: true,
        vendedores: true,
        productosServicios: true,
      },
    });
    if (!rubro) {
      throw new NotFoundException(`Rubro con ID ${id} no encontrado.`);
    }
    return rubro;
  }

  async update(id: string, updateRubroDto: UpdateRubroDto) {
    await this.findOne(id);
    return this.prisma.rubro.update({
      where: { id },
      data: updateRubroDto,
      include: { negocio: true },
    });
  }

  async toggleStatus(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    await this.findOne(id);
    return this.prisma.rubro.update({
      where: { id },
      data: { estado },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rubro.delete({ where: { id } });
  }
}
