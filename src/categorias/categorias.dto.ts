import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarCategoriaDto {
  @ApiProperty({ example: '4.1.1.3.5' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Inseticida' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['sintetica', 'analitica'], default: 'analitica' })
  @IsOptional()
  @IsEnum(['sintetica', 'analitica'])
  type?: string;

  @ApiPropertyOptional({ enum: ['receita', 'despesa', 'neutro'], default: 'despesa' })
  @IsOptional()
  @IsEnum(['receita', 'despesa', 'neutro'])
  nature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: '#22c55e' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

export class AtualizarCategoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
