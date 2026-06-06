import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Financeiro } from '../financeiro.entity';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { TipoLancamento } from '../enums/tipo-lancamento.enum';
import { PeriodoFiltro } from '../enums/periodo-filtro.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Financeiro)
    private readonly financeiroRepository: Repository<Financeiro>,
  ) {}

  private resolverPeriodo(filtro: FiltroDashboardDto): { dataInicio: string; dataFim: string } {
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date;

    switch (filtro.periodo) {
      case PeriodoFiltro.MES_ATUAL:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case PeriodoFiltro.MES_ANTERIOR:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        dataFim    = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case PeriodoFiltro.TRIMESTRE:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        dataFim    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case PeriodoFiltro.ANO_ATUAL:
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim    = new Date(hoje.getFullYear(), 11, 31);
        break;
      case PeriodoFiltro.PERSONALIZADO:
        dataInicio = new Date(filtro.dataInicio);
        dataFim    = new Date(filtro.dataFim);
        break;
      default:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }

    // Retorna strings ISO (YYYY-MM-DD) para evitar problemas de timezone no PostgreSQL
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { dataInicio: fmt(dataInicio), dataFim: fmt(dataFim) };
  }

  async buscarResumo(filtro: FiltroDashboardDto) {
    if (!filtro.fazendaId) return { totalReceitas: 0, totalDespesas: 0, saldo: 0, margemLucro: 0 };

    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository.createQueryBuilder('f')
      .where('f."fazendaId" = :fazendaId', { fazendaId: filtro.fazendaId })
      .andWhere('COALESCE(f.data::text, f."createdAt"::date::text) BETWEEN :dataInicio AND :dataFim',
        { dataInicio, dataFim });

    if (filtro.safraId) query.andWhere('f."safraId" = :safraId', { safraId: filtro.safraId });

    const lancamentos = await query.getMany();

    const totalReceitas = lancamentos
      .filter(l => l.tipo === TipoLancamento.RECEITA)
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const totalDespesas = lancamentos
      .filter(l => l.tipo === TipoLancamento.DESPESA)
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const saldo = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0
      ? parseFloat(((saldo / totalReceitas) * 100).toFixed(2))
      : 0;

    return { totalReceitas, totalDespesas, saldo, margemLucro };
  }

  async buscarDespesasPorCategoria(filtro: FiltroDashboardDto) {
    if (!filtro.fazendaId) return [];

    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select('f.categoria', 'categoria')
      .addSelect('SUM(f.valor)', 'total')
      .where('f.tipo = :tipo', { tipo: TipoLancamento.DESPESA })
      .andWhere('f."fazendaId" = :fazendaId', { fazendaId: filtro.fazendaId })
      .andWhere('COALESCE(f.data::text, f."createdAt"::date::text) BETWEEN :dataInicio AND :dataFim',
        { dataInicio, dataFim })
      .groupBy('f.categoria')
      .orderBy('total', 'DESC');

    if (filtro.safraId) query.andWhere('f."safraId" = :safraId', { safraId: filtro.safraId });

    const resultado = await query.getRawMany();
    return resultado.map(r => ({
      categoria: r.categoria ?? 'Sem categoria',
      total: parseFloat(r.total),
    }));
  }

  async buscarEvolucaoMensal(filtro: FiltroDashboardDto) {
    if (!filtro.fazendaId) return [];

    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select("TO_CHAR(COALESCE(f.data, f.\"createdAt\"::date), 'YYYY-MM')", 'mes')
      .addSelect('f.tipo', 'tipo')
      .addSelect('SUM(f.valor)', 'total')
      .where('f."fazendaId" = :fazendaId', { fazendaId: filtro.fazendaId })
      .andWhere('COALESCE(f.data::text, f."createdAt"::date::text) BETWEEN :dataInicio AND :dataFim',
        { dataInicio, dataFim })
      .groupBy("TO_CHAR(COALESCE(f.data, f.\"createdAt\"::date), 'YYYY-MM'), f.tipo")
      .orderBy("TO_CHAR(COALESCE(f.data, f.\"createdAt\"::date), 'YYYY-MM')", 'ASC');

    if (filtro.safraId) query.andWhere('f."safraId" = :safraId', { safraId: filtro.safraId });

    const rows = await query.getRawMany();
    const porMes: Record<string, { mes: string; receitas: number; despesas: number }> = {};

    for (const row of rows) {
      if (!porMes[row.mes]) porMes[row.mes] = { mes: row.mes, receitas: 0, despesas: 0 };
      if (row.tipo === TipoLancamento.RECEITA) porMes[row.mes].receitas = parseFloat(row.total);
      else porMes[row.mes].despesas = parseFloat(row.total);
    }

    return Object.values(porMes);
  }

  async buscarLancamentosRecentes(filtro: FiltroDashboardDto) {
    if (!filtro.fazendaId) return [];

    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .where('f."fazendaId" = :fazendaId', { fazendaId: filtro.fazendaId })
      .andWhere('COALESCE(f.data::text, f."createdAt"::date::text) BETWEEN :dataInicio AND :dataFim',
        { dataInicio, dataFim })
      .orderBy('f.data', 'DESC')
      .addOrderBy('f."createdAt"', 'DESC');

    if (filtro.safraId) query.andWhere('f."safraId" = :safraId', { safraId: filtro.safraId });

    return query.getMany();
  }

  async buscarTodosDados(filtro: FiltroDashboardDto) {
    const [resumo, despesasPorCategoria, evolucaoMensal, lancamentosRecentes] =
      await Promise.all([
        this.buscarResumo(filtro),
        this.buscarDespesasPorCategoria(filtro),
        this.buscarEvolucaoMensal(filtro),
        this.buscarLancamentosRecentes(filtro),
      ]);

    return { resumo, despesasPorCategoria, evolucaoMensal, lancamentosRecentes };
  }
}
