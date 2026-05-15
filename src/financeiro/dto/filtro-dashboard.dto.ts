import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodoFiltro } from '../enums/periodo-filtro.enum';

export class FiltroDashboardDto {
  @ApiPropertyOptional({ enum: PeriodoFiltro, default: PeriodoFiltro.MES_ATUAL })
  @IsOptional()
  @IsEnum(PeriodoFiltro)
  periodo?: PeriodoFiltro = PeriodoFiltro.MES_ATUAL;

  @ApiPropertyOptional({ description: 'ID da fazenda para filtrar' })
  @IsOptional()
  @IsUUID()
  fazendaId?: string;

  @ApiPropertyOptional({ description: 'ID da safra para filtrar' })
  @IsOptional()
  @IsUUID()
  safraId?: string;

  @ApiPropertyOptional({ description: 'Data início (para período PERSONALIZADO)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ description: 'Data fim (para período PERSONALIZADO)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
