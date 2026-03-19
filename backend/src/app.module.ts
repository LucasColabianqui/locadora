import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ClientesModule } from './clientes/clientes.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { LocacoesModule } from './locacoes/locacoes.module';
import { FuncionariosModule } from './funcionario/funcionario.module';
import { CategoriasModule } from './categoria/categoria.module';
import { AuthModule } from './auth/auth.module';

import { Cliente } from './domain/clientes/cliente.entity';
import { Endereco } from './endereco/endereco.entity';
import { Veiculo } from './veiculos/veiculo.entity';
import { Categoria } from './categoria/categoria.entity';
import { Funcionario } from './funcionario/funcionario.entity';
import { Locacao } from './locacoes/locacao.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_NAME', 'locadora'),
        entities: [Cliente, Endereco, Veiculo, Categoria, Funcionario, Locacao],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    ClientesModule,
    VeiculosModule,
    LocacoesModule,
    FuncionariosModule,
    CategoriasModule,
    AuthModule,
  ],
})
export class AppModule {}
