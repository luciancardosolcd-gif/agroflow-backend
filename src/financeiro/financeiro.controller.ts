import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FinanceiroService } from './financeiro.service';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(private service: FinanceiroService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Evita conflito com /financeiro/dashboard
    if (id === 'dashboard') {
      throw new NotFoundException('Use /financeiro/dashboard/* para acessar o dashboard');
    }
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'gestor')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles('admin', 'gestor')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
