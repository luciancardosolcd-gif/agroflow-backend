import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Financeira } from '../financeira.entidade';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { TipoLancamento } from '../enums/tipo-lancamento.enum';
import { PeriodoFiltro } from '../enums/periodo-filtro.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Financeira)
    private readonly financeiroRepository: Repository<Financeira>,
  ) {}

  // ─── Resolve intervalo de datas conforme o período selecionado ───────────────
  private resolverPeriodo(filtro: FiltroDashboardDto): { dataInicio: Date; dataFim: Date } {
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    switch (filtro.periodo) {
      case PeriodoFiltro.MES_ATUAL:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;

      case PeriodoFiltro.MES_ANTERIOR:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59);
        break;

      case PeriodoFiltro.TRIMESTRE:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        break;

      case PeriodoFiltro.ANO_ATUAL:
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim = new Date(hoje.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case PeriodoFiltro.PERSONALIZADO:
        dataInicio = new Date(filtro.dataInicio);
        dataFim = new Date(filtro.dataFim);
        break;

      default:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    return { dataInicio, dataFim };
  }

  // ─── Monta o where base reutilizável ─────────────────────────────────────────
  private montarWhere(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);
    const where: any = { data: Between(dataInicio, dataFim) };

    if (filtro.fazendaId) where.fazendaId = filtro.fazendaId;
    if (filtro.safraId) where.safraId = filtro.safraId;

    return where;
  }

  // ─── Cards do topo: receita, despesa, saldo ───────────────────────────────────
  async buscarResumo(filtro: FiltroDashboardDto) {
    const where = this.montarWhere(filtro);

    const [receitas, despesas] = await Promise.all([
      this.financeiroRepository.sum('valor', { ...where, tipo: TipoLancamento.RECEITA }),
      this.financeiroRepository.sum('valor', { ...where, tipo: TipoLancamento.DESPESA }),
    ]);

    const totalReceitas = receitas ?? 0;
    const totalDespesas = despesas ?? 0;
    const saldo = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(2) : '0.00';

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      margemLucro: parseFloat(margemLucro),
    };
  }

  // ─── Gráfico: despesas agrupadas por categoria ────────────────────────────────
  async buscarDespesasPorCategoria(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select('f.categoria', 'categoria')
      .addSelect('SUM(f.valor)', 'total')
      .where('f.tipo = :tipo', { tipo: TipoLancamento.DESPESA })
      .andWhere('f.data BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim })
      .groupBy('f.categoria')
      .orderBy('total', 'DESC');

    if (filtro.fazendaId) query.andWhere('f.fazendaId = :fazendaId', { fazendaId: filtro.fazendaId });
    if (filtro.safraId) query.andWhere('f.safraId = :safraId', { safraId: filtro.safraId });

    const resultado = await query.getRawMany();

    return resultado.map((r) => ({
      categoria: r.categoria ?? 'Sem categoria',
      total: parseFloat(r.total),
    }));
  }

  // ─── Gráfico: evolução mensal de receitas x despesas ─────────────────────────
  async buscarEvolucaoMensal(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select("TO_CHAR(f.data, 'YYYY-MM')", 'mes')
      .addSelect('f.tipo', 'tipo')
      .addSelect('SUM(f.valor)', 'total')
      .where('f.data BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim })
      .groupBy("TO_CHAR(f.data, 'YYYY-MM'), f.tipo")
      .orderBy("TO_CHAR(f.data, 'YYYY-MM')", 'ASC');

    if (filtro.fazendaId) query.andWhere('f.fazendaId = :fazendaId', { fazendaId: filtro.fazendaId });
    if (filtro.safraId) query.andWhere('f.safraId = :safraId', { safraId: filtro.safraId });

    const rows = await query.getRawMany();

    // Agrupa por mês para facilitar o frontend
    const porMes: Record<string, { mes: string; receitas: number; despesas: number }> = {};
    for (const row of rows) {
      if (!porMes[row.mes]) porMes[row.mes] = { mes: row.mes, receitas: 0, despesas: 0 };
      if (row.tipo === TipoLancamento.RECEITA) porMes[row.mes].receitas = parseFloat(row.total);
      else porMes[row.mes].despesas = parseFloat(row.total);
    }

    return Object.values(porMes);
  }

  // ─── Gráfico: últimos lançamentos recentes ────────────────────────────────────
  async buscarLancamentosRecentes(filtro: FiltroDashboardDto, limite = 10) {
    const where = this.montarWhere(filtro);

    return this.financeiroRepository.find({
      where,
      order: { data: 'DESC' },
      take: limite,
    });
  }

  // ─── Endpoint único: tudo que o dashboard precisa em uma chamada ──────────────
  async buscarTodosDados(filtro: FiltroDashboardDto) {
    const [resumo, despesasPorCategoria, evolucaoMensal, lancamentosRecentes] = await Promise.all([
      this.buscarResumo(filtro),
      this.buscarDespesasPorCategoria(filtro),
      this.buscarEvolucaoMensal(filtro),
      this.buscarLancamentosRecentes(filtro),
    ]);

    return {
      resumo,
      despesasPorCategoria,
      evolucaoMensal,
      lancamentosRecentes,
    };
  }
}
