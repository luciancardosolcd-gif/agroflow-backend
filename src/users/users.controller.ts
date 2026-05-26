import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private service: UsersService,
    @InjectRepository(User)
    private usersRepo: Repository<User>, 
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || ACESSO_TOTAL.includes(user.email)) {
      return this.service.findAll();
    }
    return this.usersRepo.find({ where: { tenantId: user.tenantId } });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() body: any, @Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const senha = body.senha || 'Agroflow@2026';
    const hash = await bcrypt.hash(senha, 10);
    const obj: any = {
      nome: body.nome,
      email: body.email,
      senhaHash: hash,
      perfil: body.perfil || 'operador',
      status: body.status || 'ativo',
    };
    if (user && !ACESSO_TOTAL.includes(user.email)) {
      obj.tenantId = user.tenantId;
    }
    return this.service.create(obj);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() data: any) {
    if (data.senha) {
      data.senhaHash = await bcrypt.hash(data.senha, 10);
      git add .
git commit -m "add permissions endpoint"
git push
      delete data.senha;
    }
    if (data.novaSenha) {
      data.senhaHash = await bcrypt.hash(data.novaSenha, 10);
      delete data.novaSenha;
    }
    if (!data.dataExpiracao) {
      delete data.dataExpiracao;
    }
    return this.service.update(id, data);
  }

  @Put(':id/permissions')
  @Roles('admin')
  async updatePermissions(@Param('id') id: string, @Body() body: any) {
    return this.service.updatePermissions(id, body.permissoes);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
