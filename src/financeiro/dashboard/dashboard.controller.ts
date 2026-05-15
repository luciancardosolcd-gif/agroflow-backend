import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Financeiro - Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('financeiro/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todos os dados do dashboard em uma chamada' })
  buscarTodosDados(@Query() filtro: FiltroDashboardDto) {
    return this.dashboardService.buscarTodosDados(filtro);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Cards do topo: receita total, despesa total, saldo e margem' })
  buscarResumo(@Query() filtro: FiltroDashboardDto) {
    return this.dashboardService.buscarResumo(filtro);
  }

  @Get('despesas-por-categoria')
  @ApiOperation({ summary: 'Gráfico de pizza: despesas agrupadas por categoria' })
  buscarDespesasPorCategoria(@Query() filtro: FiltroDashboardDto) {
    return this.dashboardService.buscarDespesasPorCategoria(filtro);
  }

  @Get('evolucao-mensal')
  @ApiOperation({ summary: 'Gráfico de linha: evolução mensal de receitas x despesas' })
  buscarEvolucaoMensal(@Query() filtro: FiltroDashboardDto) {
    return this.dashboardService.buscarEvolucaoMensal(filtro);
  }

  @Get('recentes')
  @ApiOperation({ summary: 'Últimos 10 lançamentos do período' })
  buscarLancamentosRecentes(@Query() filtro: FiltroDashboardDto) {
    return this.dashboardService.buscarLancamentosRecentes(filtro);
  }
}
