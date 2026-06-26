import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talhao } from './talhao.entity';
import { TalhoesService } from './talhoes.service';
import { TalhoesController } from './talhoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Talhao])],
  providers: [TalhoesService],
  controllers: [TalhoesController],
})
export class TalhoesModule {}
