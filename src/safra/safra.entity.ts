import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Propriedade } from '../propriedades/propriedade.entity';

@Entity('safras')
export class Safra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  cultura: string;

  @Column({ nullable: true })
  ano: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaHectares: number;

  @Column({ nullable: true })
  dataInicio: Date;

  @Column({ nullable: true })
  dataFim: Date;

  @Column({ nullable: true })
  observacao: string;

  @Column({ default: 'planejamento' })
  status: string; // planejamento | em_andamento | finalizada

  @Column({ nullable: true })
  propriedadeId: string;

  @ManyToOne(() => Propriedade, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propriedadeId' })
  propriedade: Propriedade;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
