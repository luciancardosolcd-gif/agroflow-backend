import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

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

  private isAdmin(user: User): boolean {
    return user?.perfil === 'admin';
  }

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || this.isAdmin(user)) {
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
    if (user && !this.isAdmin(user)) {
      obj.tenantId = user.tenantId;
    }
    return this.service.create(obj);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() data: any) {
    if (data.senha) {
      data.senhaHash = await bcrypt.hash(data.senha, 10);
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

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
