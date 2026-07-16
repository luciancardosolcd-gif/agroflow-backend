import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('registros_climaticos')
export class RegistroClimatico {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  propriedade_id: string

  @Column({ nullable: true })
  estacao: string

  @Column({ type: 'date' })
  data: string

  @Column({ type: 'float', nullable: true })
  precipitacao: number

  @Column({ type: 'float', nullable: true })
  temperatura: number

  @Column({ type: 'float', nullable: true })
  umidade: number

  @Column({ type: 'float', nullable: true })
  pressao: number

  @CreateDateColumn()
  created_at: Date
}
