import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estoque } from './estoque.entity';
import { EstoqueService } from './estoque.service';
import { EstoqueController } from './estoque.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estoque, User])],
  controllers: [EstoqueController],
  providers: [EstoqueService, PermissionsGuard],
  exports: [EstoqueService],
})
export class EstoqueModule {}
