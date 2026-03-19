import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { Funcionario } from '../funcionario/funcionario.entity';

export enum StatusLocacao {
  ATIVA = 'ATIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

@Entity()
export class Locacao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @ManyToOne(() => Veiculo)
  veiculo: Veiculo;

  @ManyToOne(() => Funcionario, { nullable: true })
  funcionario: Funcionario;

  @Column()
  dataRetirada: Date;

  @Column()
  dataDevolucaoPrevista: Date;

  @Column({ nullable: true })
  dataDevolucaoEfetiva: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  valorPrevisto: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  valorFinal: number;

  @Column({
    type: 'enum',
    enum: StatusLocacao,
    default: StatusLocacao.ATIVA,
  })
  status: StatusLocacao;
}
