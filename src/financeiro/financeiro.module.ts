import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Financeiro } from './financeiro.entity';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Financeiro, User, Propriedade])],
  controllers: [FinanceiroController, DashboardController],
  providers: [FinanceiroService, DashboardService, PermissionsGuard],
  exports: [FinanceiroService, DashboardService],
})
export class FinanceiroModule {}
