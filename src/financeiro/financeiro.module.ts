import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Financeiro } from './financeiro.entity';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
 
@Module({
  imports: [TypeOrmModule.forFeature([Financeiro])],
  controllers: [FinanceiroController, DashboardController],
  providers: [FinanceiroService, DashboardService],
  exports: [FinanceiroService, DashboardService],
})
export class FinanceiroModule {}
 
