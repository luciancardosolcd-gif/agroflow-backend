import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoriasService } from './categorias.service';
import { CriarCategoriaDto, AtualizarCategoriaDto } from './categorias.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@ApiTags('Categorias Financeiras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categorias-financeiras')
export class CategoriasController {
  constructor(
    private readonly service: CategoriasService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Propriedade)
    private propriedadesRepo: Repository<Propriedade>,
  ) {}

  @Get('arvore')
  listarArvore() {
    return this.service.listarArvore();
  }

  @Get('analiticas')
  listarAnaliticas() {
    return this.service.listarAnaliticas();
  }

  @Get('buscar')
  @ApiQuery({ name: 'q', description: 'Termo de busca' })
  buscar(@Query('q') termo: string) {
    return this.service.buscar(termo ?? '');
  }

  @Get('resumo-dashboard')
async resumoDashboard(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('fazendaId') fazendaId?: string,
  @Query('safraId') safraId?: string,
  @Request() req?: any,
) {
  const userId = req.user.sub || req.user.userId;
  const user = await this.usersRepo.findOne({ where: { id: userId } });
  if (user?.tenantId && !(user?.perfil === 'admin' && !user?.tenantId)) {
    const prop = await this.propriedadesRepo.findOne({ where: { tenantId: user.tenantId } });
    fazendaId = prop?.id || 'none';
  }
  return this.service.getDashboard({ startDate, endDate, fazendaId, safraId });
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'gestor')
  criar(@Body() dto: CriarCategoriaDto) {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'gestor')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarCategoriaDto) {
    return this.service.atualizar(id, dto);
  }

  @Patch(':id/toggle')
  @Roles('admin')
  toggleAtivo(@Param('id') id: string) {
    return this.service.toggleAtivo(id);
  }
}
