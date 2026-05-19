import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialCategory } from './financial-category.entity';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialCategory])],
  controllers: [CategoriasController],
  providers: [CategoriasService, RolesGuard],
  exports: [CategoriasService],
})
export class CategoriasModule {}
