import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Segmento,
  UnidadeConcentracao,
  UnidadeVolume,
  Moeda,
  PrazoPagamento,
} from '../cotacao-insumo.entity';

export class CreateCotacaoInsumoDto {
  @IsNotEmpty()
  @IsString()
  empresa: string;

  @IsOptional()
  @IsString()
  representante?: string;

  @IsNotEmpty()
  @IsDateString()
  data_cotacao: string;

  @IsOptional()
  @IsDateString()
  validade_cotacao?: string;

  @IsNotEmpty()
  @IsEnum(Segmento)
  segmento: Segmento;

  @IsNotEmpty()
  @IsString()
  produto_comercial: string;

  @IsOptional()
  @IsString()
  principio_ativo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  concentracao?: number;

  @IsOptional()
  @IsEnum(UnidadeConcentracao)
  unidade_concentracao?: UnidadeConcentracao;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume_embalagem?: number;

  @IsOptional()
  @IsEnum(UnidadeVolume)
  unidade_volume?: UnidadeVolume;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco_unitario: number;

  @IsOptional()
  @IsEnum(Moeda)
  moeda?: Moeda;

  @IsOptional()
  @IsEnum(PrazoPagamento)
  prazo_pagamento?: PrazoPagamento;

  @IsOptional()
  @IsString()
  condicao_pagamento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
