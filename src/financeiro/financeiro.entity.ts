import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoLancamento } from './enums/tipo-lancamento.enum';
 
@Entity('financeiro')
export class Financeiro {
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @Column()
  descricao: string;
 
  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;
 
  // Antes era string livre — agora usa o enum (RECEITA | DESPESA)
  @Column({
    type: 'enum',
    enum: TipoLancamento,
    default: TipoLancamento.DESPESA,
  })
  tipo: TipoLancamento;
 
  @Column({ nullable: true })
  categoria: string;
 
  @Column({ nullable: true })
  dataVencimento: Date;
 
  // Data do lançamento (usada nas queries do dashboard)
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  data: Date;
 
  @Column({ default: 'pendente' })
  status: string;
 
  // Vínculos agrícolas (nullable para não quebrar registros existentes)
  @Column({ nullable: true })
  fazendaId: string;
 
  @Column({ nullable: true })
  safraId: string;
 
  @Column({ nullable: true })
  talhaoId: string;
 
  @Column({ nullable: true })
  culturaId: string;
 
  @Column({ nullable: true })
  observacao: string;
 
  @CreateDateColumn()
  createdAt: Date;
 
  @UpdateDateColumn()
  updatedAt: Date;
}
 
