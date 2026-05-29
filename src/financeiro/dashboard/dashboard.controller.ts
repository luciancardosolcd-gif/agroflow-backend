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

  /**
   * Resolve o fazendaId correto:
   * - Se o frontend mandou fazendaId na query → usa ele (vale para qualquer usuário)
   * - Se não mandou E não é super admin → busca a fazenda do tenant do usuário
   * - Se não mandou E é super admin → undefined (busca tudo)
   */
  private async resolveFazendaId(
    req: any,
    filtro: FiltroDashboardDto,
  ): Promise<string | undefined> {
    // ✅ FIX: frontend mandou fazendaId explícito → respeita sempre
    if (filtro.fazendaId) return filtro.fazendaId;

    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) return undefined;

    // Super admin sem filtro explícito → vê tudo
    if (ACESSO_TOTAL.includes(user.email)) return undefined;

    // Usuário comum → filtra pela fazenda do seu tenant
    if (user.tenantId) {
      const prop = await this.propriedadesRepo.findOne({
        where: { tenantId: user.tenantId },
      });
      return prop?.id ?? 'none';
    }

    return 'none';
  }

  @Get()
  async buscarTodosDados(
    @Query() filtro: FiltroDashboardDto,
    @Request() req: any,
  ) {
    filtro.fazendaId = await this.resolveFazendaId(req, filtro);
    return this.dashboardService.buscarTodosDados(filtro);
  }

  @Get('resumo')
  async buscarResumo(
    @Query() filtro: FiltroDashboardDto,
    @Request() req: any,
  ) {
    filtro.fazendaId = await this.resolveFazendaId(req, filtro);
    return this.dashboardService.buscarResumo(filtro);
  }

  @Get('despesas-por-categoria')
  async buscarDespesasPorCategoria(
    @Query() filtro: FiltroDashboardDto,
    @Request() req: any,
  ) {
    filtro.fazendaId = await this.resolveFazendaId(req, filtro);
    return this.dashboardService.buscarDespesasPorCategoria(filtro);
  }

  @Get('evolucao-mensal')
  async buscarEvolucaoMensal(
    @Query() filtro: FiltroDashboardDto,
    @Request() req: any,
  ) {
    filtro.fazendaId = await this.resolveFazendaId(req, filtro);
    return this.dashboardService.buscarEvolucaoMensal(filtro);
  }

  @Get('recentes')
  async buscarLancamentosRecentes(
    @Query() filtro: FiltroDashboardDto,
    @Request() req: any,
  ) {
    filtro.fazendaId = await this.resolveFazendaId(req, filtro);
    return this.dashboardService.buscarLancamentosRecentes(filtro);
  }
}
