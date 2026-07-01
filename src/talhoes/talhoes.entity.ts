import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('talhoes')
export class Talhao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'jsonb', default: [] })
  coordenadas: { lat: number; lng: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  area_hectares: number;

  @Column({ default: '#22c55e' })
  cor: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ nullable: true })
  propriedade_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
