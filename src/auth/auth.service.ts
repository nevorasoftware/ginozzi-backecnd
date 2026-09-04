import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(correo: string, contrasena: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        empresario: true,
        vendedor: {
          include: { negocio: true },
        },
      },
    });

    if (!user) {
      // Fallback check directly in Vendedor table if user record was not synchronized
      const vendedor = await this.prisma.vendedor.findUnique({
        where: { correo },
        include: { negocio: true },
      });
      if (vendedor) {
        if (vendedor.estado !== 'ACTIVO') {
          throw new UnauthorizedException('Su cuenta de vendedor se encuentra inactiva o bloqueada.');
        }
        const isMatch = await bcrypt.compare(contrasena, vendedor.contrasena);
        if (!isMatch) {
          throw new UnauthorizedException('Credenciales inválidas');
        }
        // Auto-create Usuario record for seamless auth
        const createdUser = await this.prisma.usuario.create({
          data: {
            correo: vendedor.correo,
            contrasena: vendedor.contrasena,
            nombre: vendedor.nombre,
            apellido: vendedor.apellido,
            role: 'VENDEDOR',
            vendedorId: vendedor.id,
            activo: true,
          },
        });
        return this.generateTokens(createdUser, vendedor);
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Cuenta de usuario inactiva.');
    }

    if (user.role === 'VENDEDOR' && user.vendedor && user.vendedor.estado !== 'ACTIVO') {
      throw new UnauthorizedException('El vendedor se encuentra inactivo o bloqueado.');
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateTokens(user, user.vendedor);
  }

  async refreshToken(refreshTokenStr: string) {
    try {
      const payload = this.jwtService.verify(refreshTokenStr, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'ginozzi_super_secret_refresh_key_2026',
      });

      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: { vendedor: true, empresario: true },
      });

      if (!user || !user.activo) {
        throw new UnauthorizedException('Token de refresco inválido');
      }

      return this.generateTokens(user, user.vendedor);
    } catch (e) {
      throw new UnauthorizedException('Token de refresco caducado o inválido');
    }
  }

  private generateTokens(user: any, vendedorDetails?: any) {
    const payload = {
      sub: user.id,
      correo: user.correo,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
      empresarioId: user.empresarioId,
      vendedorId: user.vendedorId,
      negocioId: vendedorDetails?.negocioId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'ginozzi_super_secret_refresh_key_2026',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        correo: user.correo,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        empresarioId: user.empresarioId,
        vendedorId: user.vendedorId,
        negocioId: vendedorDetails?.negocioId,
      },
    };
  }
}
