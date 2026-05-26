import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fornecedor } from './fornecedor.entity';
import { FornecedoresService } from './fornecedores.service';
import { FornecedoresController } from './fornecedores.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fornecedor, User])],
  controllers: [FornecedoresController],
  providers: [FornecedoresService, PermissionsGuard],
  exports: [FornecedoresService],
})
export class FornecedoresModule {}
