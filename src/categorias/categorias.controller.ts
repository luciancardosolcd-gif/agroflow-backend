import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoriasService } from './categorias.service';
import { CriarCategoriaDto, AtualizarCategoriaDto } from './categorias.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Categorias Financeiras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('categorias-financeiras')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get('arvore')
  @ApiOperation({ summary: 'Retorna árvore hierárquica completa de categorias' })
  listarArvore() {
    return this.service.listarArvore();
  }

  @Get('analiticas')
  @ApiOperation({ summary: 'Lista apenas categorias analíticas' })
  listarAnaliticas() {
    return this.service.listarAnaliticas();
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Busca categorias por nome ou código' })
  @ApiQuery({ name: 'q', description: 'Termo de busca' })
  buscar(@Query('q') termo: string) {
    return this.service.buscar(termo ?? '');
  }
@Get('resumo-dashboard')
@ApiOperation({ summary: 'Dashboard consolidado por categoria principal' })
async resumoDashboard(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('fazendaId') fazendaId?: string,
  @Query('safraId') safraId?: string,
  @Request() req?: any,
) {
  const userId = req.user.sub || req.user.userId;
  const user = await this.usersRepo.findOne({ where: { id: userId } });
  const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];
  if (user && !ACESSO_TOTAL.includes(user.email) && user.tenantId) {
    const prop = await this.propriedadesRepo.findOne({ where: { tenantId: user.tenantId } });
    fazendaId = prop?.id || 'none';
  }
  return this.service.getDashboard({ startDate, endDate, fazendaId, safraId });
}

  @Get(':id')
  @ApiOperation({ summary: 'Busca categoria por ID' })
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Post()
  @Roles('admin', 'gestor')
  @ApiOperation({ summary: 'Cria nova categoria' })
  criar(@Body() dto: CriarCategoriaDto) {
    return this.service.criar(dto);
  }

  @Put(':id')
  @Roles('admin', 'gestor')
  @ApiOperation({ summary: 'Atualiza categoria' })
  atualizar(@Param('id') id: string, @Body() dto: AtualizarCategoriaDto) {
    return this.service.atualizar(id, dto);
  }

  @Patch(':id/toggle')
  @Roles('admin')
  @ApiOperation({ summary: 'Ativa/desativa categoria' })
  toggleAtivo(@Param('id') id: string) {
    return this.service.toggleAtivo(id);
  }
} 
