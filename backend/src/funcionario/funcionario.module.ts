import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funcionario } from './funcionario.entity';
import { FuncionariosService } from './funcionario.service';
import { FuncionariosController } from './funcionario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Funcionario])],
  providers: [FuncionariosService],
  controllers: [FuncionariosController],
})
export class FuncionariosModule {}
