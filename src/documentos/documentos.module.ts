import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './documento.entity';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documento, User])],
  controllers: [DocumentosController],
  providers: [DocumentosService, PermissionsGuard],
  exports: [DocumentosService],
})
export class DocumentosModule {}
