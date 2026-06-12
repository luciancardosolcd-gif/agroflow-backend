import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CotacoesInsumosService } from './cotacoes-insumos.service';
import { CreateCotacaoInsumoDto } from './dto/create-cotacoes-insumos.dto';
import { Segmento, Moeda } from './cotacao-insumo.entity';

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
  getDashboard() {
    return this.service.getDashboard();
  }

  @Get('comparar')
  comparar(@Query('principio_ativo') principioAtivo: string) {
    return this.service.comparar(principioAtivo);
  }

  @Get('graficos/segmentos')
  getPrecoPorSegmento() {
    return this.service.getPrecoPorSegmento();
  }

  @Get('graficos/ranking-empresas')
  getRankingEmpresas() {
    return this.service.getRankingEmpresas();
  }

  @Get('graficos/evolucao')
  getEvolucao(@Query('dias') dias?: string) {
    return this.service.getEvolucaoPrecos(dias ? parseInt(dias) : 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCotacaoInsumoDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
