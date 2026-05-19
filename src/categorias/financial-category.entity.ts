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
  code: string;
  @Column({ length: 200 })
  name: string;
  @Column({ type: 'enum', enum: ['sintetica', 'analitica'], default: 'analitica' })
  type: string;
  @Column({ type: 'enum', enum: ['receita', 'despesa', 'neutro'], default: 'despesa' })
  nature: string;
  @Column({ default: 1 })
  level: number;
  @Column({ default: true })
  allowEntries: boolean;
  @Column({ default: true })
  active: boolean;
  @Column({ default: 0 })
  sortOrder: number;
  @Column({ nullable: true, length: 7 })
  color: string;
  @Column({ nullable: true, length: 50 })
  icon: string;
  @Column({ nullable: true })
  parentId: string;
  @ManyToOne(() => FinancialCategory, (cat) => cat.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: FinancialCategory;
  @OneToMany(() => FinancialCategory, (cat) => cat.parent)
  children: FinancialCategory[];
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
