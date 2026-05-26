import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ContratosService } from './contratos.service';
import { PermissionsGuard, RequirePermission } from '../auth/permissions.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Contratos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private service: ContratosService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('contratos', 'criar')
  create(@Body() data: any) { return this.service.create(data); }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('contratos', 'editar')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @RequirePermission('contratos', 'deletar')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
