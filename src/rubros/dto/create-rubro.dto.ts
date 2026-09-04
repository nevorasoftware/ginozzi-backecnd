import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRubroDto {
  @ApiProperty({ description: 'ID del Negocio al que pertenece el Rubro' })
  @IsString()
  @IsNotEmpty()
  negocioId: string;

  @ApiProperty({ description: 'Nombre del Rubro (ej. Librería, Papelería, Tecnología)' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción opcional del Rubro' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Estado del Rubro (ACTIVO, INACTIVO)', enum: ['ACTIVO', 'INACTIVO'] })
  @IsEnum(['ACTIVO', 'INACTIVO'])
  @IsOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}
