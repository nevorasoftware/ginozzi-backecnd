import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ginozzi_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        empresario: true,
        vendedor: {
          include: { negocio: true }
        }
      }
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado.');
    }

    if (user.role === 'VENDEDOR' && user.vendedor && user.vendedor.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Vendedor inactivo o bloqueado. Contacte a su empresario.');
    }

    return {
      userId: user.id,
      correo: user.correo,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
      empresarioId: user.empresarioId,
      vendedorId: user.vendedorId,
      negocioId: user.vendedor?.negocioId,
      user,
    };
  }
}
