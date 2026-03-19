import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Endereco } from '../endereco/endereco.entity';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmClienteRepository } from './cliente.repository';
import { ClientesDomainService } from '../domain/clientes/clientes.service';
import { ClienteRepository } from '../domain/clientes/cliente.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Endereco])],
  providers: [
    ClientesService,
    {
      provide: 'CLIENTE_REPOSITORY',
      useClass: TypeOrmClienteRepository,
    },
    {
      provide: ClientesDomainService,
      useFactory: (repo: ClienteRepository) => new ClientesDomainService(repo),
      inject: ['CLIENTE_REPOSITORY'],
    },
  ],
  controllers: [ClientesController],
})
export class ClientesModule {}
