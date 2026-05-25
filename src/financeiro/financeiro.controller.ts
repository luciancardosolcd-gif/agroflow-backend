import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FinanceiroService } from './financeiro.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';

@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(
    private service: FinanceiroService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Propriedade)
    private propriedadesRepo: Repository<Propriedade>,
  ) {}

  @Get()
async findAll(@Request() req: any) {
  const userId = req.user.sub || req.user.userId;
  const user = await this.usersRepo.findOne({ where: { id: userId } });
  console.log('FINANCEIRO USER:', user?.email, 'tenantId:', user?.tenantId);
  let fazendaId: string | undefined;
  if (user?.tenantId) {
    const prop = await this.propriedadesRepo.findOne({ where: { tenantId: user.tenantId } });
    console.log('FINANCEIRO PROP:', prop?.nome, 'fazendaId:', prop?.id);
    fazendaId = prop?.id;
  }
  console.log('FINANCEIRO FILTER fazendaId:', fazendaId);
  return this.service.findAll(fazendaId, user?.email);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
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
