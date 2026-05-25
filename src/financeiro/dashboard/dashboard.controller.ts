import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { FiltroDashboardDto } from '../dto/filtro-dashboard.dto';
import { RolesGuard } from '../../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Propriedade } from '../../propriedades/propriedade.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@ApiTags('Financeiro - Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('fin-dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Propriedade)
    private propriedadesRepo: Repository<Propriedade>,
  ) {}

  private async getFazendaId(req: any): Promise<string | undefined> {
    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || ACESSO_TOTAL.includes(user.email)) return undefined;
    if (user.tenantId) {
      const prop = await this.propriedadesRepo.findOne({ where: { tenantId: user.tenantId } });
      return prop?.id;
    }
    return 'none';
  }

  @Get()
  async buscarTodosDados(@Query() filtro: FiltroDashboardDto, @Request() req: any) {
    const fazendaId = await this.getFazendaId(req);
    if (fazendaId) filtro.fazendaId = fazendaId;
    return this.dashboardService.buscarTodosDados(filtro);
  }

  @Get('resumo')
  async buscarResumo(@Query() filtro: FiltroDashboardDto, @Request() req: any) {
    const fazendaId = await this.getFazendaId(req);
    if (fazendaId) filtro.fazendaId = fazendaId;
    return this.dashboardService.buscarResumo(filtro);
  }

  @Get('despesas-por-categoria')
  async buscarDespesasPorCategoria(@Query() filtro: FiltroDashboardDto, @Request() req: any) {
    const fazendaId = await this.getFazendaId(req);
    if (fazendaId) filtro.fazendaId = fazendaId;
    return this.dashboardService.buscarDespesasPorCategoria(filtro);
  }

  @Get('evolucao-mensal')
  async buscarEvolucaoMensal(@Query() filtro: FiltroDashboardDto, @Request() req: any) {
    const fazendaId = await this.getFazendaId(req);
    if (fazendaId) filtro.fazendaId = fazendaId;
    return this.dashboardService.buscarEvolucaoMensal(filtro);
  }

  @Get('recentes')
  async buscarLancamentosRecentes(@Query() filtro: FiltroDashboardDto, @Request() req: any) {
    const fazendaId = await this.getFazendaId(req);
    if (fazendaId) filtro.fazendaId = fazendaId;
    return this.dashboardService.buscarLancamentosRecentes(filtro);
  }
}
