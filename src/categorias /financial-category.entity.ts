import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('financial_categories')
@Index(['code'])
@Index(['parentId'])
@Index(['mainCategoryId'])
export class FinancialCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  code: string; // ex: 3, 3.1, 3.1.1, 4.1.1.3.5

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ['sintetica', 'analitica'], default: 'analitica' })
  type: string; // sintetica = agrupador | analitica = recebe lançamentos

  @Column({ type: 'enum', enum: ['receita', 'despesa', 'neutro'], default: 'despesa' })
  nature: string;

  @Column({ default: 1 })
  level: number; // nível hierárquico (1, 2, 3, 4, 5...)

  @Column({ default: true })
  allowEntries: boolean; // apenas analíticas permitem lançamentos

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true, length: 7 })
  color: string; // ex: #22c55e

  @Column({ nullable: true, length: 50 })
  icon: string;

  // Referência ao pai (self-referencing)
  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => FinancialCategory, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: FinancialCategory;

  @OneToMany(() => FinancialCategory, (cat) => cat.parent)
  children: FinancialCategory[];

  // Referência direta à categoria principal (nível 1) para consolidação rápida
  @Column({ nullable: true })
  mainCategoryId: string;

  @ManyToOne(() => FinancialCategory, { nullable: true })
  @JoinColumn({ name: 'mainCategoryId' })
  mainCategory: FinancialCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
