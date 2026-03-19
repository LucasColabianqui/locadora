import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Endereco } from '../../endereco/endereco.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  cnh: string;

  @Exclude()
  @Column({ nullable: true })
  validadeCnh: Date;

  @Exclude()
  @Column({ nullable: true })
  dataNascimento: Date;

  @Column()
  telefone: string;

  @Column()
  email: string;

  @OneToOne(() => Endereco, { cascade: true, nullable: true })
  @JoinColumn()
  endereco: Endereco;
}
