import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClientesService } from './clientes.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PermissionsGuard, RequirePermission } from '../auth/permissions.guard';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private service: ClientesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'gestor', 'operador')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('clientes', 'criar')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('admin', 'gestor')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('clientes', 'editar')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('clientes', 'deletar')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
