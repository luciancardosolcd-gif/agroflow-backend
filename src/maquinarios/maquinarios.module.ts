import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maquinario } from './maquinario.entity';
import { MaquinariosService } from './maquinarios.service';
import { MaquinariosController } from './maquinarios.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Maquinario, User])],
  controllers: [MaquinariosController],
  providers: [MaquinariosService, PermissionsGuard],
  exports: [MaquinariosService],
})
export class MaquinariosModule {}
