import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialCategory } from './financial-category.entity';
import { Financeiro } from '../financeiro/financeiro.entity';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialCategory, Financeiro, User, Propriedade])],
