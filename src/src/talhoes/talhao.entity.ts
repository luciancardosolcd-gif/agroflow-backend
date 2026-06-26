import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('talhoes')
export class Talhao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 255 }) nome: string;
  @Column({ nullable: true }) propriedade_id: string;
  @Column({ nullable: true }) usuario_id: string;
  @Column({ type: 'jsonb' }) coordenadas: { lat: number; lng: number }[];
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true }) area_hectares: number;
  @Column({ type: 'text', nullable: true }) observacoes: string;
  @Column({ length: 50, nullable: true }) cor: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
