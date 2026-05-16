import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
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

  async buscarResumo(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository.createQueryBuilder('f');

    // Inclui registros com data no período OU com data nula (createdAt no período)
    query.where(
      '(f.data BETWEEN :dataInicio AND :dataFim OR (f.data IS NULL AND f.createdAt BETWEEN :dataInicio AND :dataFim))',
      { dataInicio, dataFim },
    );

    if (filtro.fazendaId) query.andWhere('f.fazendaId = :fazendaId', { fazendaId: filtro.fazendaId });
    if (filtro.safraId) query.andWhere('f.safraId = :safraId', { safraId: filtro.safraId });

    const lancamentos = await query.getMany();

    const totalReceitas = lancamentos
      .filter((l) => l.tipo === TipoLancamento.RECEITA)
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const totalDespesas = lancamentos
      .filter((l) => l.tipo === TipoLancamento.DESPESA)
      .reduce((acc, l) => acc + Number(l.valor), 0);

    const saldo = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? parseFloat(((saldo / totalReceitas) * 100).toFixed(2)) : 0;

    return { totalReceitas, totalDespesas, saldo, margemLucro };
  }

  async buscarDespesasPorCategoria(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select('f.categoria', 'categoria')
      .addSelect('SUM(f.valor)', 'total')
      .where('f.tipo = :tipo', { tipo: TipoLancamento.DESPESA })
      .andWhere(
        '(f.data BETWEEN :dataInicio AND :dataFim OR (f.data IS NULL AND f.createdAt BETWEEN :dataInicio AND :dataFim))',
        { dataInicio, dataFim },
      )
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

  async buscarEvolucaoMensal(filtro: FiltroDashboardDto) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    const query = this.financeiroRepository
      .createQueryBuilder('f')
      .select("TO_CHAR(COALESCE(f.data, f.createdAt), 'YYYY-MM')", 'mes')
      .addSelect('f.tipo', 'tipo')
      .addSelect('SUM(f.valor)', 'total')
      .where(
        '(f.data BETWEEN :dataInicio AND :dataFim OR (f.data IS NULL AND f.createdAt BETWEEN :dataInicio AND :dataFim))',
        { dataInicio, dataFim },
      )
      .groupBy("TO_CHAR(COALESCE(f.data, f.createdAt), 'YYYY-MM'), f.tipo")
      .orderBy("TO_CHAR(COALESCE(f.data, f.createdAt), 'YYYY-MM')", 'ASC');

    if (filtro.fazendaId) query.andWhere('f.fazendaId = :fazendaId', { fazendaId: filtro.fazendaId });
    if (filtro.safraId) query.andWhere('f.safraId = :safraId', { safraId: filtro.safraId });

    const rows = await query.getRawMany();
    const porMes: Record<string, { mes: string; receitas: number; despesas: number }> = {};

    for (const row of rows) {
      if (!porMes[row.mes]) porMes[row.mes] = { mes: row.mes, receitas: 0, despesas: 0 };
      if (row.tipo === TipoLancamento.RECEITA) porMes[row.mes].receitas = parseFloat(row.total);
      else porMes[row.mes].despesas = parseFloat(row.total);
    }

    return Object.values(porMes);
  }

  async buscarLancamentosRecentes(filtro: FiltroDashboardDto, limite = 10) {
    const { dataInicio, dataFim } = this.resolverPeriodo(filtro);

    return this.financeiroRepository
      .createQueryBuilder('f')
      .where(
        '(f.data BETWEEN :dataInicio AND :dataFim OR (f.data IS NULL AND f.createdAt BETWEEN :dataInicio AND :dataFim))',
        { dataInicio, dataFim },
      )
      .orderBy('f.createdAt', 'DESC')
      .take(limite)
      .getMany();
  }

  async buscarTodosDados(filtro: FiltroDashboardDto) {
    const [resumo, despesasPorCategoria, evolucaoMensal, lancamentosRecentes] = await Promise.all([
      this.buscarResumo(filtro),
      this.buscarDespesasPorCategoria(filtro),
      this.buscarEvolucaoMensal(filtro),
      this.buscarLancamentosRecentes(filtro),
    ]);
    return { resumo, despesasPorCategoria, evolucaoMensal, lancamentosRecentes };
  }
}
