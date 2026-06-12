import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotacaoInsumo } from './cotacao-insumo.entity';
import { CotacoesInsumosService } from './cotacoes-insumos.service';
import { CotacoesInsumosController } from './cotacoes-insumos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CotacaoInsumo])],
  providers: [CotacoesInsumosService],
  controllers: [CotacoesInsumosController],
  exports: [CotacoesInsumosService],
})
export class CotacoesInsumosModule {}
