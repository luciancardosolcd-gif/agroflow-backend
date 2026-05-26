import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DocumentosService } from './documentos.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PermissionsGuard, RequirePermission } from '../auth/permissions.guard';

@ApiTags('Documentos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private service: DocumentosService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'gestor', 'operador')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('documentos', 'criar')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('admin', 'gestor')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('documentos', 'editar')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('documentos', 'deletar')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
