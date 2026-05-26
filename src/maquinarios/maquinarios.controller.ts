import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MaquinariosService } from './maquinarios.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PermissionsGuard, RequirePermission } from '../auth/permissions.guard';

@ApiTags('Maquinarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('maquinarios')
export class MaquinariosController {
  constructor(private service: MaquinariosService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'gestor', 'operador')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('maquinarios', 'criar')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @Roles('admin', 'gestor')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('maquinarios', 'editar')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('maquinarios', 'deletar')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
