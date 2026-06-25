import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, IsNull, Or } from 'typeorm';
import { CotacaoInsumo, Segmento, Moeda } from './cotacao-insumo.entity';
import { CreateCotacaoInsumoDto } from './dto/create-cotacao-insumo.dto';

@Injectable()
export class CotacoesInsumosService {
  constructor(
    @InjectRepository(CotacaoInsumo)
    private readonly repo: Repository<CotacaoInsumo>,
  ) {}

  async create(dto: CreateCotacaoInsumoDto, usuarioId: string): Promise<CotacaoInsumo> {
    const cotacao = this.repo.create({ ...dto, usuario_id: usuarioId });
    return this.repo.save(cotacao);
  }

  async findAll(filters?: {
    empresa?: string;
    segmento?: Segmento;
    produto?: string;
    principio_ativo?: string;
    moeda?: Moeda;
    data_inicio?: string;
    data_fim?: string;
    fazendaId?: string;
  }): Promise<CotacaoInsumo[]> {
    const where: any = {};
    if (filters?.empresa) where.empresa = ILike(`%${filters.empresa}%`);
    if (filters?.segmento) where.segmento = filters.segmento;
    if (filters?.produto) where.produto_comercial = ILike(`%${filters.produto}%`);
    if (filters?.principio_ativo) where.principio_ativo = ILike(`%${filters.principio_ativo}%`);
    if (filters?.moeda) where.moeda = filters.moeda;
    if (filters?.fazendaId) where.fazenda_id = Or(filters.fazendaId, IsNull());
    if (filters?.data_inicio && filters?.data_fim) {
      where.data_cotacao = Between(filters.data_inicio, filters.data_fim);
    }
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<CotacaoInsumo> {
    const cotacao = await this.repo.findOne({ where: { id } });
    if (!cotacao) throw new NotFoundException('Cotação não encontrada');
    return cotacao;
  }

  async update(id: string, dto: Partial<CreateCotacaoInsumoDto>): Promise<CotacaoInsumo> {
    const cotacao = await this.findOne(id);
    Object.assign(cotacao, dto);
    return this.repo.save(cotacao);
  }

  async remove(id: string): Promise<void> {
    const cotacao = await this.findOne(id);
    await this.repo.remove(cotacao);
  }

  async getDashboard(fazendaId?: string) {
    const where: any = {};
    if (fazendaId) where.fazenda_id = Or(fazendaId, IsNull());
    const todas = await this.repo.find({ where, order: { created_at: 'DESC' } });

    const totalEmpresas = new Set(todas.map((c) => c.empresa)).size;
    const totalProdutos = new Set(todas.map((c) => c.produto_comercial)).size;
    const totalPrincipios = new Set(todas.filter((c) => c.principio_ativo).map((c) => c.principio_ativo)).size;

    const precosBRL = todas.filter((c) => c.moeda === Moeda.REAL && c.preco_unitario > 0).map((c) => Number(c.preco_unitario));
    const menorCotacao = precosBRL.length ? Math.min(...precosBRL) : 0;
    const maiorCotacao = precosBRL.length ? Math.max(...precosBRL) : 0;
    const economiaPotencial = maiorCotacao - menorCotacao;
    const ultimaAtualizacao = todas[0]?.created_at ?? null;

    return {
      menorCotacao, maiorCotacao, economiaPotencial,
      totalEmpresas, totalProdutos, totalPrincipiosAtivos: totalPrincipios,
      ultimaAtualizacao, totalCotacoes: todas.length,
    };
  }

  async comparar(principioAtivo: string) {
    const cotacoes = await this.repo.find({
      where: { principio_ativo: ILike(`%${principioAtivo}%`) },
      order: { preco_unitario: 'ASC' },
    });

    if (!cotacoes.length) return { principioAtivo, cotacoes: [], resumo: null };

    const precos = cotacoes.map((c) => Number(c.preco_unitario));
    const menor = Math.min(...precos);
    const maior = Math.max(...precos);
    const media = precos.reduce((a, b) => a + b, 0) / precos.length;
    const diferencaPercent = maior > 0 ? ((maior - menor) / maior) * 100 : 0;
    const empresas = new Set(cotacoes.map((c) => c.empresa)).size;

    return {
      principioAtivo, cotacoes,
      resumo: { menorPreco: menor, maiorPreco: maior, precoMedio: media, diferencaPercentual: diferencaPercent, totalEmpresas: empresas },
    };
  }

  async getPrecoPorSegmento(fazendaId?: string) {
    const where: any = {};
    if (fazendaId) where.fazenda_id = Or(fazendaId, IsNull());
    const cotacoes = await this.repo.find({ where });
    const por: Record<string, number[]> = {};
    for (const c of cotacoes) {
      if (!por[c.segmento]) por[c.segmento] = [];
      por[c.segmento].push(Number(c.preco_unitario));
    }
    return Object.entries(por).map(([segmento, precos]) => ({
      segmento,
      mediaPreco: precos.reduce((a, b) => a + b, 0) / precos.length,
      total: precos.length,
    }));
  }

  async getRankingEmpresas(fazendaId?: string) {
    const where: any = {};
    if (fazendaId) where.fazenda_id = Or(fazendaId, IsNull());
    const cotacoes = await this.repo.find({ where });
    const empresaMap: Record<string, { precos: number[]; total: number }> = {};
    for (const c of cotacoes) {
      if (!empresaMap[c.empresa]) empresaMap[c.empresa] = { precos: [], total: 0 };
      empresaMap[c.empresa].precos.push(Number(c.preco_unitario));
      empresaMap[c.empresa].total++;
    }
    return Object.entries(empresaMap)
      .map(([empresa, data]) => ({
        empresa,
        mediaPreco: data.precos.reduce((a, b) => a + b, 0) / data.precos.length,
        totalCotacoes: data.total,
      }))
      .sort((a, b) => a.mediaPreco - b.mediaPreco)
      .slice(0, 5);
  }

  async getEvolucaoPrecos(dias: number = 30, fazendaId?: string) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    const where: any = { created_at: Between(dataInicio, new Date()) as any };
    if (fazendaId) where.fazenda_id = Or(fazendaId, IsNull());
    const cotacoes = await this.repo.find({ where, order: { created_at: 'ASC' } });

    const porDia: Record<string, number[]> = {};
    for (const c of cotacoes) {
      const dia = new Date(c.created_at).toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(Number(c.preco_unitario));
    }
    return Object.entries(porDia).map(([data, precos]) => ({
      data,
      mediaPreco: precos.reduce((a, b) => a + b, 0) / precos.length,
    }));
  }

  calcularPrecoUnitario(cotacao: CotacaoInsumo) {
    const preco = Number(cotacao.preco_unitario);
    const volume = Number(cotacao.volume_embalagem) || 1;
    const concentracao = Number(cotacao.concentracao) || 0;
    return {
      precoPorLitroKg: preco / volume,
      precoPorGramaIA: concentracao > 0 ? preco / (volume * concentracao) : null,
      precoTotal: preco,
    };
  }
}
