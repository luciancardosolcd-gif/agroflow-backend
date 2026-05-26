import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estoque } from './estoque.entity';
import { EstoqueService } from './estoque.service';
import { EstoqueController } from './estoque.controller';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Estoque])],
  controllers: [EstoqueController],
  providers: [EstoqueService, PermissionsGuard],
  exports: [EstoqueService],
})
export class EstoqueModule {}
