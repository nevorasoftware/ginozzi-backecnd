import { Module } from '@nestjs/common';
import { EmpresariosService } from './empresarios.service';
import { EmpresariosController } from './empresarios.controller';

@Module({
  controllers: [EmpresariosController],
  providers: [EmpresariosService],
  exports: [EmpresariosService],
})
export class EmpresariosModule {}
