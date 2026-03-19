import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Categoria } from '../categoria/categoria.entity';

export enum StatusVeiculo {
  DISPONIVEL = 'DISPONIVEL',
  ALUGADO = 'ALUGADO',
  EM_MANUTENCAO = 'EM_MANUTENCAO',
  INATIVO = 'INATIVO',
  VENDIDO = 'VENDIDO',
}

@Entity()
export class Veiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: number;

  @Column({ nullable: true })
  cor: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  quilometragemAtual: number;

  @ManyToOne(() => Categoria, { nullable: true })
  categoria: Categoria;

  @Column({
    type: 'enum',
    enum: StatusVeiculo,
    default: StatusVeiculo.DISPONIVEL,
  })
  status: StatusVeiculo;
}
