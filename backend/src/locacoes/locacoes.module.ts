import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocacoesService } from './locacoes.service';
import { LocacoesController } from './locacoes.controller';
import { Locacao } from './locacao.entity';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { Funcionario } from '../funcionario/funcionario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locacao, Cliente, Veiculo, Funcionario])],
  providers: [LocacoesService],
  controllers: [LocacoesController],
})
export class LocacoesModule {}
