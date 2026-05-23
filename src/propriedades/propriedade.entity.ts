import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('propriedades')
export class Propriedade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaTotal: number;

  @Column({ nullable: true })
  cidade: string;

  @Column({ nullable: true })
  estado: string;

  @Column({ nullable: true })
  cep: string;

  @Column({ nullable: true })
  endereco: string;

  @Column({ default: true })
  ativa: boolean;

  @Column({ nullable: true })
 tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
