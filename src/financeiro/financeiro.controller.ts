import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, NotFoundException,
  Request, Query
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FinanceiroService } from './financeiro.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Propriedade } from '../propriedades/propriedade.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

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

  private async getFazendaId(userId: string): Promise<string | undefined> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.tenantId) return undefined;
    const prop = await this.propriedadesRepo.findOne({
      where: { tenantId: user.tenantId },
    });
    return prop?.id;
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('fazendaId') fazendaIdQuery?: string,
  ) {
    console.log('CONTROLLER V2 - fazendaId recebido:', fazendaIdQuery);

    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    let fazendaId: string | undefined;

    if (user && ACESSO_TOTAL.includes(user.email)) {
      if (!fazendaIdQuery) return [];
      fazendaId = fazendaIdQuery;
    } else {
      fazendaId = await this.getFazendaId(userId);
    }

    return this.service.findAll(fazendaId, user?.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (id === 'dashboard') {
      throw new NotFoundException(
        'Use /financeiro/dashboard/* para acessar o dashboard',
      );
    }
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'gestor', 'operador')
  async create(@Body() data: any, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const fazendaId = await this.getFazendaId(userId);
    return this.service.create({ ...data, fazendaId });
  }

  @Put(':id')
  @Roles('admin', 'gestor', 'operador')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
