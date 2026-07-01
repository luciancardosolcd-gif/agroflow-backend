import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talhao } from './talhao.entity';
import { TalhoesService } from './talhoes.service';
import { TalhoesController } from './talhoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Talhao])],
  controllers: [TalhoesController],
  providers: [TalhoesService],
})
export class TalhoesModule {}
