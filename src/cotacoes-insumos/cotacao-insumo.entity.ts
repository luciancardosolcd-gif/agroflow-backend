import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, Request, HttpCode, HttpStatus,
  Injectable, NotFoundException, Module,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
  IsNumber, IsDateString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 255 }) empresa: string;
  @Column({ length: 255, nullable: true }) representante: string;
  @Column({ type: 'date' }) data_cotacao: string;
  @Column({ type: 'date', nullable: true }) validade_cotacao: string;
  @Column({ type: 'enum', enum: Segmento }) segmento: Segmento;
  @Column({ length: 255 }) produto_comercial: string;
  @Column({ length: 255, nullable: true }) principio_ativo: string;
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true }) concentracao: number;
  @Column({ type: 'enum', enum: UnidadeConcentracao, nullable: true }) unidade_concentracao: UnidadeConcentracao;
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true }) volume_embalagem: number;
  @Column({ type: 'enum', enum: UnidadeVolume, nullable: true }) unidade_volume: UnidadeVolume;
  @Column({ type: 'decimal', precision: 14, scale: 4 }) preco_unitario: number;
  @Column({ type: 'enum', enum: Moeda, default: Moeda.REAL }) moeda: Moeda;
  @Column({ type: 'enum', enum: PrazoPagamento, default: PrazoPagamento.A_VISTA }) prazo_pagamento: PrazoPagamento;
  @Column({ type: 'text', nullable: true }) condicao_pagamento: string;
  @Column({ type: 'text', nullable: true }) observacoes: string;
  @Column({ nullable: true }) usuario_id: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}

export class CreateCotacaoInsumoDto {
  @IsNotEmpty() @IsString() empresa: string;
  @IsOptional() @IsString() representante?: string;
  @IsNotEmpty() @IsDateString() data_cotacao: string;
  @IsOptional() @IsDateString() validade_cotacao?: string;
  @IsNotEmpty() @IsEnum(Segmento) segmento: Segmento;
  @IsNotEmpty() @IsString() produto_comercial: string;
  @IsOptional() @IsString() principio_ativo?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) concentracao?: number;
  @IsOptional() @IsEnum(UnidadeConcentracao) unidade_concentracao?: UnidadeConcentracao;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) volume_embalagem?: number;
  @IsOptional() @IsEnum(UnidadeVolume) unidade_volume?: UnidadeVolume;
  @IsNotEmpty() @Type(() => Number) @IsNumber() @Min(0) preco_unitario: number;
  @IsOptional() @IsEnum(Moeda) moeda?: Moeda;
  @IsOptional() @IsEnum(PrazoPagamento) prazo_pagamento?: PrazoPagamento;
  @IsOptional() @IsString() condicao_pagamento?: string;
  @IsOptional() @IsString() observacoes?: string;
}

@Injectable()
export class CotacoesInsumosService {
  constructor(
    @InjectRepository(CotacaoInsumo)
    private readonly repo: Repository<CotacaoInsumo>,
  ) {}

