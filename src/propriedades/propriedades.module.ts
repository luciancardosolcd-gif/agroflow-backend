import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Propriedade } from './propriedade.entity';
import { PropriedadesService } from './propriedades.service';
import { PropriedadesController } from './propriedades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Propriedade])],
  controllers: [PropriedadesController],
  providers: [PropriedadesService],
  exports: [PropriedadesService],
})
export class PropriedadesModule {}
