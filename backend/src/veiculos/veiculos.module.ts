import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculosService } from './veiculos.service';
import { VeiculosController } from './veiculos.controller';
import { Veiculo } from './veiculo.entity';
import { Categoria } from '../categoria/categoria.entity';
import { Locacao } from '../locacoes/locacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo, Categoria, Locacao])],
  providers: [VeiculosService],
  controllers: [VeiculosController],
})
export class VeiculosModule {}