  async create(dto: CreateCotacaoInsumoDto, usuarioId: string) {
    return this.repo.save(this.repo.create({ ...dto, usuario_id: usuarioId }));
  }

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.empresa) where.empresa = ILike(`%${filters.empresa}%`);
    if (filters?.segmento) where.segmento = filters.segmento;
    if (filters?.produto) where.produto_comercial = ILike(`%${filters.produto}%`);
    if (filters?.principio_ativo) where.principio_ativo = ILike(`%${filters.principio_ativo}%`);
    if (filters?.moeda) where.moeda = filters.moeda;
    if (filters?.data_inicio && filters?.data_fim)
      where.data_cotacao = Between(filters.data_inicio, filters.data_fim);
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Cotação não encontrada');
    return c;
  }

  async update(id: string, dto: Partial<CreateCotacaoInsumoDto>) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
  }

  async getDashboard() {
    const all = await this.repo.find({ order: { created_at: 'DESC' } });
    const precosBRL = all
      .filter(c => c.moeda === Moeda.REAL && c.preco_unitario > 0)
      .map(c => Number(c.preco_unitario));
    return {
      menorCotacao: precosBRL.length ? Math.min(...precosBRL) : 0,
      maiorCotacao: precosBRL.length ? Math.max(...precosBRL) : 0,
      economiaPotencial: precosBRL.length ? Math.max(...precosBRL) - Math.min(...precosBRL) : 0,
      totalEmpresas: new Set(all.map(c => c.empresa)).size,
      totalProdutos: new Set(all.map(c => c.produto_comercial)).size,
      totalPrincipiosAtivos: new Set(all.filter(c => c.principio_ativo).map(c => c.principio_ativo)).size,
      ultimaAtualizacao: all[0]?.created_at ?? null,
      totalCotacoes: all.length,
    };
  }

  async comparar(principioAtivo: string) {
    const cotacoes = await this.repo.find({
      where: { principio_ativo: ILike(`%${principioAtivo}%`) },
      order: { preco_unitario: 'ASC' },
    });
    if (!cotacoes.length) return { principioAtivo, cotacoes: [], resumo: null };
    const precos = cotacoes.map(c => Number(c.preco_unitario));
    const menor = Math.min(...precos), maior = Math.max(...precos);
    return {
      principioAtivo,
      cotacoes,
      resumo: {
        menorPreco: menor,
        maiorPreco: maior,
        precoMedio: precos.reduce((a, b) => a + b, 0) / precos.length,
        diferencaPercentual: maior > 0 ? ((maior - menor) / maior) * 100 : 0,
        totalEmpresas: new Set(cotacoes.map(c => c.empresa)).size,
      },
    };
  }

  async getPrecoPorSegmento() {
    const all = await this.repo.find();
    const map: Record<string, number[]> = {};
    for (const c of all) {
      if (!map[c.segmento]) map[c.segmento] = [];
      map[c.segmento].push(Number(c.preco_unitario));
    }
    return Object.entries(map).map(([segmento, p]) => ({
      segmento,
      mediaPreco: p.reduce((a, b) => a + b, 0) / p.length,
      total: p.length,
    }));
  }

  async getRankingEmpresas() {
    const all = await this.repo.find();
    const map: Record<string, number[]> = {};
    for (const c of all) {
      if (!map[c.empresa]) map[c.empresa] = [];
      map[c.empresa].push(Number(c.preco_unitario));
    }
    return Object.entries(map)
      .map(([empresa, p]) => ({
        empresa,
        mediaPreco: p.reduce((a, b) => a + b, 0) / p.length,
        totalCotacoes: p.length,
      }))
      .sort((a, b) => a.mediaPreco - b.mediaPreco)
      .slice(0, 5);
  }

  async getEvolucaoPrecos(dias = 30) {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);
    const all = await this.repo.find({
      where: { created_at: Between(inicio, new Date()) as any },
      order: { created_at: 'ASC' },
    });
    const map: Record<string, number[]> = {};
    for (const c of all) {
      const d = new Date(c.created_at).toISOString().split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(Number(c.preco_unitario));
    }
    return Object.entries(map).map(([data, p]) => ({
      data,
      mediaPreco: p.reduce((a, b) => a + b, 0) / p.length,
    }));
  }
}

@UseGuards(AuthGuard('jwt'))
@Controller('cotacoes-insumos')
export class CotacoesInsumosController {
  constructor(private readonly service: CotacoesInsumosService) {}

  @Post()
  create(@Body() dto: CreateCotacaoInsumoDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Get()
  findAll(
    @Query('empresa') empresa?: string,
    @Query('segmento') segmento?: Segmento,
    @Query('produto') produto?: string,
    @Query('principio_ativo') principio_ativo?: string,
    @Query('moeda') moeda?: Moeda,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.service.findAll({ empresa, segmento, produto, principio_ativo, moeda, data_inicio, data_fim });
  }

  @Get('dashboard')
  getDashboard() { return this.service.getDashboard(); }

  @Get('comparar')
  comparar(@Query('principio_ativo') pa: string) { return this.service.comparar(pa); }

  @Get('graficos/segmentos')
  getSegmentos() { return this.service.getPrecoPorSegmento(); }

  @Get('graficos/ranking-empresas')
  getRanking() { return this.service.getRankingEmpresas(); }

  @Get('graficos/evolucao')
  getEvolucao(@Query('dias') dias?: string) {
    return this.service.getEvolucaoPrecos(dias ? parseInt(dias) : 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCotacaoInsumoDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({
  imports: [TypeOrmModule.forFeature([CotacaoInsumo])],
  providers: [CotacoesInsumosService],
  controllers: [CotacoesInsumosController],
  exports: [CotacoesInsumosService],
})
export class CotacoesInsumosModule {}
