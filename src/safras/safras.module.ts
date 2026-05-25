import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Safra } from './safra.entity';
import { SafrasService } from './safras.service';
import { SafrasController } from './safras.controller';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Safra, User, Propriedade])],
  controllers: [SafrasController],
  providers: [SafrasService],
  exports: [SafrasService],
})
export class SafrasModule {}
