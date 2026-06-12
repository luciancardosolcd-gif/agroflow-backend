import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum Segmento {
  HERBICIDA = 'Herbicida',
  FUNGICIDA = 'Fungicida',
  INSETICIDA = 'Inseticida',
  FERTILIZANTE = 'Fertilizante',
  ADJUVANTE = 'Adjuvante',
  BIOLOGICO = 'Biológico',
  SEMENTE = 'Semente',
  REGULADOR_CRESCIMENTO = 'Regulador de Crescimento',
  TRATAMENTO_SEMENTES = 'Tratamento de Sementes',
  OUTROS = 'Outros',
}

export enum UnidadeConcentracao {
  G_L = 'g/L',
  G_KG = 'g/Kg',
  SC = 'SC',
  WG = 'WG',
  EC = 'EC',
  SL = 'SL',
  OD = 'OD',
  FS = 'FS',
  OUTROS = 'Outros',
}

export enum UnidadeVolume {
  LITRO = 'Litro',
  KG = 'Kg',
  ML = 'mL',
  G = 'g',
}

export enum Moeda {
  REAL = 'BRL',
  DOLAR = 'USD',
}

export enum PrazoPagamento {
  A_VISTA = 'À Vista',
  TRINTA = '30 dias',
  SESSENTA = '60 dias',
  NOVENTA = '90 dias',
  CENTO_VINTE = '120 dias',
  PRAZO_SOJA = 'Prazo Soja',
  PERSONALIZADO = 'Personalizado',
}

@Entity('cotacoes_insumos')
export class CotacaoInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  empresa: string;

  @Column({ length: 255, nullable: true })
  representante: string;

  @Column({ type: 'date' })
  data_cotacao: string;

  @Column({ type: 'date', nullable: true })
  validade_cotacao: string;

  @Column({ type: 'enum', enum: Segmento })
  segmento: Segmento;

  @Column({ length: 255 })
  produto_comercial: string;

  @Column({ length: 255, nullable: true })
  principio_ativo: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  concentracao: number;

  @Column({ type: 'enum', enum: UnidadeConcentracao, nullable: true })
  unidade_concentracao: UnidadeConcentracao;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  volume_embalagem: number;

  @Column({ type: 'enum', enum: UnidadeVolume, nullable: true })
  unidade_volume: UnidadeVolume;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  preco_unitario: number;

  @Column({ type: 'enum', enum: Moeda, default: Moeda.REAL })
  moeda: Moeda;

  @Column({ type: 'enum', enum: PrazoPagamento, default: PrazoPagamento.A_VISTA })
  prazo_pagamento: PrazoPagamento;

  @Column({ type: 'text', nullable: true })
  condicao_pagamento: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ nullable: true })
  usuario_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
